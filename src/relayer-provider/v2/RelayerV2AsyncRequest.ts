/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/consistent-type-definitions */
import type {
  RelayerPostOperation,
  RelayerApiErrorType,
  Auth,
} from '../types/public-api';
import {
  assertIsRelayerV2ResponseFailedWithError500,
  assertIsRelayerV2ResponseFailedWithError400,
  assertIsRelayerV2ResponseFailedWithError429,
  assertIsRelayerV2ResponseFailedWithError503,
  assertIsRelayerV2ResponseFailedWithError404,
} from './guards/RelayerV2ResponseFailed';
import type {
  RelayerV2ResultUserDecrypt,
  RelayerV2PostResponseStatus,
  RelayerV2GetResponseStatus,
  RelayerV2ResultInputProofAccepted,
  RelayerV2ResultPublicDecrypt,
  RelayerV2ResultInputProof,
  RelayerV2ResultInputProofRejected,
} from './types';
import type {
  RelayerFailureStatus,
  RelayerProgressSucceededType,
  RelayerProgressQueuedType,
  RelayerProgressRateLimitedType,
  RelayerProgressTimeoutType,
  RelayerProgressFailedType,
  RelayerProgressAbortType,
  RelayerInputProofOptionsType,
  RelayerUserDecryptOptionsType,
  RelayerPublicDecryptOptionsType,
  RelayerInputProofProgressArgs,
  RelayerUserDecryptProgressArgs,
  RelayerPublicDecryptProgressArgs,
  RelayerPublicDecryptResult,
  RelayerInputProofResult,
  RelayerUserDecryptResult,
} from '../types/public-api';
import { isUint } from '@base/uint';
import { setAuth } from '../auth/auth';
import { RelayerV2ResponseInvalidBodyError } from './errors/RelayerV2ResponseInvalidBodyError';
import { RelayerV2ResponseStatusError } from './errors/RelayerV2ResponseStatusError';
import { assertIsRelayerV2GetResponseInputProofSucceeded } from './guards/RelayerV2GetResponseInputProofSucceeded';
import { assertIsRelayerV2GetResponsePublicDecryptSucceeded } from './guards/RelayerV2GetResponsePublicDecryptSucceeded';
import { assertIsRelayerV2GetResponseUserDecryptSucceeded } from './guards/RelayerV2GetResponseUserDecryptSucceeded';
import { RelayerV2RequestInternalError } from './errors/RelayerV2RequestInternalError';
import { InvalidPropertyError } from '../../errors/InvalidPropertyError';
import { RelayerV2ResponseApiError } from './errors/RelayerV2ResponseApiError';
import { RelayerV2FetchError } from './errors/RelayerV2FetchError';
import { RelayerV2ResponseInputProofRejectedError } from './errors/RelayerV2ResponseInputProofRejectedError';
import { RelayerV2StateError } from './errors/RelayerV2StateError';
import { RelayerV2MaxRetryError } from './errors/RelayerV2MaxRetryError';
import {
  assertIsRelayerV2GetResponseQueued,
  assertIsRelayerV2PostResponseQueued,
} from './guards/RelayerV2ResponseQueued';
import { safeJSONstringify } from '@base/string';
import { sdkName, version } from '../../_version';
import { RelayerV2TimeoutError } from './errors/RelayerV2TimeoutError';
import { RelayerV2AbortError } from './errors/RelayerV2AbortError';
import { assertNever } from '../../errors/utils';

/*
    Actions:
    ========
    Run
    Cancel

    Events:
    =======
    JobCompleted
    SignalAbort 

    Reason:
    =======
    Canceled
    Aborted

    NOT_RUNNING ---JobCompleted---> Error! (impossible)
    RUNNING     ---JobCompleted---> TERMINATED(Reason=completed) 
    TERMINATED  ---JobCompleted---> Error! (impossible)
    CANCELED    ---JobCompleted---> Error! (impossible)
    
    NOT_RUNNING ---Cancel---> TERMINATED(Reason=canceled) 
    RUNNING     ---Cancel---> TERMINATED(Reason=canceled) 
    TERMINATED  ---Cancel---> Error!
    CANCELED    ---Cancel---> Error! or Nothing

    NOT_RUNNING ---Run---> RUNNING
    RUNNING     ---Run---> Nothing 
    TERMINATED  ---Run---> Error!
    CANCELED    ---Run---> Error!

    NOT_RUNNING ---SignalAbort---> TERMINATED(Reason=aborted)
    RUNNING     ---SignalAbort---> TERMINATED(Reason=aborted)
    TERMINATED  ---SignalAbort---> Error! (impossible because when terminated the request does not listen to 'abort' anymore)
    CANCELED    ---SignalAbort---> Error! or Nothing
*/

// Properties should be in alphabetical order to have a deterministing JSON.stringify result
export type RelayerV2AsyncRequestState = {
  aborted: boolean;
  canceled: boolean;
  failed: boolean;
  fetching: boolean;
  running: boolean;
  succeeded: boolean;
  terminated: boolean;
  timeout: boolean;
};

type RelayerV2AsyncRequestParams = {
  relayerOperation: RelayerPostOperation;
  url: string;
  payload: Record<string, unknown>;
  timeoutInSeconds?: number | undefined;
  throwErrorIfNoRetryAfter?: boolean | undefined;
  options?:
    | RelayerInputProofOptionsType
    | RelayerUserDecryptOptionsType
    | RelayerPublicDecryptOptionsType
    | undefined;
};

export type RelayerV2TerminateReason =
  | 'succeeded'
  | 'failed'
  | 'timeout'
  | 'abort';

export class RelayerV2AsyncRequest {
  private readonly _debug: boolean;
  private _fetchMethod: 'GET' | 'POST' | undefined;
  private _elapsed: number;
  private _jobId: string | undefined;
  private _jobIdTimestamp: number | undefined;
  private readonly _state: RelayerV2AsyncRequestState;
  private readonly _relayerOperation: RelayerPostOperation;
  private _internalAbortController: AbortController | undefined;
  private _internalAbortSignal: AbortSignal | undefined;
  private _externalAbortSignal: AbortSignal | undefined;
  private _terminateReason: RelayerV2TerminateReason | undefined;
  private _terminateError: unknown;
  private _retryCount: number;
  private _totalSteps: number;
  private _step: number;
  private _retryAfterTimeoutID: ReturnType<typeof setTimeout> | undefined;
  private readonly _url: string;
  private readonly _payload: Record<string, unknown>;
  private readonly _fhevmAuth: Auth | undefined;
  private _retryAfterTimeoutPromiseFuncReject?:
    | ((reason?: unknown) => void)
    | undefined;
  private readonly _onProgress?:
    | ((
        args:
          | RelayerInputProofProgressArgs
          | RelayerUserDecryptProgressArgs
          | RelayerPublicDecryptProgressArgs,
      ) => void)
    | undefined;
  private readonly _requestMaxDurationInMs: number;
  private _requestStartTimestamp: number | undefined;
  private _requestGlobalTimeoutID: ReturnType<typeof setTimeout> | undefined;
  private readonly _throwErrorIfNoRetryAfter: boolean;

  private static readonly DEFAULT_RETRY_AFTER_MS = 2500;
  private static readonly MINIMUM_RETRY_AFTER_MS = 1000;
  private static readonly DEFAULT_GLOBAL_REQUEST_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour
  private static readonly MAX_GET_RETRY = 60 * 30; // number of default retries in 1 hour (30 retries/min)
  private static readonly MAX_POST_RETRY = RelayerV2AsyncRequest.MAX_GET_RETRY;

  constructor(params: RelayerV2AsyncRequestParams) {
    if (
      (params.relayerOperation as unknown) !== 'INPUT_PROOF' &&
      (params.relayerOperation as unknown) !== 'PUBLIC_DECRYPT' &&
      (params.relayerOperation as unknown) !== 'USER_DECRYPT'
    ) {
      throw new InvalidPropertyError({
        objName: 'RelayerV2AsyncRequestParams',
        property: 'relayerOperation',
        expectedType: 'string',
        value: params.relayerOperation,
        expectedValue: 'INPUT_PROOF | PUBLIC_DECRYPT | USER_DECRYPT',
      });
    }

    this._step = 0;
    this._totalSteps = 1;
    this._elapsed = 0;
    this._relayerOperation = params.relayerOperation;
    this._internalAbortController = new AbortController();
    this._internalAbortSignal = this._internalAbortController.signal;
    this._internalAbortSignal.addEventListener(
      'abort',
      this._handleInternalSignalAbort,
    );
    this._externalAbortSignal = params.options?.signal;
    if (this._externalAbortSignal) {
      this._externalAbortSignal.addEventListener(
        'abort',
        this._handleExternalSignalAbort,
      );
    }
    this._url = params.url;
    this._payload = params.payload;
    this._debug = params.options?.debug === true;
    this._fhevmAuth = params.options?.auth;
    this._onProgress = params.options?.onProgress as typeof this._onProgress;
    this._state = {
      aborted: false,
      canceled: false,
      failed: false,
      fetching: false,
      running: false,
      succeeded: false,
      terminated: false,
      timeout: false,
    };
    this._retryCount = 0;
    this._retryAfterTimeoutID = undefined;
    this._requestGlobalTimeoutID = undefined;
    this._terminateReason = undefined;
    this._throwErrorIfNoRetryAfter = params.throwErrorIfNoRetryAfter ?? false;
    this._requestMaxDurationInMs =
      params.options?.timeout ??
      RelayerV2AsyncRequest.DEFAULT_GLOBAL_REQUEST_TIMEOUT_MS;
  }

  //////////////////////////////////////////////////////////////////////////////
  // Public API: run
  //////////////////////////////////////////////////////////////////////////////

  public async run(): Promise<
    | RelayerUserDecryptResult
    | RelayerPublicDecryptResult
    | RelayerInputProofResult
  > {
    if (this._state.terminated) {
      throw new RelayerV2StateError({
        message: `Relayer.run() failed. Request already terminated.`,
        state: { ...this._state },
      });
    }

    if (this._state.canceled) {
      throw new RelayerV2StateError({
        message: `Relayer.run() failed. Request already canceled.`,
        state: { ...this._state },
      });
    }

    if (this._state.succeeded) {
      throw new RelayerV2StateError({
        message: `Relayer.run() failed. Request already succeeded.`,
        state: { ...this._state },
      });
    }

    if (this._state.failed) {
      throw new RelayerV2StateError({
        message: `Relayer.run() failed. Request already failed.`,
        state: { ...this._state },
      });
    }

    if (this._state.aborted) {
      throw new RelayerV2StateError({
        message: `Relayer.run() failed. Request already aborted.`,
        state: { ...this._state },
      });
    }

    if (this._state.timeout) {
      throw new RelayerV2StateError({
        message: `Relayer.run() failed. Request already timeout.`,
        state: { ...this._state },
      });
    }

    if (this._externalAbortSignal?.aborted === true) {
      throw new RelayerV2StateError({
        message: `Relayer.run() failed. External AbortSignal already aborted (reason:${this._externalAbortSignal.reason}).`,
        state: { ...this._state },
      });
    }

    if (this._internalAbortSignal?.aborted === true) {
      throw new RelayerV2StateError({
        message: `Relayer.run() failed. Internal AbortSignal already aborted (reason:${this._internalAbortSignal.reason}).`,
        state: { ...this._state },
      });
    }

    if (this._state.running) {
      throw new RelayerV2StateError({
        message: `Relayer.run() failed. Request already running.`,
        state: { ...this._state },
      });
    }
    this._state.running = true;

    this._requestStartTimestamp = Date.now();
    this._setGlobalRequestTimeout(this._requestMaxDurationInMs);

    try {
      const json = await this._runPostLoop();

      this._state.succeeded = true;

      this._terminate('succeeded');

      return json;
    } catch (e) {
      this._state.failed = true;

      if ((e as { name: string }).name === 'AbortError') {
        this._assert(this._state.aborted, 'this._state.aborted');
        this._assert(this._state.terminated, 'this._state.terminated');
      }

      // Ignored if already terminated. For example, if abort has been previously called.
      this._terminate('failed', e);

      throw e;
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Public API: cancel
  //////////////////////////////////////////////////////////////////////////////

  private _canContinue(): boolean {
    return !(
      this._state.canceled ||
      this._state.terminated ||
      this._state.succeeded ||
      this._state.aborted
    );
  }

  public cancel(): void {
    if (!this._canContinue()) {
      this._trace('cancel', '!this._canContinue()');
      return;
    }

    this._state.canceled = true;
    this._internalAbortController?.abort('cancel');

    // Debug
    this._assert(this._state.aborted, 'this._state.aborted');
    this._assert(this._state.terminated, 'this._state.terminated');
  }

  //////////////////////////////////////////////////////////////////////////////
  // Public API: getters
  //////////////////////////////////////////////////////////////////////////////

  public get state(): RelayerV2AsyncRequestState {
    return { ...this._state };
  }

  public get canceled(): boolean {
    return this._state.canceled;
  }

  public get terminated(): boolean {
    return this._state.terminated;
  }

  public get terminateReason(): RelayerV2TerminateReason | undefined {
    return this._terminateReason;
  }

  public get terminateError(): unknown {
    return this._terminateError;
  }

  public get running(): boolean {
    return this._state.running;
  }

  public get fetching(): boolean {
    return this._state.fetching;
  }

  public get failed(): boolean {
    return this._state.failed;
  }

  public get aborted(): boolean {
    return this._state.aborted;
  }

  public get timeout(): boolean {
    return this._state.timeout;
  }

  public get succeeded(): boolean {
    return this._state.succeeded;
  }

  public get startTimeMs(): number | undefined {
    return this._requestStartTimestamp;
  }

  public get elapsedTimeMs(): number | undefined {
    if (this._requestStartTimestamp === undefined) {
      return undefined;
    }
    return Date.now() - this._requestStartTimestamp;
  }

  public get retryCount(): number {
    return this._retryCount;
  }

  //////////////////////////////////////////////////////////////////////////////
  // Post Loop
  //////////////////////////////////////////////////////////////////////////////

  // POST : 202 | 400 | 401 | 429 | 500 | 503
  private async _runPostLoop(): Promise<
    | RelayerPublicDecryptResult
    | RelayerUserDecryptResult
    | RelayerInputProofResult
  > {
    this._assert(
      this._fetchMethod === undefined,
      'this._fetchMethod === undefined',
    );
    this._fetchMethod = 'POST';

    // Until it is implemented. Silence linter.
    this._totalSteps = 1;
    this._step = 0;

    // No infinite loop!
    let i = 0;
    while (i < RelayerV2AsyncRequest.MAX_POST_RETRY) {
      ++i;

      this._assertCanContinueAfterAwait();

      // At this stage: `terminated` is guaranteed to be `false`.
      // However, the `fetch` call can potentially throw an `AbortError`. In this case
      // in the error catch the `terminated` flag will be `true`! But, that's ok because the
      // next part of the function will never be executed (thrown error).
      this._elapsed =
        this._jobId !== undefined ? Date.now() - this._jobIdTimestamp! : 0;
      const response = await this._fetchPost();

      // At this stage: `terminated` is guaranteed to be `false`.

      const responseStatus: RelayerV2PostResponseStatus =
        response.status as RelayerV2PostResponseStatus;

      switch (responseStatus) {
        // RelayerV2ResponseQueued
        case 202: {
          // response.json() errors:
          // 1. if body is already read (call json() 2 times)
          //    - TypeError: Body is unusable: Body has already been read
          // 2. if body is invalid JSON
          //    - SyntaxError: Unexpected end of JSON input
          //    - SyntaxError: Expected property name or '}' in JSON at position 1 (line 1 column 2) at JSON.parse (<anonymous>)
          const bodyJson = await this._getResponseJson(response);

          try {
            assertIsRelayerV2PostResponseQueued(bodyJson, 'body');
          } catch (cause) {
            this._throwResponseInvalidBodyError({
              status: responseStatus,
              cause: cause as InvalidPropertyError,
              bodyJson: safeJSONstringify(bodyJson),
            });
          }

          const retryAfterMs = this._getRetryAfterHeaderValueInMs(response);

          // Debug: will throw an assert failed error if jobId has already been set
          this._setJobIdOnce(bodyJson.result.jobId);

          // Async onProgress callback
          this._postAsyncOnProgressCallback({
            type: 'queued',
            url: this._url,
            method: 'POST',
            status: responseStatus,
            requestId: bodyJson.requestId,
            jobId: this.jobId,
            operation: this._relayerOperation,
            retryCount: this._retryCount,
            retryAfterMs,
            elapsed: this._elapsed,
            step: this._step,
            totalSteps: this._totalSteps,
          } satisfies RelayerProgressQueuedType<RelayerPostOperation>);

          await this._setRetryAfterTimeout(retryAfterMs);

          const json = await this._runGetLoop();
          return json;
        }
        // RelayerV2ResponseFailed
        // RelayerV2ApiError400
        // RelayerV2ApiError400WithDetails
        case 400: {
          const bodyJson = await this._getResponseJson(response);

          try {
            assertIsRelayerV2ResponseFailedWithError400(bodyJson, 'body');
          } catch (cause) {
            this._throwResponseInvalidBodyError({
              status: responseStatus,
              cause: cause as InvalidPropertyError,
              bodyJson: safeJSONstringify(bodyJson),
            });
          }

          this._throwRelayerV2ResponseApiError({
            status: responseStatus,
            relayerApiError: bodyJson.error,
          });
        }
        // RelayerV2ResponseFailed
        // RelayerV2ApiError401
        // falls through
        case 401: {
          this._throwUnauthorizedError(responseStatus);
        }
        // RelayerV2ResponseFailed
        // RelayerV2ApiError429
        // falls through
        case 429: {
          // Retry
          // Rate Limit error (Cloudflare/Kong/Relayer), reason in message
          const bodyJson = await this._getResponseJson(response);

          try {
            assertIsRelayerV2ResponseFailedWithError429(bodyJson, 'body');
          } catch (cause) {
            this._throwResponseInvalidBodyError({
              status: responseStatus,
              cause: cause as InvalidPropertyError,
              bodyJson: safeJSONstringify(bodyJson),
            });
          }

          const retryAfterMs = this._getRetryAfterHeaderValueInMs(response);

          // Async onProgress callback
          this._postAsyncOnProgressCallback({
            type: 'ratelimited',
            operation: this._relayerOperation,
            url: this._url,
            method: 'POST',
            status: responseStatus,
            retryAfterMs,
            retryCount: this._retryCount,
            elapsed: this._elapsed,
            relayerApiError: bodyJson.error,
            step: this._step,
            totalSteps: this._totalSteps,
          } satisfies RelayerProgressRateLimitedType<RelayerPostOperation>);

          // Wait if needed (minimum 1s)
          await this._setRetryAfterTimeout(retryAfterMs);

          continue;
        }
        // RelayerV2ResponseFailed
        // RelayerV2ApiError500
        case 500: {
          // Abort
          // Relayer internal error
          const bodyJson = await this._getResponseJson(response);

          try {
            assertIsRelayerV2ResponseFailedWithError500(bodyJson, 'body');
          } catch (cause) {
            this._throwResponseInvalidBodyError({
              status: responseStatus,
              cause: cause as InvalidPropertyError,
              bodyJson: safeJSONstringify(bodyJson),
            });
          }

          this._throwRelayerV2ResponseApiError({
            status: responseStatus,
            relayerApiError: bodyJson.error,
          });
        }
        // RelayerV2ResponseFailed
        // RelayerV2ApiError503
        // falls through
        case 503: {
          // Abort
          // Possible Reasons: Gateway has some internal error (unknown)
          const bodyJson = await this._getResponseJson(response);

          try {
            assertIsRelayerV2ResponseFailedWithError503(bodyJson, 'body');
          } catch (cause) {
            this._throwResponseInvalidBodyError({
              status: responseStatus,
              cause: cause as InvalidPropertyError,
              bodyJson: safeJSONstringify(bodyJson),
            });
          }

          this._throwRelayerV2ResponseApiError({
            status: responseStatus,
            relayerApiError: bodyJson.error,
          });
        }
        // falls through
        default: {
          // Use TS compiler + `never` to guarantee the switch integrity
          const throwUnsupportedStatus = (unsupportedStatus: never): never => {
            throw new RelayerV2ResponseStatusError({
              fetchMethod: 'POST',
              status: unsupportedStatus,
              url: this._url,
              operation: this._relayerOperation,
              elapsed: this._elapsed,
              retryCount: this._retryCount,
              state: { ...this._state },
            });
          };
          throwUnsupportedStatus(responseStatus);
        }
      }
    }
    // Max retry error
    this._throwMaxRetryError({ fetchMethod: 'POST' });
  }

  //////////////////////////////////////////////////////////////////////////////
  // Get Loop
  //////////////////////////////////////////////////////////////////////////////

  // GET: 200 | 202 | 401 | 404 | 500 | 503
  // GET is not rate-limited, therefore there is not 429 error
  private async _runGetLoop(): Promise<
    | RelayerInputProofResult
    | RelayerPublicDecryptResult
    | RelayerUserDecryptResult
  > {
    this._assert(this._fetchMethod === 'POST', "this._fetchMethod === 'POST'");
    this._assert(this._jobId !== undefined, 'this._jobId !== undefined');
    this._assert(
      this._jobIdTimestamp !== undefined,
      'this._jobIdTimestamp !== undefined',
    );
    this._fetchMethod = 'GET';

    let i = 0;
    while (i < RelayerV2AsyncRequest.MAX_GET_RETRY) {
      ++i;

      this._assertCanContinueAfterAwait();

      this._elapsed = Date.now() - this._jobIdTimestamp;
      const response = await this._fetchGet();

      // At this stage: `terminated` is guaranteed to be `false`.

      const responseStatus: RelayerV2GetResponseStatus =
        response.status as RelayerV2GetResponseStatus;

      switch (responseStatus) {
        // RelayerV2GetResponseSucceeded
        case 200: {
          const bodyJson = await this._getResponseJson(response);

          // Done
          this._step = this._totalSteps;

          try {
            //
            // INPUT_PROOF
            //
            if (this._relayerOperation === 'INPUT_PROOF') {
              assertIsRelayerV2GetResponseInputProofSucceeded(bodyJson, 'body');

              const inputProofBodyResult: RelayerV2ResultInputProof =
                bodyJson.result;

              if (!inputProofBodyResult.accepted) {
                const inputProofRejected: RelayerV2ResultInputProofRejected =
                  inputProofBodyResult;

                const e = new RelayerV2ResponseInputProofRejectedError({
                  url: this._url,
                  fetchMethod: 'GET',
                  jobId: this.jobId,
                  operation: this._relayerOperation,
                  retryCount: this._retryCount,
                  status: responseStatus,
                  state: { ...this._state },
                  elapsed: this._elapsed,
                  result: inputProofRejected,
                });
                throw e;
              }

              const inputProofAccepted: RelayerV2ResultInputProofAccepted =
                inputProofBodyResult;
              /*
               1. Cast to internal type (as RelayerV2ResultInputProofAcceped)
               2. Compile-time compatibility check (satisfies RelayerInputProofResult)
               3. Return type as public API type (as RelayerInputProofResult)
              */
              const inputProofResult: RelayerInputProofResult =
                inputProofAccepted satisfies RelayerInputProofResult as RelayerInputProofResult;

              // Async onProgress callback
              this._postAsyncOnProgressCallback({
                type: 'succeeded',
                url: this._url,
                method: 'GET',
                status: responseStatus,
                jobId: this.jobId,
                requestId: bodyJson.requestId,
                operation: this._relayerOperation,
                retryCount: this._retryCount,
                elapsed: this._elapsed,
                result: inputProofResult,
                step: this._step,
                totalSteps: this._totalSteps,
              } satisfies RelayerProgressSucceededType<'INPUT_PROOF'>);

              return inputProofResult;
            }
            //
            // PUBLIC_DECRYPT
            //
            else if (this._relayerOperation === 'PUBLIC_DECRYPT') {
              assertIsRelayerV2GetResponsePublicDecryptSucceeded(
                bodyJson,
                'body',
              );

              const publicDecryptBodyResult: RelayerV2ResultPublicDecrypt =
                bodyJson.result;
              const publicDecryptResult: RelayerPublicDecryptResult =
                publicDecryptBodyResult;

              // Async onProgress callback
              this._postAsyncOnProgressCallback({
                type: 'succeeded',
                url: this._url,
                method: 'GET',
                status: responseStatus,
                jobId: this.jobId,
                requestId: bodyJson.requestId,
                operation: this._relayerOperation,
                retryCount: this._retryCount,
                elapsed: this._elapsed,
                result: publicDecryptResult,
                step: this._step,
                totalSteps: this._totalSteps,
              } satisfies RelayerProgressSucceededType<'PUBLIC_DECRYPT'>);

              return publicDecryptResult;
            }
            //
            // USER_DECRYPT
            //
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            else if (this._relayerOperation === 'USER_DECRYPT') {
              assertIsRelayerV2GetResponseUserDecryptSucceeded(
                bodyJson,
                'body',
              );

              const userDecryptBodyResult: RelayerV2ResultUserDecrypt =
                bodyJson.result;
              const userDecryptResult: RelayerUserDecryptResult =
                userDecryptBodyResult.result;

              // Async onProgress callback
              this._postAsyncOnProgressCallback({
                type: 'succeeded',
                url: this._url,
                method: 'GET',
                status: responseStatus,
                jobId: this.jobId,
                requestId: bodyJson.requestId,
                operation: this._relayerOperation,
                retryCount: this._retryCount,
                elapsed: this._elapsed,
                result: userDecryptResult,
                step: this._step,
                totalSteps: this._totalSteps,
              } satisfies RelayerProgressSucceededType<'USER_DECRYPT'>);

              return userDecryptResult;
            }
            //
            // Unkown operation, assert failed
            //
            else {
              assertNever(
                this._relayerOperation,
                `Unkown operation: ${this._relayerOperation}`,
              );
            }
          } catch (cause) {
            // Special case for InputProof rejected
            if (cause instanceof RelayerV2ResponseInputProofRejectedError) {
              throw cause;
            }

            this._throwResponseInvalidBodyError({
              status: responseStatus,
              cause: cause as InvalidPropertyError,
              bodyJson: safeJSONstringify(bodyJson),
            });
          }

          // unreachable code here
          // break or return not accepted by TSC
          // use 'falls through' comment to help eslint
        }
        // RelayerV2ResponseQueued
        // falls through
        case 202: {
          const bodyJson = await this._getResponseJson(response);

          try {
            assertIsRelayerV2GetResponseQueued(bodyJson, 'body');
          } catch (cause) {
            this._throwResponseInvalidBodyError({
              status: responseStatus,
              cause: cause as InvalidPropertyError,
              bodyJson: safeJSONstringify(bodyJson),
            });
          }

          const retryAfterMs = this._getRetryAfterHeaderValueInMs(response);

          // Async onProgress callback
          this._postAsyncOnProgressCallback({
            type: 'queued',
            url: this._url,
            method: 'GET',
            status: responseStatus,
            requestId: bodyJson.requestId,
            operation: this._relayerOperation,
            jobId: this.jobId,
            retryAfterMs,
            retryCount: this._retryCount,
            elapsed: this._elapsed,
            step: this._step,
            totalSteps: this._totalSteps,
          } satisfies RelayerProgressQueuedType<RelayerPostOperation>);

          // Wait if needed (minimum 1s)
          await this._setRetryAfterTimeout(retryAfterMs);
          continue;
        }
        // falls through
        case 400: {
          // Abort
          // Wrong jobId, incorrect format or unknown value etc.
          const bodyJson = await this._getResponseJson(response);

          try {
            assertIsRelayerV2ResponseFailedWithError400(bodyJson, 'body');
          } catch (cause) {
            this._throwResponseInvalidBodyError({
              status: responseStatus,
              cause: cause as InvalidPropertyError,
              bodyJson: safeJSONstringify(bodyJson),
            });
          }

          this._throwRelayerV2ResponseApiError({
            status: responseStatus,
            relayerApiError: bodyJson.error,
          });
        }
        // falls through
        case 401: {
          this._throwUnauthorizedError(responseStatus);
        }
        // falls through
        case 404: {
          // Abort
          // Wrong jobId, incorrect format or unknown value etc.
          const bodyJson = await this._getResponseJson(response);

          try {
            assertIsRelayerV2ResponseFailedWithError404(bodyJson, 'body');
          } catch (cause) {
            this._throwResponseInvalidBodyError({
              status: responseStatus,
              cause: cause as InvalidPropertyError,
              bodyJson: safeJSONstringify(bodyJson),
            });
          }

          this._throwRelayerV2ResponseApiError({
            status: responseStatus,
            relayerApiError: bodyJson.error,
          });
        }
        // RelayerV2ResponseFailed
        // RelayerV2ApiError500
        // falls through
        case 500: {
          // Abort
          // Relayer internal error
          const bodyJson = await this._getResponseJson(response);

          try {
            assertIsRelayerV2ResponseFailedWithError500(bodyJson, 'body');
          } catch (cause) {
            this._throwResponseInvalidBodyError({
              status: responseStatus,
              cause: cause as InvalidPropertyError,
              bodyJson: safeJSONstringify(bodyJson),
            });
          }

          this._throwRelayerV2ResponseApiError({
            status: responseStatus,
            relayerApiError: bodyJson.error,
          });
        }
        // RelayerV2ResponseFailed
        // RelayerV2ApiError503
        // falls through
        case 503: {
          // Abort
          // Possible Reasons: Gateway has some internal error (unknown)
          const bodyJson = await this._getResponseJson(response);

          try {
            assertIsRelayerV2ResponseFailedWithError503(bodyJson, 'body');
          } catch (cause) {
            this._throwResponseInvalidBodyError({
              status: responseStatus,
              cause: cause as InvalidPropertyError,
              bodyJson: safeJSONstringify(bodyJson),
            });
          }

          this._throwRelayerV2ResponseApiError({
            status: responseStatus,
            relayerApiError: bodyJson.error,
          });
        }
        // falls through
        default: {
          // Use TS compiler + `never` to guarantee the switch integrity
          const throwUnsupportedStatus = (unsupportedStatus: never): never => {
            throw new RelayerV2ResponseStatusError({
              fetchMethod: 'GET',
              status: unsupportedStatus,
              url: this._url,
              jobId: this.jobId,
              operation: this._relayerOperation,
              elapsed: this._elapsed,
              retryCount: this._retryCount,
              state: { ...this._state },
            });
          };
          throwUnsupportedStatus(responseStatus);
        }
      }
    }
    // Max retry error
    this._throwMaxRetryError({ fetchMethod: 'GET' });
  }

  //////////////////////////////////////////////////////////////////////////////

  private async _getResponseJson(response: Response): Promise<unknown> {
    try {
      // This situation usually happens when Cloudflare overrides the relayer's reply body.
      // and put a HTML page instead
      const bodyJson = (await response.json()) as unknown;

      this._assertCanContinueAfterAwait();

      return bodyJson;
    } catch (e) {
      this._throwFetchError({
        cause: e,
      });
    }
  }

  //////////////////////////////////////////////////////////////////////////////

  private _getRetryAfterHeaderValueInMs(response: Response): number {
    if (!response.headers.has('Retry-After')) {
      if (this._throwErrorIfNoRetryAfter) {
        throw new Error(`Missing 'Retry-After' header key`);
      }
      return RelayerV2AsyncRequest.DEFAULT_RETRY_AFTER_MS;
    }

    try {
      const n = Number.parseInt(
        // can be null
        response.headers.get('Retry-After') as unknown as string,
      );
      if (isUint(n)) {
        const ms = n * 1000;
        return ms < RelayerV2AsyncRequest.MINIMUM_RETRY_AFTER_MS
          ? RelayerV2AsyncRequest.MINIMUM_RETRY_AFTER_MS
          : ms;
      }
    } catch {
      //
    }

    if (this._throwErrorIfNoRetryAfter) {
      throw new Error(`Invalid 'Retry-After' header key`);
    }

    return RelayerV2AsyncRequest.DEFAULT_RETRY_AFTER_MS;
  }

  //////////////////////////////////////////////////////////////////////////////
  // JobId
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Sets the unique job identifier for this request.
   *
   * This function enforces a strict initialization constraint: the jobId must be
   * set exactly once during the entire lifecycle of the state machine instance.
   *
   * This immutability ensures that all subsequent operations, logging, and state
   * transitions are consistently associated with the correct external request.
   *
   * @param jobId - The unique identifier associated with the asynchronous job request.
   * @private
   * @throws {RelayerV2RequestInternalError} Thrown if jobId is undefined or if the jobId has already been set.
   */
  private _setJobIdOnce(jobId: string): void {
    this._assert((jobId as unknown) !== undefined, 'jobId !== undefined');
    this._assert(this._jobId === undefined, 'this._jobId === undefined');

    this._jobId = jobId;
    this._jobIdTimestamp = Date.now();
  }

  private get jobId(): string {
    this._assert(this._jobId !== undefined, 'this._jobId !== undefined');
    return this._jobId;
  }

  //////////////////////////////////////////////////////////////////////////////
  // Fetch functions
  //////////////////////////////////////////////////////////////////////////////

  private async _fetchPost(): Promise<Response> {
    // Debug state-check guards:
    // - the fetchMethod is guaranteed to be 'POST'.
    // - the jobId is guaranteed to be undefined.
    // - `terminated` is guaranteed to be `false`
    // - `fetching` is guaranteed to be `false`
    this._assert(this._fetchMethod === 'POST', 'this._fetchMethod === "POST"');
    this._assert(this._jobId === undefined, 'this._jobId === undefined');
    this._assert(!this._state.terminated, '!this._state.terminated');
    this._assert(!this._state.fetching, '!this._state.fetching');

    this._trace('_fetchPost', this._url);

    const init = setAuth(
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ZAMA-SDK-VERSION': version,
          'ZAMA-SDK-NAME': sdkName,
        },
        body: JSON.stringify(this._payload),
        ...(this._internalAbortSignal
          ? { signal: this._internalAbortSignal }
          : {}),
      } satisfies RequestInit,
      this._fhevmAuth,
    );

    this._state.fetching = true;

    let response;
    try {
      response = await fetch(this._url, init);
    } catch (cause) {
      this._state.fetching = false;

      // Warning: `terminated` can be `true` here!
      // (ex: if `controller.abort()` has been called from the outside while still executing `fetch`)

      this._trace('_fetchPost', `catch(e) + throw e: ${String(cause)}`);

      // Keep the standard 'AbortError'
      if ((cause as { name: string }).name === 'AbortError') {
        throw cause;
      } else {
        this._throwFetchError({
          cause,
        });
      }
    }

    this._state.fetching = false;

    // Debug state-check guards:
    // - the jobId is guaranteed to be undefined.
    // - `terminated` is guaranteed to be `false`
    this._assert(!this._state.terminated, '!this._state.terminated');

    // Debug
    this._assertCanContinueAfterAwait();

    this._trace('_fetchPost', 'return response Ok');

    return response;
  }

  //////////////////////////////////////////////////////////////////////////////

  private async _fetchGet(): Promise<Response> {
    // Debug state-check guards:
    // - the fetchMethod is guaranteed to be 'GET'.
    // - the jobId is guaranteed to be set.
    // - `terminated` is guaranteed to be `false`
    // - `fetching` is guaranteed to be `false`
    this._assert(this._fetchMethod === 'GET', 'this._fetchMethod === "GET"');
    this._assert(this._jobId !== undefined, 'this._jobId !== undefined');
    this._assert(!this._state.terminated, '!this._state.terminated');
    this._assert(!this._state.fetching, '!this._state.fetching');

    this._trace('_fetchGet', `jobId=${this.jobId}`);

    const init: RequestInit = {
      method: 'GET',
      headers: {
        'ZAMA-SDK-VERSION': version,
        'ZAMA-SDK-NAME': sdkName,
      },
      ...(this._internalAbortSignal
        ? { signal: this._internalAbortSignal }
        : {}),
    };

    this._state.fetching = true;

    let response;
    try {
      response = await fetch(`${this._url}/${this.jobId}`, init);
    } catch (cause) {
      this._state.fetching = false;
      // Warning: `terminated` can be `true` here!
      // (ex: if `controller.abort()` has been called from the outside while still executing `fetch`)
      this._trace(
        '_fetchGet',
        `jobId=${this.jobId}, catch(e) + throw e: ${cause}`,
      );

      // Keep the standard 'AbortError'
      if ((cause as { name: string }).name === 'AbortError') {
        throw cause;
      } else {
        this._throwFetchError({
          cause,
        });
      }
    }

    this._state.fetching = false;

    // Debug state-check guards:
    // - the jobId is guaranteed to be set.
    // - `terminated` is guaranteed to be `false`
    this._assert(!this._state.terminated, '!this._state.terminated');

    // Debug
    this._assertCanContinueAfterAwait();

    this._trace(
      '_fetchGet',
      `jobId=${this.jobId}, return response Ok, status=${response.status}`,
    );
    return response;
  }

  //////////////////////////////////////////////////////////////////////////////
  // AbortSignal
  //////////////////////////////////////////////////////////////////////////////

  // Warning: Use arrow function only!
  private readonly _handleExternalSignalAbort = (ev: Event): void => {
    const signal = ev.currentTarget as AbortSignal;

    // TESTING: the following sequences must be extensively tested:
    // ============================================================
    //
    // Each steps could potentially be called synchronously one after the other
    // or asynchronously: step 2 is called from the next microtick
    //
    // 1. externalSignal.abort();
    // 2. request.cancel();
    //
    // 1. externalSignal.abort();
    // 2. externalSignal.abort();
    //
    // 1. request.cancel();
    // 2. externalSignal.abort();

    // Debug state-check guards:
    this._assert(
      this instanceof RelayerV2AsyncRequest,
      `this instanceof RelayerV2AsyncRequest`,
    );
    this._assert(
      signal === this._externalAbortSignal,
      'signal === this._externalAbortSignal',
    );
    this._assert(!this._state.terminated, `!this._state.terminated`);
    this._assert(!this._state.aborted, '!this._state.aborted');
    this._assert(!this._state.canceled, '!this._state.canceled');

    this.cancel();
  };

  // Warning: Use arrow function only!
  private readonly _handleInternalSignalAbort = (ev: Event): void => {
    const signal = ev.currentTarget as AbortSignal;

    // Debug state-check guards:
    this._assert(
      this instanceof RelayerV2AsyncRequest,
      `this instanceof RelayerV2AsyncRequest`,
    );
    this._assert(
      signal === this._internalAbortSignal,
      'signal === this._internalAbortSignal',
    );
    this._assert(!this._state.terminated, `!this._state.terminated`);
    this._assert(!this._state.aborted, '!this._state.aborted');

    this._state.aborted = true;

    if (signal.reason !== 'cancel') {
      this._assert(!this._state.canceled, '!this._state.canceled');
    }

    this._postAsyncOnProgressCallback({
      type: 'abort',
      url: this._url,
      step: this._step,
      totalSteps: this._totalSteps,
      ...(this._fetchMethod !== undefined ? { method: this._fetchMethod } : {}),
      ...(this._jobId !== undefined ? { jobId: this._jobId } : {}),
      operation: this._relayerOperation,
      retryCount: this._retryCount,
    } satisfies RelayerProgressAbortType<RelayerPostOperation>);

    this._terminate(
      'abort',
      new RelayerV2AbortError({
        operation: this._relayerOperation,
        jobId: this._jobId,
        url: this._url,
      }),
    );
  };

  //////////////////////////////////////////////////////////////////////////////
  // Terminate
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Can be called multiple times
   */
  private _terminate(reason: RelayerV2TerminateReason, error?: unknown): void {
    // Warning: this._state.fetching can be true
    // ex: call cancel while fetch is running

    if (this._state.terminated) {
      this._trace(
        `_terminate`,
        `reason=${reason}. Already terminated with reason='${this._terminateReason}'. IGNORE`,
      );
      this._assert(
        this._terminateReason !== undefined,
        'this._terminateReason !== undefined',
      );
      this._assert(
        this._internalAbortSignal === undefined,
        'this._signal === undefined',
      );
      this._assert(
        this._requestGlobalTimeoutID === undefined,
        'this._requestGlobalTimeoutID === undefined',
      );
      this._assert(
        this._retryAfterTimeoutID === undefined,
        'this._retryAfterTimeoutID === undefined',
      );
      this._assert(
        this._retryAfterTimeoutPromiseFuncReject === undefined,
        'this._retryAfterTimeoutPromiseFuncReject === undefined',
      );
      return;
    }

    this._trace('_terminate', `reason=${reason}`);

    this._terminateReason = reason;
    this._terminateError = error;
    this._state.terminated = true;

    this._tryClearRetryAfterTimeout(error);
    this._tryClearGlobalRequestTimeout();

    const is = this._internalAbortSignal;
    const es = this._externalAbortSignal;

    this._externalAbortSignal = undefined;
    this._internalAbortSignal = undefined;
    this._internalAbortController = undefined;

    if (es) {
      es.removeEventListener('abort', this._handleExternalSignalAbort);
    }
    if (is) {
      is.removeEventListener('abort', this._handleInternalSignalAbort);
    }

    this._trace('_terminate', `reason=${reason} completed.`);
  }

  //////////////////////////////////////////////////////////////////////////////
  // Retry-After timeout
  //////////////////////////////////////////////////////////////////////////////

  private async _setRetryAfterTimeout(delayMs: number): Promise<void> {
    // Debug
    this._assert(!this._state.terminated, '!this._state.terminated');
    this._assert(
      this._retryAfterTimeoutID === undefined,
      'this._retryAfterTimeoutID === undefined',
    );
    this._assert(
      delayMs >= RelayerV2AsyncRequest.MINIMUM_RETRY_AFTER_MS,
      `delayMs >= ${RelayerV2AsyncRequest.MINIMUM_RETRY_AFTER_MS}`,
    );

    this._trace('_setRetryAfterTimeout', `delayMs=${delayMs}`);

    // Keep the test in case we must remove the assert
    if ((this._retryAfterTimeoutID as unknown) !== undefined) {
      return Promise.reject(new Error(`retry-after already running.`));
    }

    const p = new Promise<void>((resolve, reject) => {
      this._retryAfterTimeoutPromiseFuncReject = reject;

      const callback = (): void => {
        this._retryAfterTimeoutID = undefined;
        this._retryAfterTimeoutPromiseFuncReject = undefined;
        resolve();
      };

      this._retryCount++;
      this._retryAfterTimeoutID = setTimeout(callback, delayMs);
    });

    // Keep the assertion (defensive)
    this._assert(
      (this._retryAfterTimeoutID as unknown) !== undefined,
      'this._retryAfterTimeoutID !== undefined',
    );
    this._assert(
      this._retryAfterTimeoutPromiseFuncReject !== undefined,
      'this._retryAfterTimeoutPromiseFuncReject !== undefined',
    );

    return p;
  }

  //////////////////////////////////////////////////////////////////////////////

  private _tryClearRetryAfterTimeout(error?: unknown): void {
    if (this._retryAfterTimeoutID === undefined) {
      // Debug
      this._assert(
        this._retryAfterTimeoutPromiseFuncReject === undefined,
        'this._retryAfterTimeoutPromiseFuncReject === undefined',
      );
      return;
    }

    this._assert(
      this._retryAfterTimeoutPromiseFuncReject !== undefined,
      'this._retryAfterTimeoutPromiseFuncReject !== undefined',
    );

    const reject = this._retryAfterTimeoutPromiseFuncReject;
    const tid = this._retryAfterTimeoutID;

    this._retryAfterTimeoutID = undefined;
    this._retryAfterTimeoutPromiseFuncReject = undefined;

    clearTimeout(tid);

    // Calling reject will
    reject(error ?? new Error('_tryClearRetryAfterTimeout'));
  }

  //////////////////////////////////////////////////////////////////////////////
  // Global Request Timeout
  //////////////////////////////////////////////////////////////////////////////

  private _setGlobalRequestTimeout(delayMs: number): void {
    // Debug
    this._assert(
      this._requestGlobalTimeoutID === undefined,
      'this._requestGlobalTimeoutID === undefined',
    );

    const callback = (): void => {
      this._requestGlobalTimeoutID = undefined;
      this._handleGlobalRequestTimeout();
    };

    this._requestGlobalTimeoutID = setTimeout(callback, delayMs);
  }

  private _handleGlobalRequestTimeout(): void {
    // Debug state-check guards:
    this._assert(
      this instanceof RelayerV2AsyncRequest,
      `this instanceof RelayerV2AsyncRequest`,
    );
    this._assert(!this._state.terminated, `!this._state.terminated`);
    this._assert(!this._state.timeout, '!this._state.timeout');

    this._state.timeout = true;

    this._postAsyncOnProgressCallback({
      type: 'timeout',
      url: this._url,
      ...(this._fetchMethod !== undefined ? { method: this._fetchMethod } : {}),
      ...(this._jobId !== undefined ? { jobId: this._jobId } : {}),
      operation: this._relayerOperation,
      retryCount: this._retryCount,
      step: this._step,
      totalSteps: this._totalSteps,
    } satisfies RelayerProgressTimeoutType<RelayerPostOperation>);

    this._terminate(
      'timeout',
      new RelayerV2TimeoutError({
        operation: this._relayerOperation,
        jobId: this._jobId,
        url: this._url,
        timeoutMs: this._requestMaxDurationInMs,
      }),
    );
  }

  private _tryClearGlobalRequestTimeout(): void {
    if (this._requestGlobalTimeoutID === undefined) {
      return;
    }

    const tid = this._requestGlobalTimeoutID;

    this._requestGlobalTimeoutID = undefined;
    clearTimeout(tid);
  }

  //////////////////////////////////////////////////////////////////////////////
  // Progress
  //////////////////////////////////////////////////////////////////////////////

  private _postAsyncOnProgressCallback(
    args:
      | RelayerInputProofProgressArgs
      | RelayerUserDecryptProgressArgs
      | RelayerPublicDecryptProgressArgs,
  ): void {
    const onProgressFunc = this._onProgress;
    if (onProgressFunc) {
      // setTimeout(() => {
      //   onProgressFunc(args);
      // }, 0);

      // onProgressFunc() will execute asynchronously in the next cycle of
      // the JavaScript event loop (the microtask queue).
      // Promise.resolve().then(() => {
      //   onProgressFunc(args);
      // });

      queueMicrotask(() => {
        onProgressFunc(args);
      });
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Errors
  //////////////////////////////////////////////////////////////////////////////

  private _throwUnauthorizedError(status: 401): never {
    this._throwRelayerV2ResponseApiError({
      status,
      relayerApiError: {
        label: 'unauthorized',
        message: 'Unauthorized, missing or invalid Zama Fhevm API Key.',
      },
    });
  }

  private _throwRelayerV2ResponseApiError(params: {
    status: RelayerFailureStatus;
    relayerApiError: RelayerApiErrorType;
  }): never {
    // Clone
    const clonedRelayerApiError = JSON.parse(
      JSON.stringify(params.relayerApiError),
    ) as RelayerApiErrorType;

    const args: RelayerProgressFailedType<RelayerPostOperation> = {
      type: 'failed',
      url: this._url,
      method: this._fetchMethod!,
      status: params.status,
      ...(this._jobId !== undefined ? { jobId: this._jobId } : {}),
      operation: this._relayerOperation,
      retryCount: this._retryCount,
      elapsed: this._elapsed,
      relayerApiError: clonedRelayerApiError,
      step: this._step,
      totalSteps: this._totalSteps,
    } satisfies RelayerProgressFailedType<RelayerPostOperation>;

    // Async onProgress callback
    this._postAsyncOnProgressCallback(
      this._relayerOperation === 'INPUT_PROOF'
        ? (args as RelayerProgressFailedType<'INPUT_PROOF'>)
        : this._relayerOperation === 'PUBLIC_DECRYPT'
          ? (args as RelayerProgressFailedType<'PUBLIC_DECRYPT'>)
          : (args as RelayerProgressFailedType<'USER_DECRYPT'>),
    );

    throw new RelayerV2ResponseApiError({
      url: this._url,
      fetchMethod: this._fetchMethod!,
      status: params.status,
      jobId: this._jobId,
      operation: this._relayerOperation,
      retryCount: this._retryCount,
      relayerApiError: params.relayerApiError,
      elapsed: this._elapsed,
      state: { ...this._state },
    });
  }

  private _assert(condition: boolean, message: string): asserts condition {
    if (!condition) {
      this._throwInternalError(`Assertion failed: ${message}`);
    }
  }

  private _throwInternalError(message: string): never {
    throw new RelayerV2RequestInternalError({
      operation: this._relayerOperation,
      url: this._url,
      message,
      state: JSON.stringify(this._state),
      jobId: this._jobId, // internal value
    });
  }

  private _throwMaxRetryError(params: { fetchMethod: 'GET' | 'POST' }): never {
    const elapsed =
      this._jobIdTimestamp !== undefined
        ? Date.now() - this._jobIdTimestamp
        : 0;
    throw new RelayerV2MaxRetryError({
      operation: this._relayerOperation,
      url: this._url,
      state: { ...this._state },
      retryCount: this._retryCount,
      jobId: this._jobId, // internal value
      fetchMethod: params.fetchMethod,
      elapsed,
    });
  }

  private _throwResponseInvalidBodyError(params: {
    status: number;
    cause: InvalidPropertyError;
    bodyJson: string;
  }): never {
    throw new RelayerV2ResponseInvalidBodyError({
      ...params,
      fetchMethod: this._fetchMethod!,
      url: this._url,
      jobId: this._jobId,
      operation: this._relayerOperation,
      state: { ...this._state },
      retryCount: this._retryCount,
      elapsed: this._elapsed,
    });
  }

  private _throwFetchError(params: { cause: unknown }): never {
    throw new RelayerV2FetchError({
      ...params,
      elapsed: this._elapsed,
      url: this._url,
      jobId: this._jobId,
      operation: this._relayerOperation,
      state: { ...this._state },
      retryCount: this._retryCount,
      fetchMethod: this._fetchMethod!,
    });
  }

  /**
   * Assert Continuation Guard
   *
   * This internal method implements a state-check guard to ensure the state machine
   * can safely proceed after an asynchronous operation has completed.
   *
   * In a state machine with asynchronous calls (e.g., fetch, timer delays), the system's
   * state (e.g., this._state) might change externally during the 'await' pause
   * (e.g., due to a timeout, an external abort signal, or a concurrent state transition).
   *
   * If the internal check (this._canContinue()) returns false, it means the current
   * operation is no longer valid, and execution must stop immediately to prevent state corruption.
   * This pattern is essential for reliable asynchronous state machines.
   *
   * @throws {RelayerV2RequestInternalError} Thrown if the state check fails (i.e., this._canContinue() is false).
   * The error includes relevant state information (like current state and jobId)
   * to aid in debugging the exact point of the integrity failure.
   */
  private _assertCanContinueAfterAwait(): void {
    if (!this._canContinue()) {
      this._throwInternalError('cannot continue.');
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Trace
  //////////////////////////////////////////////////////////////////////////////

  private _trace(functionName: string, message: string): void {
    if (this._debug) {
      console.log(`[RelayerV2AsyncRequest]:${functionName}: ${message}`);
    }
  }
}
