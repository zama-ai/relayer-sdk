import { isUint } from '../../utils/uint';
import { setAuth, type Auth } from '../../auth';
import {
  assertIsRelayerV2ResponseFailedWithError500,
  assertIsRelayerV2ResponseFailedWithError400,
  assertIsRelayerV2ResponseFailedWithError429,
  assertIsRelayerV2ResponseFailedWithError503,
  assertIsRelayerV2ResponseFailedWithError504,
} from './types/RelayerV2ResponseFailed';
import type {
  RelayerV2ApiError,
  RelayerV2ResultInputProof,
  RelayerV2ResultPublicDecrypt,
  RelayerV2ResultUserDecrypt,
  RelayerV2PostResponseStatus,
  RelayerV2GetResponseStatus,
} from './types/types';
import { RelayerV2InvalidPostResponseError } from './errors/RelayerV2InvalidPostResponseError';
import { RelayerV2UnexpectedPostStatusError } from './errors/RelayerV2UnexpectedPostStatusError';
import { RelayerV2InvalidGetResponseError } from './errors/RelayerV2InvalidGetResponseError';
import { RelayerV2UnexpectedGetStatusError } from './errors/RelayerV2UnexpectedGetStatusError';
import { RelayerV2FetchError } from './errors/RelayerV2FetchError';
import { assertIsRelayerV2GetResponseInputProofSucceeded } from './types/RelayerV2GetResponseInputProofSucceeded';
import { assertIsRelayerV2GetResponsePublicDecryptSucceeded } from './types/RelayerV2GetResponsePublicDecryptSucceeded';
import { assertIsRelayerV2GetResponseUserDecryptSucceeded } from './types/RelayerV2GetResponseUserDecryptSucceeded';
import { RelayerV2InternalRequestError } from './errors/RelayerV2InternalRequestError';
import { assertIsRelayerV2ResponseQueued } from './types/RelayerV2ResponseQueued';

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

export class RelayerV2AsyncRequest {
  private _jobId: string | undefined;
  private _state: {
    running: boolean;
    canceled: boolean;
    completed: boolean;
    failed: boolean;
    aborted: boolean;
    terminated: boolean;
    fetching: boolean;
  };
  private _relayerOperation: 'INPUT_PROOF' | 'PUBLIC_DECRYPT' | 'USER_DECRYPT';
  private _publicAPINoReentrancy: boolean;
  private _abortController: AbortController;
  private _terminateReason: string | undefined;
  private _retryCount: number;
  private _retryAfterTimeoutID: any;
  private _abortSignal: AbortSignal | undefined;
  private _url: string;
  private _payload: Record<string, unknown>;
  private _options: { auth?: Auth } | undefined;
  private _retryAfterTimeoutPromiseFuncReject?: (reason?: any) => void;
  private _onProgress?: () => void;
  private _requestMaxDurationInSecs: number;
  private _requestStartTimestamp: number | undefined;
  private _requestGlobalTimeoutID: any;
  private _throwErrorIfNoRetryAfter: boolean;

  private static readonly DEFAULT_RETRY_AFTER_SECS = 2;
  private static readonly DEFAULT_GLOBAL_REQUEST_TIMEOUT_SECS = 60;
  private static readonly MAX_GET_RETRY = 100;
  private static readonly MAX_POST_RETRY = 100;

  constructor(params: {
    relayerOperation: 'INPUT_PROOF' | 'PUBLIC_DECRYPT' | 'USER_DECRYPT';
    url: string;
    payload: Record<string, unknown>;
    timeoutInSeconds?: number;
    throwErrorIfNoRetryAfter?: boolean;
    onProgress?: () => void;
    options?: { auth?: Auth };
  }) {
    if (
      params.relayerOperation !== 'INPUT_PROOF' &&
      params.relayerOperation !== 'PUBLIC_DECRYPT' &&
      params.relayerOperation !== 'USER_DECRYPT'
    ) {
      throw new Error(`Invalid relayerOperation ${params.relayerOperation}`);
    }

    this._relayerOperation = params.relayerOperation;
    this._abortController = new AbortController();
    this._abortSignal = this._abortController.signal;
    this._abortSignal.addEventListener('abort', this._handleSignalAbort);
    this._url = params.url;
    this._payload = params.payload;
    this._options = params.options;
    this._onProgress = params.onProgress;
    this._state = {
      running: false,
      canceled: false,
      terminated: false,
      completed: false,
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

    if (this._state.aborted) {
      throw new Error(`Relayer request already aborted`);
    }

    if (this._state.running) {
      throw new Error(`Relayer request already running`);
    }
    this._state.running = true;

    if (this._abortSignal && this._abortSignal.aborted) {
      throw new Error(`Aborted reason=` + this._abortSignal.reason);
    }

    this._requestStartTimestamp = Date.now();
    this._setGlobalRequestTimeout(this._requestMaxDurationInSecs * 1000);

    try {
      const json = await this._runPostLoop();
      return json;
    } catch (e) {
      this._state.failed = true;

      if ((e as any).name === 'AbortError') {
        this._assert(this._state.aborted, 'this._state.aborted');
        this._assert(this._state.terminated, 'this._state.terminated');
      }

      throw e;
    } finally {
      this._terminate('completed');
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Public API: cancel
  //////////////////////////////////////////////////////////////////////////////

  public cancel() {
    if (this._publicAPINoReentrancy) {
      throw new Error(`Relayer.cancel() call not permitted`);
    }

    if (!this._canContinue()) {
      this._trace('cancel', '!this._canContinue()');
      return;
    }

    this._state.canceled = true;
    this._abortController.abort('cancel');

    // Debug
    this._assert(this._state.aborted, 'this._state.aborted');
    this._assert(this._state.terminated, 'this._state.terminated');
  }

  //////////////////////////////////////////////////////////////////////////////
  // Public API: getters
  //////////////////////////////////////////////////////////////////////////////

  public get canceled(): boolean {
    return this._state.canceled;
  }

  public get terminated(): boolean {
    return this._state.terminated;
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

  public get completed(): boolean {
    return this._state.completed;
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

      this._assertCanContinueAfterAwait('POST');

      // At this stage: `terminated` is guaranteed to be `false`.
      // However, the `fetch` call can potentially throw an `AbortError`. In this case
      // in the error catch the `terminated` flag will be `true`! But, that's ok because the
      // next part of the function will never be executed (thrown error).
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
          const bodyJson = await this._getResponseJson(response, 'POST');

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

          const retry_after_ms =
            this._getRetryAfterHeaderValueInSecs(response) * 1000;

          // Debug: will throw an assert failed error if jobId has already been set
          this._setJobIdOnce(bodyJson.result.job_id);

          // Async onProgress callback
          this._postAsyncOnProgressCallback();

          // Wait if needed (minimum 1s)
          await this._setRetryAfterTimeout(retry_after_ms);

          const json = await this._runGetLoop();
          return json;
        }
        // RelayerV2ResponseFailed
        // RelayerV2ApiError400
        // RelayerV2ApiError400WithDetails
        case 400: {
          const bodyJson = await this._getResponseJson(response, 'POST');

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

          this._throwError({
            status: response.status,
            relayerError: bodyJson.error,
          });
        }
        // RelayerV2ResponseFailed
        // RelayerV2ApiError429
        case 429: {
          // Retry
          // Rate Limit error (Cloudflare/Kong/Relayer), reason in message
          const bodyJson = await this._getResponseJson(response, 'POST');

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

          const retry_after_ms =
            this._getRetryAfterHeaderValueInSecs(response) * 1000;

          // Async onProgress callback
          this._postAsyncOnProgressCallback();

          // Wait if needed (minimum 1s)
          await this._setRetryAfterTimeout(retry_after_ms);

          continue;
        }
        // RelayerV2ResponseFailed
        // RelayerV2ApiError500
        case 500: {
          // Abort
          // Relayer internal error
          const bodyJson = await this._getResponseJson(response, 'POST');

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

          this._throwError({
            status: response.status,
            relayerError: bodyJson.error,
          });
        }
        // RelayerV2ResponseFailed
        // RelayerV2ApiError503
        case 503: {
          // Abort
          // Possible Reasons: Gateway has some internal error (dont known)
          const bodyJson = await this._getResponseJson(response, 'POST');

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

          this._throwError({
            status: response.status,
            relayerError: bodyJson.error,
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
    throw new RelayerV2InternalRequestError({
      fetchMethod: 'POST',
      url: this._url,
      operation: this._relayerOperation,
      message: 'Inifinite loop',
    });
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

      this._assertCanContinueAfterAwait('GET');

      const response = await this._fetchGet();

      // At this stage: `terminated` is guaranteed to be `false`.

      const responseStatus: RelayerV2GetResponseStatus =
        response.status as RelayerV2GetResponseStatus;

      switch (responseStatus) {
        // RelayerV2GetResponseSucceeded
        case 200: {
          const bodyJson = await this._getResponseJson(response, 'GET');

          try {
            if (this._relayerOperation === 'INPUT_PROOF') {
              assertIsRelayerV2GetResponseInputProofSucceeded(bodyJson, 'body');
            } else if (this._relayerOperation === 'PUBLIC_DECRYPT') {
              assertIsRelayerV2GetResponsePublicDecryptSucceeded(
                bodyJson,
                'body',
              );
            } else if (this._relayerOperation === 'USER_DECRYPT') {
              assertIsRelayerV2GetResponseUserDecryptSucceeded(
                bodyJson,
                'body',
              );
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
          const bodyJson = await this._getResponseJson(response, 'GET');

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

          const retry_after_ms =
            this._getRetryAfterHeaderValueInSecs(response) * 1000;

          // Async onProgress callback
          this._postAsyncOnProgressCallback();

          // Wait if needed (minimum 1s)
          await this._setRetryAfterTimeout(retry_after_ms);
          continue;
        }
        case 404: {
          // Abort
          // Wrong jobId, incorrect format or unknown value etc.
          throw new Error(`Get Error 404 not yet implemented`);
        }
        // RelayerV2ResponseFailed
        // RelayerV2ApiError500
        case 500: {
          // Abort
          // Relayer internal error
          const bodyJson = await this._getResponseJson(response, 'GET');

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

          this._throwError({
            status: response.status,
            relayerError: bodyJson.error,
          });
        }
        // RelayerV2ResponseFailed
        // RelayerV2ApiError503
        case 503: {
          // Abort
          // Possible Reasons: Gateway has some internal error (dont known)
          const bodyJson = await this._getResponseJson(response, 'GET');

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

          this._throwError({
            status: response.status,
            relayerError: bodyJson.error,
          });
        }
        // RelayerV2ResponseFailed
        // RelayerV2ApiError504
        case 504: {
          // Abort
          // Possible Reasons: Gateway has not responded in time (gateway timeout)
          const bodyJson = await this._getResponseJson(response, 'GET');

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

          this._throwError({
            status: response.status,
            relayerError: bodyJson.error,
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
    throw new RelayerV2InternalRequestError({
      fetchMethod: 'GET',
      url: this._url,
      operation: this._relayerOperation,
      message: 'Inifinite loop',
      jobId: this.jobId,
    });
  }

  //////////////////////////////////////////////////////////////////////////////

  private async _getResponseJson(
    response: Response,
    fetchMethod: 'GET' | 'POST',
  ): Promise<any> {
    const bodyJson = await response.json();

    this._assertCanContinueAfterAwait(fetchMethod);

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
   * @throws {RelayerV2InternalRequestError} Thrown if jobId is undefined or if the jobId has already been set.
   */
  private _setJobIdOnce(jobId: string) {
    this._assert(jobId !== undefined, 'jobId !== undefined');
    this._assert(this._jobId === undefined, 'this._jobId === undefined');

    this._jobId = jobId;
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
        ...(this._abortSignal ? { signal: this._abortSignal } : {}),
      } satisfies RequestInit,
      this._options?.auth,
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
        throw new RelayerV2FetchError({
          fetchMethod: 'POST',
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
    this._assertCanContinueAfterAwait('POST');

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

    const init: RequestInit | undefined = this._abortSignal
      ? { signal: this._abortSignal }
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
        throw new RelayerV2FetchError({
          fetchMethod: 'GET',
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
    this._assertCanContinueAfterAwait('GET');

    this._trace('_fetchGet', `jobId=${this.jobId}, return response Ok`);
    return response;
  }

  //////////////////////////////////////////////////////////////////////////////
  // AbortSignal
  //////////////////////////////////////////////////////////////////////////////

  // Warning: Use arrow function only!
  private _handleSignalAbort = (ev: Event) => {
    if (this._abortSignal === undefined) {
      console.log(`Warning _release was already called?`);
    }

    const signal = ev.currentTarget as AbortSignal;

    // Debug state-check guards:
    this._assert(
      this instanceof RelayerV2AsyncRequest,
      `this instanceof RelayerV2AsyncRequest`,
    );
    this._assert(signal === this._abortSignal, 'signal === this._signal');
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
  private _terminate(reason: string) {
    // Warning: this._state.fetching can be true
    // ex: call cancel while fetch is running

    if (this._state.terminated) {
      this._trace(
        '_terminate',
        `already terminated with reason='${this._terminateReason}'. IGNORE`,
      );
      this._assert(
        this._terminateReason !== undefined,
        'this._terminateReason !== undefined',
      );
      this._assert(
        this._abortSignal === undefined,
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
    this._state.terminated = true;

    this._tryClearRetryAfterTimeout();
    this._tryClearGlobalRequestTimeout();

    const s = this._abortSignal;

    this._abortSignal = undefined;

    if (s) {
      s.removeEventListener('abort', this._handleSignalAbort);
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

    if (delayMs < 1000) {
      delayMs = 1000;
    }

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

  private _postAsyncOnProgressCallback() {
    const onProgressFunc = this._onProgress;
    if (onProgressFunc) {
      Promise.resolve().then(() => {
        // onProgressFunc() will execute asynchronously in the next cycle of
        // the JavaScript event loop (the microtask queue).
        onProgressFunc();
      });
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Errors
  //////////////////////////////////////////////////////////////////////////////

  private _throwError(params: {
    status: number;
    relayerError: RelayerV2ApiError;
  }): never {
    throw new Error(JSON.stringify(params));
  }

  private _assert(condition: boolean, message: string): asserts condition {
    if (!condition) {
      throw new RelayerV2InternalRequestError({
        operation: this._relayerOperation,
        url: this._url,
        message: `Assertion failed: ${message}`,
        state: JSON.stringify(this._state),
        jobId: this._jobId, // internal value
      });
    }
  }

  private _canContinue() {
    return !(
      this._state.canceled ||
      this._state.terminated ||
      this._state.completed ||
      this._state.aborted
    );
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
   * @param fetchMethod - The HTTP method ('GET' or 'POST') used in the operation
   * that just completed (used for debugging/logging the context of the error).
   * @throws {RelayerV2InternalRequestError} Thrown if the state check fails (i.e., this._canContinue() is false).
   * The error includes relevant state information (like current state and jobId)
   * to aid in debugging the exact point of the integrity failure.
   */
  private _assertCanContinueAfterAwait(fetchMethod: 'GET' | 'POST') {
    if (!this._canContinue()) {
      throw new RelayerV2InternalRequestError({
        fetchMethod,
        operation: this._relayerOperation,
        url: this._url,
        message: `cannot continue.`,
        state: JSON.stringify(this._state),
        jobId: this._jobId, // internal value
      });
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Trace
  //////////////////////////////////////////////////////////////////////////////

  private _trace(functionName: string, message: string) {
    console.log(`[RelayerV2AsyncRequest]:${functionName}: ${message}`);
  }
}
