import { setAuth, type Auth } from '../../auth';
import { assertIsRelayerV2GetResponseSucceeded } from './types/RelayerV2GetResponseSucceeded';
import {
  assertIsRelayerV2ResponseFailedWithError500,
  assertIsRelayerV2ResponseFailedWithPostError400,
  assertIsRelayerV2ResponseFailedWithPostError429,
} from './types/RelayerV2ResponseFailed';
import { assertIsRelayerV2ResponseQueued } from './types/RelayerV2ResponseQueuedOrFailed';
import type {
  RelayerV2ApiError,
  RelayerV2ResultInputProof,
  RelayerV2ResultPublicDecrypt,
  RelayerV2ResultUserDecrypt,
} from './types/types';

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
  private _requestId: string | undefined;
  private _state: {
    running: boolean;
    canceled: boolean;
    completed: boolean;
    failed: boolean;
    aborted: boolean;
    terminated: boolean;
  };
  private _retryCount: number;
  private _retryAfterTimeoutID: any;
  private _hasSignal: boolean;
  private _signal: AbortSignal | undefined;
  private _url: string;
  private _payload: Record<string, unknown>;
  private _options: { auth?: Auth } | undefined;
  private _retryAfterTimeoutPromiseFuncReject?: (reason?: any) => void;

  private constructor(params: {
    url: string;
    payload: Record<string, unknown>;
    signal?: AbortSignal;
    options?: { auth?: Auth };
  }) {
    this._url = params.url;
    this._payload = params.payload;
    this._options = params.options;
    this._state = {
      running: false,
      canceled: false,
      terminated: false,
      completed: false,
      aborted: false,
      failed: false,
    };
    this._retryCount = 0;
    this._retryAfterTimeoutID = undefined;
    this._signal = params.signal;
    this._hasSignal = false;
    if (this._signal) {
      this._hasSignal = true;
      this._signal.addEventListener('abort', this._handleSignalAbort);
    }
  }

  public async run(): Promise<any> {
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

    try {
      const json = await this._runPostLoop();
      return json;
    } finally {
      this._terminate();
    }
  }

  private async _getResponseJson(response: Response, op: string): Promise<any> {
    const bodyJson = await response.json();

    this._assertCanContinueAfterAwait(op);

    return bodyJson;
  }

  private async _runPostLoop(): Promise<
    | RelayerV2ResultPublicDecrypt
    | RelayerV2ResultUserDecrypt
    | RelayerV2ResultInputProof
  > {
    // No infinite loop!
    let i = 0;
    while (i < 100) {
      ++i;

      this._assertCanContinueAfterAwait(`_runPostLoop()`);

      const response = await this._fetchPost();

      this._assertCanContinueAfterAwait(`_runPostLoop()`);

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
          assertIsRelayerV2ResponseQueued(bodyJson, 'body');

          const retry_after_ms = Date.parse(bodyJson.result.retry_after);
          const ms = retry_after_ms - Date.now();

          this._assert(
            this._requestId === undefined,
            'this._requestId === undefined',
          );
          this._requestId = bodyJson.result.id;

          // Wait if needed (minimum 1s)
          await this._setRetryAfterTimeout(ms);

          const json = await this._runGetLoop(bodyJson.result.id);
          return json;
        }
        // RelayerV2ResponseFailed
        // RelayerV2ApiPostError400
        // RelayerV2ApiPostError400WithDetails
        case 400: {
          const bodyJson = await this._getResponseJson(
            response,
            '_runPostLoop()',
          );
          assertIsRelayerV2ResponseFailedWithPostError400(bodyJson, 'body');

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
          assertIsRelayerV2ResponseFailedWithPostError429(bodyJson, 'body');

          const retry_after_ms = Date.parse(bodyJson.error.retry_after);
          const ms = retry_after_ms - Date.now();

          // Wait if needed
          await this._setRetryAfterTimeout(ms);

          continue;
        }
        // RelayerV2ResponseFailed
        // RelayerV2ApiError500
        case 500: {
          const bodyJson = await this._getResponseJson(
            response,
            '_runPostLoop()',
          );
          assertIsRelayerV2ResponseFailedWithError500(bodyJson, 'body');

          this._throwError({
            status: response.status,
            relayerError: bodyJson.error,
          });
        }
        default: {
          // Unknown error
          throw new Error(`Unknown response.status=${response.status}`);
        }
      }
    }
    throw new Error(`Internal Error: Abort _runPostLoop`);
  }

  private async _runGetLoop(
    requestId: string,
  ): Promise<
    | RelayerV2ResultPublicDecrypt
    | RelayerV2ResultUserDecrypt
    | RelayerV2ResultInputProof
  > {
    this._assert(
      this._requestId !== undefined,
      'this._requestId !== undefined',
    );

    let i = 0;
    while (i < 100) {
      ++i;

      this._assertCanContinueAfterAwait(`_runGetLoop(${requestId})`);

      const response = await this._fetchGet(requestId);

      switch (response.status) {
        // RelayerV2GetResponseSucceeded
        case 200: {
          const bodyJson = await response.json();

          this._assertCanContinueAfterAwait(`_runGetLoop(${requestId})`);

          assertIsRelayerV2GetResponseSucceeded(bodyJson, 'body');

          // RelayerV2ResultPublicDecrypt
          // RelayerV2ResultUserDecrypt
          // RelayerV2ResultInputProof;
          return bodyJson.result;
        }
        // RelayerV2ResponseQueued
        case 202: {
          const bodyJson = await response.json();

          this._assertCanContinueAfterAwait(`_runGetLoop(${requestId})`);

          assertIsRelayerV2ResponseQueued(bodyJson, 'body');

          const retry_after_ms = Date.parse(bodyJson.result.retry_after);
          const ms = retry_after_ms - Date.now();

          // Wait if needed (minimum 1s)
          await this._setRetryAfterTimeout(ms);
          continue;
        }
        case 404: {
          throw new Error(`Get Error 404 not yet implemented`);
        }
        case 422: {
          throw new Error(`Get Error 422 not yet implemented`);
        }
        case 500: {
          throw new Error(`Get Error 500 not yet implemented`);
        }
        default: {
          // Unknown error
          throw new Error(`Unknown response.status=${response.status}`);
        }
      }
    }
    throw new Error(`Internal Error: Abort _runGetLoop`);
  }

  private async _fetchPost() {
    const init = setAuth(
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this._payload),
        ...(this._signal ? { signal: this._signal } : {}),
      } satisfies RequestInit,
      this._options?.auth,
    );

    const response = await fetch(this._url, init);

    // Debug
    this._assertCanContinueAfterAwait(`_runPostLoop()`);

    return response;
  }

  private async _fetchGet(requestId: string) {
    const init: RequestInit | undefined = this._signal
      ? { signal: this._signal }
      : undefined;

    const response = await fetch(`${this._url}/${requestId}`, init);

    // Debug
    this._assertCanContinueAfterAwait(`_runGetLoop(${requestId})`);

    return response;
  }

  // Warning: Use arrow function only!
  private _handleSignalAbort = (ev: Event) => {
    if (this._signal === undefined || this._hasSignal) {
      console.log(`Warning _release was already called?`);
    }

    const signal = ev.currentTarget as AbortSignal;

    // Debug
    this._assert(
      this instanceof RelayerV2AsyncRequest,
      `this instanceof RelayerV2AsyncRequest`,
    );
    this._assert(signal === this._signal, 'signal === this._signal');
    this._assert(!this._state.terminated, `!this._state.terminated`);
    this._assert(!this._state.canceled, '!this._state.canceled');
    this._assert(!this._state.aborted, '!this._state.aborted');

    this._state.aborted = true;

    this._terminate();
  };

  public cancel() {
    if (!this._canContinue()) {
      return;
    }

    this._state.canceled = true;

    this._terminate();
  }

  /**
   * Can be called multiple times
   */
  private _terminate() {
    this._tryClearRetryAfterTimeout();

    this._state.terminated = true;

    const s = this._signal;
    const tid = this._retryAfterTimeoutID;

    this._signal = undefined;
    this._retryAfterTimeoutID = undefined;

    if (s) {
      s.removeEventListener('abort', this._handleSignalAbort);
    }
    if (tid) {
      clearTimeout(tid);
    }
  }

  private async _setRetryAfterTimeout(delayMs: number): Promise<void> {
    if (delayMs < 1000) {
      delayMs = 1000;
    }

    if (this._retryAfterTimeoutID !== undefined) {
      return Promise.reject(new Error(`retry-after already running.`));
    }

    return new Promise<void>((resolve, reject) => {
      this._retryAfterTimeoutPromiseFuncReject = reject;

      const callback = () => {
        this._retryAfterTimeoutID = undefined;
        this._retryAfterTimeoutPromiseFuncReject = undefined;
        resolve();
      };

      this._retryAfterTimeoutID = setTimeout(callback, delayMs);
    });
  }

  private _tryClearRetryAfterTimeout() {
    if (this._retryAfterTimeoutID === undefined) {
      return;
    }

    const reject = this._retryAfterTimeoutPromiseFuncReject!;

    clearTimeout(this._retryAfterTimeoutID);

    this._retryAfterTimeoutID = undefined;
    this._retryAfterTimeoutPromiseFuncReject = undefined;

    reject(new Error('canceled !HELLO!'));
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
}
