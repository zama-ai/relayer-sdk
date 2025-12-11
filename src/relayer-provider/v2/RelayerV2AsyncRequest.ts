import { isUint } from '../../utils/uint';
import { setAuth } from '../../auth';
import {
  assertIsRelayerV2ResponseFailedWithError500,
  assertIsRelayerV2ResponseFailedWithError400,
  assertIsRelayerV2ResponseFailedWithError429,
  assertIsRelayerV2ResponseFailedWithError503,
  assertIsRelayerV2ResponseFailedWithError504,
  assertIsRelayerV2ResponseFailedWithError404,
} from './types/RelayerV2ResponseFailed';
import type {
  RelayerV2ApiError,
  RelayerV2ResultInputProof,
  RelayerV2ResultPublicDecrypt,
  RelayerV2ResultUserDecrypt,
  RelayerV2PostResponseStatus,
  RelayerV2GetResponseStatus,
  RelayerV2OperationResultMap,
  RelayerV2Operation,
} from './types/types';
import { RelayerV2InvalidPostResponseError } from './errors/RelayerV2InvalidPostResponseError';
import { RelayerV2UnexpectedPostStatusError } from './errors/RelayerV2UnexpectedPostStatusError';
import { RelayerV2InvalidGetResponseError } from './errors/RelayerV2InvalidGetResponseError';
import { RelayerV2UnexpectedGetStatusError } from './errors/RelayerV2UnexpectedGetStatusError';
import { RelayerV2FetchError } from './errors/RelayerV2FetchError';
import { assertIsRelayerV2GetResponseInputProofSucceeded } from './types/RelayerV2GetResponseInputProofSucceeded';
import { assertIsRelayerV2GetResponsePublicDecryptSucceeded } from './types/RelayerV2GetResponsePublicDecryptSucceeded';
import { assertIsRelayerV2GetResponseUserDecryptSucceeded } from './types/RelayerV2GetResponseUserDecryptSucceeded';
import { RelayerV2RequestInternalError } from './errors/RelayerV2RequestInternalError';
import { assertIsRelayerV2ResponseQueued } from './types/RelayerV2ResponseQueued';
import type { FhevmInstanceOptions } from '../../config';
import { RelayerProviderFetchOptions } from '../AbstractRelayerProvider';
import { RelayerV2Error } from './errors/RelayerV2ApiError';

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

export type RelayerV2AsyncRequestState = {
  running: boolean;
  canceled: boolean;
  succeeded: boolean;
  failed: boolean;
  aborted: boolean;
  terminated: boolean;
  fetching: boolean;
};

export type RelayerV2ProgressArgs =
  | RelayerV2ProgressQueued
  | RelayerV2ProgressRateLimited
  | RelayerV2ProgressInputProofSucceeded
  | RelayerV2ProgressPublicDecryptSucceeded
  | RelayerV2ProgressUserDecryptSucceeded
  | RelayerV2ProgressFailed;

export type RelayerV2ProgressQueued = {
  type: 'queued';
  url: string;
  method: 'POST' | 'GET';
  status: 202;
  jobId: string;
  operation: RelayerV2Operation;
  requestId: string;
  retryAfter: number;
  retryCount: number;
  elapsed: number;
};

export type RelayerV2ProgressSucceeded<O extends RelayerV2Operation> = {
  type: 'succeeded';
  url: string;
  method: 'GET';
  status: 200;
  jobId: string;
  requestId: string;
  retryCount: number;
  elapsed: number;
  operation: O;
  result: RelayerV2OperationResultMap[O];
};

export type RelayerV2ProgressPublicDecryptSucceeded =
  RelayerV2ProgressSucceeded<'PUBLIC_DECRYPT'>;
export type RelayerV2ProgressUserDecryptSucceeded =
  RelayerV2ProgressSucceeded<'USER_DECRYPT'>;
export type RelayerV2ProgressInputProofSucceeded =
  RelayerV2ProgressSucceeded<'INPUT_PROOF'>;

export type RelayerV2ProgressRateLimited = {
  type: 'ratelimited';
  url: string;
  method: 'POST';
  status: 429;
  retryAfter: number;
  retryCount: number;
  elapsed: number;
  message: string;
};

type RelayerV2ProgressFailureStatus = 400 | 404 | 500 | 503 | 504;

export type RelayerV2ProgressFailed = {
  type: 'failed';
  url: string;
  method: 'GET' | 'POST';
  status: RelayerV2ProgressFailureStatus;
  jobId?: string;
  retryCount: number;
  elapsed: number;
  operation: RelayerV2Operation;
  relayerApiError: RelayerV2ApiError;
};

type RelayerV2AsyncRequestParams = {
  relayerOperation: RelayerV2Operation;
  url: string;
  payload: Record<string, unknown>;
  timeoutInSeconds?: number;
  throwErrorIfNoRetryAfter?: boolean;
  instanceOptions?: FhevmInstanceOptions;
} & RelayerProviderFetchOptions<RelayerV2ProgressArgs>;

export type RelayerV2TerminateReason =
  | 'succeeded'
  | 'failed'
  | 'timeout'
  | 'abort';

export class RelayerV2AsyncRequest {
  private _jobId: string | undefined;
  private _jobIdTimestamp: number | undefined;
  private _state: RelayerV2AsyncRequestState;
  private _relayerOperation: RelayerV2Operation;
  private _publicAPINoReentrancy: boolean;
  private _internalAbortController: AbortController | undefined;
  private _internalAbortSignal: AbortSignal | undefined;
  private _externalAbortSignal: AbortSignal | undefined;
  private _terminateReason: RelayerV2TerminateReason | undefined;
  private _terminateError: unknown;
  private _retryCount: number;
  private _retryAfterTimeoutID: any;
  private _url: string;
  private _payload: Record<string, unknown>;
  private _fhevmInstanceOptions: FhevmInstanceOptions | undefined;
  private _retryAfterTimeoutPromiseFuncReject?: (reason?: any) => void;
  private _onProgress?: (args: RelayerV2ProgressArgs) => void;
  private _requestMaxDurationInSecs: number;
  private _requestStartTimestamp: number | undefined;
  private _requestGlobalTimeoutID: any;
  private _throwErrorIfNoRetryAfter: boolean;

  private static readonly DEFAULT_RETRY_AFTER_SECS = 2;
  private static readonly DEFAULT_GLOBAL_REQUEST_TIMEOUT_SECS = 60;
  private static readonly MAX_GET_RETRY = 100;
  private static readonly MAX_POST_RETRY = 100;

  constructor(params: RelayerV2AsyncRequestParams) {
    if (
      params.relayerOperation !== 'INPUT_PROOF' &&
      params.relayerOperation !== 'PUBLIC_DECRYPT' &&
      params.relayerOperation !== 'USER_DECRYPT'
    ) {
      throw new Error(`Invalid relayerOperation ${params.relayerOperation}`);
    }

    this._relayerOperation = params.relayerOperation;
    this._internalAbortController = new AbortController();
    this._internalAbortSignal = this._internalAbortController.signal;
    this._internalAbortSignal.addEventListener(
      'abort',
      this._handleInternalSignalAbort,
    );
    this._externalAbortSignal = params.signal;
    if (this._externalAbortSignal) {
      this._externalAbortSignal.addEventListener(
        'abort',
        this._handleExternalSignalAbort,
      );
    }
    this._url = params.url;
    this._payload = params.payload;
    this._fhevmInstanceOptions = params.instanceOptions;
    this._onProgress = params.onProgress;
    this._state = {
      running: false,
      canceled: false,
      terminated: false,
      succeeded: false,
      aborted: false,
      failed: false,
      fetching: false,
    };
    this._retryCount = 0;
    this._retryAfterTimeoutID = undefined;
    this._requestGlobalTimeoutID = undefined;
    this._terminateReason = undefined;
    this._publicAPINoReentrancy = false;
    this._throwErrorIfNoRetryAfter = params.throwErrorIfNoRetryAfter ?? false;
    this._requestMaxDurationInSecs =
      params.timeoutInSeconds ??
      RelayerV2AsyncRequest.DEFAULT_GLOBAL_REQUEST_TIMEOUT_SECS;
  }

  //////////////////////////////////////////////////////////////////////////////
  // Public API: run
  //////////////////////////////////////////////////////////////////////////////

  public async run(): Promise<any> {
    if (this._publicAPINoReentrancy) {
      throw new Error(`Relayer.run() call not permitted`);
    }

    if (this._state.terminated) {
      throw new Error(`Relayer request already terminated`);
    }

    if (this._state.canceled) {
      throw new Error(`Relayer request already canceled`);
    }

    if (this._state.succeeded) {
      throw new Error(`Relayer request already succeeded`);
    }

    if (this._state.failed) {
      throw new Error(`Relayer request already failed`);
    }

    if (this._state.aborted) {
      throw new Error(`Relayer request already aborted`);
    }

    if (this._externalAbortSignal?.aborted === true) {
      throw new Error(
        `Externally Aborted reason=` + this._externalAbortSignal.reason,
      );
    }

    if (this._internalAbortSignal?.aborted === true) {
      throw new Error(
        `Internally Aborted reason=` + this._internalAbortSignal.reason,
      );
    }

    if (this._state.running) {
      throw new Error(`Relayer request already running`);
    }
    this._state.running = true;

    this._requestStartTimestamp = Date.now();
    this._setGlobalRequestTimeout(this._requestMaxDurationInSecs * 1000);

    try {
      const json = await this._runPostLoop();

      this._state.succeeded = true;

      this._terminate('succeeded');

      return json;
    } catch (e) {
      this._state.failed = true;

      if ((e as any).name === 'AbortError') {
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

  private _canContinue() {
    return !(
      this._state.canceled ||
      this._state.terminated ||
      this._state.succeeded ||
      this._state.aborted
    );
  }

  public cancel() {
    if (this._publicAPINoReentrancy) {
      throw new Error(`Relayer.cancel() call not permitted`);
    }

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

  // POST : 202 | 400 | 429 | 500 | 503
  private async _runPostLoop(): Promise<
    | RelayerV2ResultPublicDecrypt
    | RelayerV2ResultUserDecrypt
    | RelayerV2ResultInputProof
  > {
    // No infinite loop!
    let i = 0;
    while (i < RelayerV2AsyncRequest.MAX_POST_RETRY) {
      ++i;

      this._assertCanContinueAfterAwait();

      // At this stage: `terminated` is guaranteed to be `false`.
      // However, the `fetch` call can potentially throw an `AbortError`. In this case
      // in the error catch the `terminated` flag will be `true`! But, that's ok because the
      // next part of the function will never be executed (thrown error).
      const elapsed = this._jobId ? Date.now() - this._jobIdTimestamp! : 0;
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
            assertIsRelayerV2ResponseQueued(bodyJson, 'body');
          } catch (e) {
            throw new RelayerV2InvalidPostResponseError({
              status: response.status,
              url: this._url,
              operation: this._relayerOperation,
              cause: e,
            });
          }

          let retry_after_sec = this._getRetryAfterHeaderValueInSecs(response);
          if (retry_after_sec < 1) retry_after_sec = 1;

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
            retryAfter: retry_after_sec,
            elapsed,
          } satisfies RelayerV2ProgressQueued);

          // Wait if needed (minimum 1s)
          await this._setRetryAfterTimeout(retry_after_sec * 1000);

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
          } catch (e) {
            throw new RelayerV2InvalidPostResponseError({
              status: response.status,
              url: this._url,
              operation: this._relayerOperation,
              cause: e,
            });
          }

          this._throwRelayerV2Error({
            fetchMethod: 'POST',
            status: responseStatus,
            relayerApiError: bodyJson.error,
            elapsed,
          });
        }
        // RelayerV2ResponseFailed
        // RelayerV2ApiError429
        case 429: {
          // Retry
          // Rate Limit error (Cloudflare/Kong/Relayer), reason in message
          const bodyJson = await this._getResponseJson(response);

          try {
            assertIsRelayerV2ResponseFailedWithError429(bodyJson, 'body');
          } catch (e) {
            throw new RelayerV2InvalidPostResponseError({
              status: response.status,
              url: this._url,
              operation: this._relayerOperation,
              cause: e,
            });
          }

          let retry_after_sec = this._getRetryAfterHeaderValueInSecs(response);
          if (retry_after_sec < 1) retry_after_sec = 1;

          // Async onProgress callback
          this._postAsyncOnProgressCallback({
            type: 'ratelimited',
            url: this._url,
            method: 'POST',
            status: responseStatus,
            retryAfter: retry_after_sec,
            retryCount: this._retryCount,
            elapsed,
            message: bodyJson.error.message,
          } satisfies RelayerV2ProgressRateLimited);

          // Wait if needed (minimum 1s)
          await this._setRetryAfterTimeout(retry_after_sec * 1000);

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
          } catch (e) {
            throw new RelayerV2InvalidPostResponseError({
              status: response.status,
              url: this._url,
              operation: this._relayerOperation,
              cause: e,
            });
          }

          this._throwRelayerV2Error({
            fetchMethod: 'POST',
            status: responseStatus,
            relayerApiError: bodyJson.error,
            elapsed,
          });
        }
        // RelayerV2ResponseFailed
        // RelayerV2ApiError503
        case 503: {
          // Abort
          // Possible Reasons: Gateway has some internal error (dont known)
          const bodyJson = await this._getResponseJson(response);

          try {
            assertIsRelayerV2ResponseFailedWithError503(bodyJson, 'body');
          } catch (e) {
            throw new RelayerV2InvalidPostResponseError({
              status: response.status,
              url: this._url,
              operation: this._relayerOperation,
              cause: e,
            });
          }

          this._throwRelayerV2Error({
            fetchMethod: 'POST',
            status: responseStatus,
            relayerApiError: bodyJson.error,
            elapsed,
          });
        }
        default: {
          // Use TS compiler + `never` to guarantee the switch integrity
          const throwUnsupportedStatus = (unsupportedStatus: never) => {
            throw new RelayerV2UnexpectedPostStatusError({
              status: unsupportedStatus,
              url: this._url,
              operation: this._relayerOperation,
            });
          };
          throwUnsupportedStatus(responseStatus);
        }
      }
    }
    // Infinite loop error
    this._throwInternalError('Inifinite loop');
  }

  //////////////////////////////////////////////////////////////////////////////
  // Get Loop
  //////////////////////////////////////////////////////////////////////////////

  // GET: 200 | 202 | 404 | 500 | 503 | 504
  // GET is not rate-limited, therefore there is not 429 error
  private async _runGetLoop(): Promise<
    | RelayerV2ResultPublicDecrypt
    | RelayerV2ResultUserDecrypt
    | RelayerV2ResultInputProof
  > {
    let i = 0;
    while (i < RelayerV2AsyncRequest.MAX_GET_RETRY) {
      ++i;

      this._assertCanContinueAfterAwait();

      const elapsed = Date.now() - this._jobIdTimestamp!;
      const response = await this._fetchGet();

      // At this stage: `terminated` is guaranteed to be `false`.

      const responseStatus: RelayerV2GetResponseStatus =
        response.status as RelayerV2GetResponseStatus;

      switch (responseStatus) {
        // RelayerV2GetResponseSucceeded
        case 200: {
          const bodyJson = await this._getResponseJson(response);

          try {
            if (this._relayerOperation === 'INPUT_PROOF') {
              assertIsRelayerV2GetResponseInputProofSucceeded(bodyJson, 'body');

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
                elapsed,
                result: bodyJson.result,
              } satisfies RelayerV2ProgressSucceeded<'INPUT_PROOF'>);
            } else if (this._relayerOperation === 'PUBLIC_DECRYPT') {
              assertIsRelayerV2GetResponsePublicDecryptSucceeded(
                bodyJson,
                'body',
              );

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
                elapsed,
                result: bodyJson.result,
              } satisfies RelayerV2ProgressSucceeded<'PUBLIC_DECRYPT'>);
            } else if (this._relayerOperation === 'USER_DECRYPT') {
              assertIsRelayerV2GetResponseUserDecryptSucceeded(
                bodyJson,
                'body',
              );

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
                elapsed,
                result: bodyJson.result,
              } satisfies RelayerV2ProgressSucceeded<'USER_DECRYPT'>);
            }
          } catch (e) {
            throw new RelayerV2InvalidGetResponseError({
              status: response.status,
              url: this._url,
              jobId: this.jobId,
              operation: this._relayerOperation,
              cause: e,
            });
          }

          // RelayerV2ResultPublicDecrypt
          // RelayerV2ResultUserDecrypt
          // RelayerV2ResultInputProof;
          return bodyJson.result;
        }
        // RelayerV2ResponseQueued
        case 202: {
          const bodyJson = await this._getResponseJson(response);

          try {
            assertIsRelayerV2ResponseQueued(bodyJson, 'body');
          } catch (e) {
            throw new RelayerV2InvalidGetResponseError({
              status: response.status,
              url: this._url,
              jobId: this.jobId,
              operation: this._relayerOperation,
              cause: e,
            });
          }

          let retry_after_sec = this._getRetryAfterHeaderValueInSecs(response);
          if (retry_after_sec < 1) retry_after_sec = 1;

          // Async onProgress callback
          this._postAsyncOnProgressCallback({
            type: 'queued',
            url: this._url,
            method: 'GET',
            status: responseStatus,
            requestId: bodyJson.requestId,
            operation: this._relayerOperation,
            jobId: this.jobId,
            retryAfter: retry_after_sec,
            retryCount: this._retryCount,
            elapsed,
          } satisfies RelayerV2ProgressQueued);

          // Wait if needed (minimum 1s)
          await this._setRetryAfterTimeout(retry_after_sec * 1000);
          continue;
        }
        case 400: {
          // Abort
          // Wrong jobId, incorrect format or unknown value etc.
          const bodyJson = await this._getResponseJson(response);

          try {
            assertIsRelayerV2ResponseFailedWithError400(bodyJson, 'body');
          } catch (e) {
            throw new RelayerV2InvalidGetResponseError({
              status: response.status,
              url: this._url,
              jobId: this.jobId,
              operation: this._relayerOperation,
              cause: e,
            });
          }

          this._throwRelayerV2Error({
            fetchMethod: 'GET',
            status: responseStatus,
            relayerApiError: bodyJson.error,
            elapsed,
          });
        }
        case 404: {
          // Abort
          // Wrong jobId, incorrect format or unknown value etc.
          const bodyJson = await this._getResponseJson(response);

          try {
            assertIsRelayerV2ResponseFailedWithError404(bodyJson, 'body');
          } catch (e) {
            throw new RelayerV2InvalidGetResponseError({
              status: response.status,
              url: this._url,
              jobId: this.jobId,
              operation: this._relayerOperation,
              cause: e,
            });
          }

          this._throwRelayerV2Error({
            fetchMethod: 'GET',
            status: responseStatus,
            relayerApiError: bodyJson.error,
            elapsed,
          });
        }
        // RelayerV2ResponseFailed
        // RelayerV2ApiError500
        case 500: {
          // Abort
          // Relayer internal error
          const bodyJson = await this._getResponseJson(response);

          try {
            assertIsRelayerV2ResponseFailedWithError500(bodyJson, 'body');
          } catch (e) {
            throw new RelayerV2InvalidGetResponseError({
              status: response.status,
              url: this._url,
              jobId: this.jobId,
              operation: this._relayerOperation,
              cause: e,
            });
          }

          this._throwRelayerV2Error({
            fetchMethod: 'GET',
            status: responseStatus,
            relayerApiError: bodyJson.error,
            elapsed,
          });
        }
        // RelayerV2ResponseFailed
        // RelayerV2ApiError503
        case 503: {
          // Abort
          // Possible Reasons: Gateway has some internal error (dont known)
          const bodyJson = await this._getResponseJson(response);

          try {
            assertIsRelayerV2ResponseFailedWithError503(bodyJson, 'body');
          } catch (e) {
            throw new RelayerV2InvalidGetResponseError({
              status: response.status,
              url: this._url,
              jobId: this.jobId,
              operation: this._relayerOperation,
              cause: e,
            });
          }

          this._throwRelayerV2Error({
            fetchMethod: 'GET',
            status: responseStatus,
            relayerApiError: bodyJson.error,
            elapsed,
          });
        }
        // RelayerV2ResponseFailed
        // RelayerV2ApiError504
        case 504: {
          // Abort
          // Possible Reasons: Gateway has not responded in time (gateway timeout)
          const bodyJson = await this._getResponseJson(response);

          try {
            assertIsRelayerV2ResponseFailedWithError504(bodyJson, 'body');
          } catch (e) {
            throw new RelayerV2InvalidGetResponseError({
              status: response.status,
              url: this._url,
              jobId: this.jobId,
              operation: this._relayerOperation,
              cause: e,
            });
          }

          this._throwRelayerV2Error({
            fetchMethod: 'GET',
            status: responseStatus,
            relayerApiError: bodyJson.error,
            elapsed,
          });
        }
        default: {
          // Use TS compiler + `never` to guarantee the switch integrity
          const throwUnsupportedStatus = (unsupportedStatus: never) => {
            throw new RelayerV2UnexpectedGetStatusError({
              status: unsupportedStatus,
              url: this._url,
              operation: this._relayerOperation,
            });
          };
          throwUnsupportedStatus(responseStatus);
        }
      }
    }
    // Infinite loop error
    this._throwInternalError('Inifinite loop');
  }

  //////////////////////////////////////////////////////////////////////////////

  private async _getResponseJson(response: Response): Promise<any> {
    const bodyJson = await response.json();

    this._assertCanContinueAfterAwait();

    return bodyJson;
  }

  //////////////////////////////////////////////////////////////////////////////

  private _getRetryAfterHeaderValueInSecs(response: Response): number {
    if (!response.headers.has('Retry-After')) {
      if (this._throwErrorIfNoRetryAfter) {
        throw new Error(`Missing 'Retry-After' header key`);
      }
      return RelayerV2AsyncRequest.DEFAULT_RETRY_AFTER_SECS;
    }

    try {
      const n = Number.parseInt(response.headers.get('Retry-After')!);
      if (isUint(n)) {
        return n;
      }
    } catch {
      //
    }

    if (this._throwErrorIfNoRetryAfter) {
      throw new Error(`Invalid 'Retry-After' header key`);
    }

    return RelayerV2AsyncRequest.DEFAULT_RETRY_AFTER_SECS;
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
  private _setJobIdOnce(jobId: string) {
    this._assert(jobId !== undefined, 'jobId !== undefined');
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

  private async _fetchPost() {
    // Debug state-check guards:
    // - the jobId is guaranteed to be undefined.
    // - `terminated` is guaranteed to be `false`
    // - `fetching` is guaranteed to be `false`
    this._assert(this._jobId === undefined, 'this._jobId === undefined');
    this._assert(!this._state.terminated, '!this._state.terminated');
    this._assert(!this._state.fetching, '!this._state.fetching');

    this._trace('_fetchPost', 'enter');

    const init = setAuth(
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this._payload),
        ...(this._internalAbortSignal
          ? { signal: this._internalAbortSignal }
          : {}),
      } satisfies RequestInit,
      this._fhevmInstanceOptions?.auth,
    );

    this._state.fetching = true;

    let response;
    try {
      response = await fetch(this._url, init);
    } catch (e) {
      this._state.fetching = false;

      // Warning: `terminated` can be `true` here!
      // (ex: if `controller.abort()` has been called from the outside while still executing `fetch`)

      this._trace('_fetchPost', 'catch(e) + throw e: ' + e);

      // Keep the standard 'AbortError'
      if ((e as any).name === 'AbortError') {
        throw e;
      } else {
        throw new RelayerV2FetchError('POST', {
          url: this._url,
          operation: this._relayerOperation,
          cause: e,
        });
      }
    }

    this._state.fetching = false;

    // Debug state-check guards:
    // - the jobId is guaranteed to be undefined.
    // - `terminated` is guaranteed to be `false`
    this._assert(this._jobId === undefined, 'this._jobId === undefined');
    this._assert(!this._state.terminated, '!this._state.terminated');

    // Debug
    this._assertCanContinueAfterAwait();

    this._trace('_fetchPost', 'return response Ok');

    return response;
  }

  //////////////////////////////////////////////////////////////////////////////

  private async _fetchGet() {
    // Debug state-check guards:
    // - the jobId is guaranteed to be set.
    // - `terminated` is guaranteed to be `false`
    // - `fetching` is guaranteed to be `false`
    this._assert(this._jobId !== undefined, 'this._jobId !== undefined');
    this._assert(!this._state.terminated, '!this._state.terminated');
    this._assert(!this._state.fetching, '!this._state.fetching');

    this._trace('_fetchGet', `jobId=${this.jobId}`);

    const init: RequestInit | undefined = this._internalAbortSignal
      ? { signal: this._internalAbortSignal }
      : undefined;

    this._state.fetching = true;

    let response;
    try {
      response = await fetch(`${this._url}/${this.jobId}`, init);
    } catch (e) {
      this._state.fetching = false;
      // Warning: `terminated` can be `true` here!
      // (ex: if `controller.abort()` has been called from the outside while still executing `fetch`)
      this._trace('_fetchGet', `jobId=${this.jobId}, catch(e) + throw e: ${e}`);

      // Keep the standard 'AbortError'
      if ((e as any).name === 'AbortError') {
        throw e;
      } else {
        throw new RelayerV2FetchError('GET', {
          url: `${this._url}/${this.jobId}`,
          jobId: this.jobId,
          operation: this._relayerOperation,
          cause: e,
        });
      }
    }

    this._state.fetching = false;

    // Debug state-check guards:
    // - the jobId is guaranteed to be set.
    // - `terminated` is guaranteed to be `false`
    this._assert(this._jobId !== undefined, 'this._jobId !== undefined');
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
  private _handleExternalSignalAbort = (ev: Event) => {
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
  private _handleInternalSignalAbort = (ev: Event) => {
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

    this._terminate('abort');
  };

  //////////////////////////////////////////////////////////////////////////////
  // Terminate
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Can be called multiple times
   */
  private _terminate(reason: RelayerV2TerminateReason, error?: unknown) {
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

    this._tryClearRetryAfterTimeout();
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
    this._assert(delayMs >= 1000, 'delayMs >= 1000');

    this._trace('_setRetryAfterTimeout', `delayMs=${delayMs}`);

    if (this._retryAfterTimeoutID !== undefined) {
      return Promise.reject(new Error(`retry-after already running.`));
    }

    const p = new Promise<void>((resolve, reject) => {
      this._retryAfterTimeoutPromiseFuncReject = reject;

      const callback = () => {
        this._retryAfterTimeoutID = undefined;
        this._retryAfterTimeoutPromiseFuncReject = undefined;
        resolve();
      };

      this._retryCount++;
      this._retryAfterTimeoutID = setTimeout(callback, delayMs);
    });

    this._assert(
      this._retryAfterTimeoutID !== undefined,
      'this._retryAfterTimeoutID !== undefined',
    );
    this._assert(
      this._retryAfterTimeoutPromiseFuncReject !== undefined,
      'this._retryAfterTimeoutPromiseFuncReject !== undefined',
    );

    return p;
  }

  //////////////////////////////////////////////////////////////////////////////

  private _tryClearRetryAfterTimeout() {
    if (this._retryAfterTimeoutID === undefined) {
      // Debug
      this._assert(
        this._retryAfterTimeoutPromiseFuncReject === undefined,
        'this._retryAfterTimeoutPromiseFuncReject === undefined',
      );
      return;
    }

    const reject = this._retryAfterTimeoutPromiseFuncReject!;
    const tid = this._retryAfterTimeoutID;

    this._retryAfterTimeoutID = undefined;
    this._retryAfterTimeoutPromiseFuncReject = undefined;

    clearTimeout(tid);

    reject(new Error('_tryClearRetryAfterTimeout'));
  }

  //////////////////////////////////////////////////////////////////////////////
  // Global Request Timeout
  //////////////////////////////////////////////////////////////////////////////

  private _setGlobalRequestTimeout(delayMs: number) {
    // Debug
    this._assert(
      this._requestGlobalTimeoutID === undefined,
      'this._requestGlobalTimeoutID === undefined',
    );

    const callback = () => {
      this._requestGlobalTimeoutID = undefined;
      this._handleGlobalRequestTimeout();
    };

    this._requestGlobalTimeoutID = setTimeout(callback, delayMs);
  }

  private _handleGlobalRequestTimeout() {
    this._terminate('timeout');
  }

  private _tryClearGlobalRequestTimeout() {
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

  private _postAsyncOnProgressCallback(args: RelayerV2ProgressArgs) {
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

  private _throwRelayerV2Error(params: {
    fetchMethod: 'GET' | 'POST';
    status: RelayerV2ProgressFailureStatus;
    relayerApiError: RelayerV2ApiError;
    elapsed: number;
  }): never {
    // Clone
    const clonedRelayerApiError = JSON.parse(
      JSON.stringify(params.relayerApiError),
    );

    // Async onProgress callback
    this._postAsyncOnProgressCallback({
      type: 'failed',
      url: this._url,
      method: params.fetchMethod,
      status: params.status,
      ...(this._jobId ? { jobId: this._jobId } : {}),
      operation: this._relayerOperation,
      retryCount: this._retryCount,
      elapsed: params.elapsed,
      relayerApiError: clonedRelayerApiError,
    } satisfies RelayerV2ProgressFailed);

    throw new RelayerV2Error({
      fetchMethod: params.fetchMethod,
      url: this._url,
      status: params.status,
      ...(this._jobId ? { jobId: this._jobId } : {}),
      operation: this._relayerOperation,
      retryCount: this._retryCount,
      elapsed: params.elapsed,
      relayerApiError: params.relayerApiError,
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
  private _assertCanContinueAfterAwait() {
    if (!this._canContinue()) {
      this._throwInternalError('cannot continue.');
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Trace
  //////////////////////////////////////////////////////////////////////////////

  private _trace(functionName: string, message: string) {
    console.log(`[RelayerV2AsyncRequest]:${functionName}: ${message}`);
  }
}
