import { isUint } from '../../utils/uint';
import { setAuth, type Auth } from '../../auth';
import { assertIsRelayerV2GetResponseSucceeded } from './types/RelayerV2GetResponseSucceeded';
import {
  assertIsRelayerV2ResponseFailedWithError500,
  assertIsRelayerV2ResponseFailedWithError400,
  assertIsRelayerV2ResponseFailedWithPostError429,
} from './types/RelayerV2ResponseFailed';
import { assertIsRelayerV2ResponseQueued } from './types/RelayerV2ResponseQueuedOrFailed';
import type {
  RelayerV2ApiError,
  RelayerV2ResultInputProof,
  RelayerV2ResultPublicDecrypt,
  RelayerV2ResultUserDecrypt,
} from './types/types';
import { RelayerV2InvalidPostResponseError } from './errors/RelayerV2InvalidPostResponseError';
import { RelayerOperation } from 'src/relayer/fetchRelayer';
import { RelayerV2UnexpectedPostStatusError } from './errors/RelayerV2UnexpectedPostStatusError';
import { RelayerV2InternalError } from './errors/RelayerV2InternalError';
import { RelayerV2InvalidGetResponseError } from './errors/RelayerV2InvalidGetResponseError';
import { RelayerV2UnexpectedGetStatusError } from './errors/RelayerV2UnexpectedGetStatusError';
import { RelayerV2FetchError } from './errors/RelayerV2FetchError';

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
  private _relayerOperation: RelayerOperation;
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
    relayerOperation: RelayerOperation;
    url: string;
    payload: Record<string, unknown>;
    timeoutInSeconds?: number;
    throwErrorIfNoRetryAfter?: boolean;
    onProgress?: () => void;
    options?: { auth?: Auth };
  }) {
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

  private async _runPostLoop(): Promise<
    | RelayerV2ResultPublicDecrypt
    | RelayerV2ResultUserDecrypt
    | RelayerV2ResultInputProof
  > {
    // No infinite loop!
    let i = 0;
    while (i < RelayerV2AsyncRequest.MAX_POST_RETRY) {
      ++i;

      this._assertCanContinueAfterAwait(`_runPostLoop()`);

      // At this stage: `terminated` is always `false`.
      // However, the `fetch` call can potentially throw an `AbortError`. In this case
      // in the error catch the `terminated` flag will be `true`! But, that's ok because the
      // next part of the function will never be executed (thrown error).
      const response = await this._fetchPost();

      // Here the `terminated` flag is guaranteed to false.

      switch (response.status) {
        // RelayerV2ResponseQueued
        case 202: {
          // response.json() errors:
          // 1. if body is already read (call json() 2 times)
          //    - TypeError: Body is unusable: Body has already been read
          // 2. if body is invalid JSON
          //    - SyntaxError: Unexpected end of JSON input
          //    - SyntaxError: Expected property name or '}' in JSON at position 1 (line 1 column 2) at JSON.parse (<anonymous>)
          const bodyJson = await this._getResponseJson(
            response,
            '_runPostLoop()',
          );

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

          this._assert(this._jobId === undefined, 'this._jobId === undefined');
          this._jobId = bodyJson.result.job_id;

          // Async onProgress callback
          this._postAsyncOnProgressCallback();

          // Wait if needed (minimum 1s)
          await this._setRetryAfterTimeout(retry_after_ms);

          const json = await this._runGetLoop(bodyJson.result.job_id);
          return json;
        }
        // RelayerV2ResponseFailed
        // RelayerV2ApiError400
        // RelayerV2ApiError400WithDetails
        case 400: {
          const bodyJson = await this._getResponseJson(
            response,
            '_runPostLoop()',
          );

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
        // RelayerV2ApiPostError429
        case 429: {
          const bodyJson = await this._getResponseJson(
            response,
            '_runPostLoop()',
          );

          try {
            assertIsRelayerV2ResponseFailedWithPostError429(bodyJson, 'body');
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
          const bodyJson = await this._getResponseJson(
            response,
            '_runPostLoop()',
          );

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
        default: {
          throw new RelayerV2UnexpectedPostStatusError({
            status: response.status,
            url: this._url,
            operation: this._relayerOperation,
          });
        }
      }
    }
    // Infinite loop error
    throw new RelayerV2InternalError({
      fetchMethod: 'POST',
      url: this._url,
      operation: this._relayerOperation,
      message: 'Inifinite loop',
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // Get Loop
  //////////////////////////////////////////////////////////////////////////////

  // status: 200 | 202 | 400 | 404 | 429 | 500 | 503 | 504
  private async _runGetLoop(
    jobId: string,
  ): Promise<
    | RelayerV2ResultPublicDecrypt
    | RelayerV2ResultUserDecrypt
    | RelayerV2ResultInputProof
  > {
    this._assert(this._jobId !== undefined, 'this._jobId !== undefined');

    let i = 0;
    while (i < RelayerV2AsyncRequest.MAX_GET_RETRY) {
      ++i;

      this._assertCanContinueAfterAwait(`_runGetLoop(${jobId})`);

      const response = await this._fetchGet(jobId);

      switch (response.status) {
        // RelayerV2GetResponseSucceeded
        case 200: {
          const bodyJson = await this._getResponseJson(
            response,
            `_runGetLoop(${jobId})`,
          );

          try {
            assertIsRelayerV2GetResponseSucceeded(bodyJson, 'body');
          } catch (e) {
            throw new RelayerV2InvalidGetResponseError({
              status: response.status,
              url: this._url,
              jobId,
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
          const bodyJson = await this._getResponseJson(
            response,
            `_runGetLoop(${jobId})`,
          );

          try {
            assertIsRelayerV2ResponseQueued(bodyJson, 'body');
          } catch (e) {
            throw new RelayerV2InvalidGetResponseError({
              status: response.status,
              url: this._url,
              jobId,
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
        case 400: {
          const bodyJson = await this._getResponseJson(
            response,
            `_runGetLoop(${jobId})`,
          );

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
        case 404: {
          throw new Error(`Get Error 404 not yet implemented`);
        }
        case 429: {
          throw new Error(`Get Error 429 not yet implemented`);
        }
        case 500: {
          throw new Error(`Get Error 500 not yet implemented`);
        }
        case 503: {
          throw new Error(`Get Error 503 not yet implemented`);
        }
        case 504: {
          throw new Error(`Get Error 504 not yet implemented`);
        }
        default: {
          throw new RelayerV2UnexpectedGetStatusError({
            status: response.status,
            url: this._url,
            operation: this._relayerOperation,
          });
        }
      }
    }
    // Infinite loop error
    throw new RelayerV2InternalError({
      fetchMethod: 'GET',
      url: this._url,
      operation: this._relayerOperation,
      message: 'Inifinite loop',
    });
  }

  //////////////////////////////////////////////////////////////////////////////

  private async _getResponseJson(response: Response, op: string): Promise<any> {
    const bodyJson = await response.json();

    this._assertCanContinueAfterAwait(op);

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
  // Fetch functions
  //////////////////////////////////////////////////////////////////////////////

  private async _fetchPost() {
    this._trace('_fetchPost', 'enter');

    this._assert(!this._state.fetching, '!this._state.fetching');

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
      throw new RelayerV2FetchError({
        fetchMethod: 'POST',
        url: this._url,
        operation: this._relayerOperation,
        cause: e,
      });
    }

    this._state.fetching = false;

    // here: `terminated` is guaranteed to be `false`

    // Debug
    this._assertCanContinueAfterAwait(`_runPostLoop()`);

    this._trace('_fetchPost', 'return response Ok');

    return response;
  }

  //////////////////////////////////////////////////////////////////////////////

  private async _fetchGet(jobId: string) {
    this._trace('_fetchGet', `jobId=${jobId}`);

    this._assert(!this._state.fetching, '!this._state.fetching');

    const init: RequestInit | undefined = this._abortSignal
      ? { signal: this._abortSignal }
      : undefined;

    this._state.fetching = true;

    let response;
    try {
      response = await fetch(`${this._url}/${jobId}`, init);
    } catch (e) {
      this._state.fetching = false;
      this._trace('_fetchGet', `jobId=${jobId}, catch(e) + throw e: ${e}`);
      throw new RelayerV2FetchError({
        fetchMethod: 'GET',
        url: `${this._url}/${jobId}`,
        jobId,
        operation: this._relayerOperation,
        cause: e,
      });
    }

    this._state.fetching = false;

    // Debug
    this._assertCanContinueAfterAwait(`_runGetLoop(${jobId})`);

    this._trace('_fetchGet', `jobId=${jobId}, return response Ok`);
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

    // Debug
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
      this._trace('_terminate', `reason=${reason} already terminated. IGNORE`);
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
      // Debug (defensive programming)
      this._publicAPINoReentrancy = true;

      Promise.resolve().then(() => {
        onProgressFunc();
      });

      // Debug (defensive programming)
      this._publicAPINoReentrancy = false;
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
      throw new Error(`Assertion failed: ${message}`);
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

  private _assertCanContinueAfterAwait(op: string) {
    if (!this._canContinue()) {
      throw new Error(`${op} cannot continue ${JSON.stringify(this._state)}`);
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // Trace
  //////////////////////////////////////////////////////////////////////////////

  private _trace(functionName: string, message: string) {
    console.log(`[RelayerV2AsyncRequest]:${functionName}: ${message}`);
  }
}
