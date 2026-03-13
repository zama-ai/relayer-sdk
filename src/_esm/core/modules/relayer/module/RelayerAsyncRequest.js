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
import { sdkName, version } from "../../../_version.js";
import { setAuth } from "../../../base/auth.js";
import { InvalidPropertyError } from "../../../base/errors/InvalidPropertyError.js";
import { assertNever } from "../../../base/errors/utils.js";
import { formatFetchErrorMetaMessages } from "../../../base/fetch.js";
import { isNonEmptyString, safeJSONstringify } from "../../../base/string.js";
import { isUint } from "../../../base/uint.js";
import { RelayerAbortError } from "../../../errors/RelayerAbortError.js";
import { RelayerFetchError } from "../../../errors/RelayerFetchError.js";
import { RelayerMaxRetryError } from "../../../errors/RelayerMaxRetryError.js";
import { RelayerRequestInternalError } from "../../../errors/RelayerRequestInternalError.js";
import { RelayerResponseApiError } from "../../../errors/RelayerResponseApiError.js";
import { RelayerResponseInputProofRejectedError } from "../../../errors/RelayerResponseInputProofRejectedError.js";
import { RelayerResponseInvalidBodyError } from "../../../errors/RelayerResponseInvalidBodyError.js";
import { RelayerResponseStatusError } from "../../../errors/RelayerResponseStatusError.js";
import { RelayerStateError } from "../../../errors/RelayerStateError.js";
import { RelayerTimeoutError } from "../../../errors/RelayerTimeoutError.js";
import { bytes32HexToFhevmHandle } from "../../../handle/FhevmHandle.js";
import { assertIsRelayerInputProofSucceeded } from "./guards/RelayerInputProofSucceeded.js";
import { assertIsRelayerPublicDecryptSucceeded } from "./guards/RelayerPublicDecryptSucceeded.js";
import { assertIsRelayerResponseFailedWithError400, assertIsRelayerResponseFailedWithError404, assertIsRelayerResponseFailedWithError429, assertIsRelayerResponseFailedWithError500, assertIsRelayerResponseFailedWithError503, } from "./guards/RelayerResponseFailed.js";
import { assertIsRelayerGetResponse202Queued, assertIsRelayerPostResponse202Queued, } from "./guards/RelayerResponseQueued.js";
import { assertIsRelayerUserDecryptSucceeded } from "./guards/RelayerUserDecryptSucceeded.js";
export class RelayerAsyncRequest {
    constructor(params) {
        Object.defineProperty(this, "_debug", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_fetchMethod", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_elapsed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_jobId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_jobIdTimestamp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_relayerOperation", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_internalAbortController", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_internalAbortSignal", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_externalAbortSignal", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_terminateReason", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_terminateError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_retryCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_fetchRetries", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_fetchRetryDelayInMilliseconds", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_totalSteps", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_step", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_retryAfterTimeoutID", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_url", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_payload", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_fhevmAuth", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_retryAfterTimeoutPromiseFuncReject", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_onProgress", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_requestMaxDurationInMs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_requestStartTimestamp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_requestGlobalTimeoutID", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_throwErrorIfNoRetryAfter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        //////////////////////////////////////////////////////////////////////////////
        // AbortSignal
        //////////////////////////////////////////////////////////////////////////////
        // Warning: Use arrow function only!
        Object.defineProperty(this, "_handleExternalSignalAbort", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (ev) => {
                const signal = ev.currentTarget;
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
                this._assert(this instanceof RelayerAsyncRequest, `this instanceof RelayerAsyncRequest`);
                this._assert(signal === this._externalAbortSignal, "signal === this._externalAbortSignal");
                this._assert(!this._state.terminated, `!this._state.terminated`);
                this._assert(!this._state.aborted, "!this._state.aborted");
                this._assert(!this._state.canceled, "!this._state.canceled");
                this.cancel();
            }
        });
        // Warning: Use arrow function only!
        Object.defineProperty(this, "_handleInternalSignalAbort", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (ev) => {
                const signal = ev.currentTarget;
                // Debug state-check guards:
                this._assert(this instanceof RelayerAsyncRequest, `this instanceof RelayerAsyncRequest`);
                this._assert(signal === this._internalAbortSignal, "signal === this._internalAbortSignal");
                this._assert(!this._state.terminated, `!this._state.terminated`);
                this._assert(!this._state.aborted, "!this._state.aborted");
                this._state.aborted = true;
                if (signal.reason !== "cancel") {
                    this._assert(!this._state.canceled, "!this._state.canceled");
                }
                this._postAsyncOnProgressCallback({
                    type: "abort",
                    url: this._url,
                    step: this._step,
                    totalSteps: this._totalSteps,
                    ...(this._fetchMethod !== undefined ? { method: this._fetchMethod } : {}),
                    ...(this._jobId !== undefined ? { jobId: this._jobId } : {}),
                    operation: this._relayerOperation,
                    retryCount: this._retryCount,
                });
                this._terminate("abort", new RelayerAbortError({
                    operation: this._relayerOperation,
                    jobId: this._jobId,
                    url: this._url,
                }));
            }
        });
        if (params.relayerOperation !== "INPUT_PROOF" &&
            params.relayerOperation !== "PUBLIC_DECRYPT" &&
            params.relayerOperation !== "USER_DECRYPT" &&
            params.relayerOperation !== "DELEGATED_USER_DECRYPT") {
            throw new InvalidPropertyError({
                subject: "RelayerAsyncRequestParams",
                property: "relayerOperation",
                expectedType: "string",
                value: params.relayerOperation,
                expectedValue: "INPUT_PROOF | PUBLIC_DECRYPT | USER_DECRYPT | DELEGATED_USER_DECRYPT",
            }, {});
        }
        this._fetchRetries =
            params.options?.fetchRetries ?? RelayerAsyncRequest.FETCH_RETRY;
        this._fetchRetryDelayInMilliseconds =
            params.options?.fetchRetryDelayInMilliseconds ??
                RelayerAsyncRequest.FETCH_RETRY_AFTER_MS;
        this._step = 0;
        this._totalSteps = 1;
        this._elapsed = 0;
        this._relayerOperation = params.relayerOperation;
        this._internalAbortController = new AbortController();
        this._internalAbortSignal = this._internalAbortController.signal;
        this._internalAbortSignal.addEventListener("abort", this._handleInternalSignalAbort);
        this._externalAbortSignal = params.options?.signal;
        if (this._externalAbortSignal) {
            this._externalAbortSignal.addEventListener("abort", this._handleExternalSignalAbort);
        }
        this._url = params.url;
        this._payload = params.payload;
        this._debug = params.options?.debug === true;
        this._fhevmAuth = params.options?.auth;
        this._onProgress = params.options?.onProgress;
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
                RelayerAsyncRequest.DEFAULT_GLOBAL_REQUEST_TIMEOUT_MS;
        this._trace("constructor()", `{ fetchRetries: ${this._fetchRetries}, fetchRetryDelayInMilliseconds: ${this._fetchRetryDelayInMilliseconds} }`);
    }
    //////////////////////////////////////////////////////////////////////////////
    // Public API: run
    //////////////////////////////////////////////////////////////////////////////
    /**
     * Executes the async request and returns the result.
     * @param params - Optional parameters.
     * @param params.existingJobId - An existing job ID to resume polling instead of starting a new request.
     * @returns The result of the operation (UserDecrypt, PublicDecrypt, or InputProof).
     * @throws {RelayerStateError} If the request cannot run (already terminated, canceled, succeeded, failed, aborted, or running).
     * @throws {RelayerTimeoutError} If the request times out.
     * @throws {RelayerAbortError} If the request was aborted.
     * @throws {RelayerFetchError} If a network error occurs or JSON parsing fails.
     * @throws {RelayerMaxRetryError} If the maximum number of retries is exceeded.
     * @throws {RelayerResponseApiError} If the relayer API returns an error response.
     * @throws {RelayerResponseStatusError} If the response status is unexpected.
     * @throws {RelayerResponseInvalidBodyError} If the response body does not match the expected schema.
     * @throws {RelayerResponseInputProofRejectedError} If the input proof is rejected.
     * @throws {RelayerRequestInternalError} If an internal error occurs.
     */
    async run(params) {
        this._trace("run", `existingJobId=${params?.existingJobId}`);
        if (this._state.terminated) {
            throw new RelayerStateError({
                message: `Relayer.run() failed. Request already terminated.`,
                state: { ...this._state },
            });
        }
        if (this._state.canceled) {
            throw new RelayerStateError({
                message: `Relayer.run() failed. Request already canceled.`,
                state: { ...this._state },
            });
        }
        if (this._state.succeeded) {
            throw new RelayerStateError({
                message: `Relayer.run() failed. Request already succeeded.`,
                state: { ...this._state },
            });
        }
        if (this._state.failed) {
            throw new RelayerStateError({
                message: `Relayer.run() failed. Request already failed.`,
                state: { ...this._state },
            });
        }
        if (this._state.aborted) {
            throw new RelayerStateError({
                message: `Relayer.run() failed. Request already aborted.`,
                state: { ...this._state },
            });
        }
        if (this._state.timeout) {
            throw new RelayerStateError({
                message: `Relayer.run() failed. Request already timeout.`,
                state: { ...this._state },
            });
        }
        if (this._externalAbortSignal?.aborted === true) {
            throw new RelayerStateError({
                message: `Relayer.run() failed. External AbortSignal already aborted (reason:${this._externalAbortSignal.reason}).`,
                state: { ...this._state },
            });
        }
        if (this._internalAbortSignal?.aborted === true) {
            throw new RelayerStateError({
                message: `Relayer.run() failed. Internal AbortSignal already aborted (reason:${this._internalAbortSignal.reason}).`,
                state: { ...this._state },
            });
        }
        if (this._state.running) {
            throw new RelayerStateError({
                message: `Relayer.run() failed. Request already running.`,
                state: { ...this._state },
            });
        }
        this._state.running = true;
        this._requestStartTimestamp = Date.now();
        this._setGlobalRequestTimeout(this._requestMaxDurationInMs);
        try {
            const json = await this._runPostLoop(params);
            this._state.succeeded = true;
            this._terminate("succeeded");
            return json;
        }
        catch (e) {
            this._state.failed = true;
            if (e.name === "AbortError") {
                this._assert(this._state.aborted, "this._state.aborted");
                this._assert(this._state.terminated, "this._state.terminated");
            }
            // Ignored if already terminated. For example, if abort has been previously called.
            this._terminate("failed", e);
            throw e;
        }
    }
    //////////////////////////////////////////////////////////////////////////////
    // Public API: cancel
    //////////////////////////////////////////////////////////////////////////////
    _canContinue() {
        return !(this._state.canceled ||
            this._state.terminated ||
            this._state.succeeded ||
            this._state.aborted);
    }
    cancel() {
        if (!this._canContinue()) {
            this._trace("cancel", "!this._canContinue()");
            return;
        }
        this._state.canceled = true;
        this._internalAbortController?.abort("cancel");
        // Debug
        this._assert(this._state.aborted, "this._state.aborted");
        this._assert(this._state.terminated, "this._state.terminated");
    }
    //////////////////////////////////////////////////////////////////////////////
    // Public API: getters
    //////////////////////////////////////////////////////////////////////////////
    get state() {
        return { ...this._state };
    }
    get canceled() {
        return this._state.canceled;
    }
    get terminated() {
        return this._state.terminated;
    }
    get terminateReason() {
        return this._terminateReason;
    }
    get terminateError() {
        return this._terminateError;
    }
    get running() {
        return this._state.running;
    }
    get fetching() {
        return this._state.fetching;
    }
    get failed() {
        return this._state.failed;
    }
    get aborted() {
        return this._state.aborted;
    }
    get timeout() {
        return this._state.timeout;
    }
    get succeeded() {
        return this._state.succeeded;
    }
    get startTimeMs() {
        return this._requestStartTimestamp;
    }
    get elapsedTimeMs() {
        if (this._requestStartTimestamp === undefined) {
            return undefined;
        }
        return Date.now() - this._requestStartTimestamp;
    }
    get retryCount() {
        return this._retryCount;
    }
    //////////////////////////////////////////////////////////////////////////////
    // Post Loop
    //////////////////////////////////////////////////////////////////////////////
    // POST : 202 | 400 | 401 | 429 | 500 | 503
    async _runPostLoop(params) {
        this._assert(this._fetchMethod === undefined, "this._fetchMethod === undefined");
        this._fetchMethod = "POST";
        // Until it is implemented. Silence linter.
        this._totalSteps = 1;
        this._step = 0;
        // Continue an existing jobId
        if (isNonEmptyString(params?.existingJobId)) {
            // Debug: will throw an assert failed error if jobId has already been set
            this._setJobIdOnce(params.existingJobId);
            return await this._runGetLoop();
        }
        // No infinite loop!
        let fetchAttempts = 0;
        let i = 0;
        while (i < RelayerAsyncRequest.MAX_POST_RETRY) {
            ++i;
            this._assertCanContinueAfterAwait();
            // At this stage: `terminated` is guaranteed to be `false`.
            // However, the `fetch` call can potentially throw an `AbortError`. In this case
            // in the error catch the `terminated` flag will be `true`! But, that's ok because the
            // next part of the function will never be executed (thrown error).
            this._elapsed =
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this._jobId !== undefined ? Date.now() - this._jobIdTimestamp : 0;
            // ===================== Begin Fetch Retry ===============================
            // Increment fetch attempts counter before fetch (1-based count)
            fetchAttempts++;
            // Execute the native fetch
            const response = await this._fetchWithRetry(() => this._fetchPost(), fetchAttempts);
            // Failure: retry if no response
            if (response === undefined) {
                continue;
            }
            // Success: fetch attempts counter
            fetchAttempts = 0;
            // ======================= End Fetch Retry ===============================
            // At this stage: `terminated` is guaranteed to be `false`.
            const responseStatus = response.status;
            switch (responseStatus) {
                // RelayerResponseQueued
                case 202: {
                    // response.json() errors:
                    // 1. if body is already read (call json() 2 times)
                    //    - TypeError: Body is unusable: Body has already been read
                    // 2. if body is invalid JSON
                    //    - SyntaxError: Unexpected end of JSON input
                    //    - SyntaxError: Expected property name or '}' in JSON at position 1 (line 1 column 2) at JSON.parse (<anonymous>)
                    const bodyJson = await this._getResponseJson(response);
                    try {
                        assertIsRelayerPostResponse202Queued(bodyJson, "body", {});
                    }
                    catch (cause) {
                        this._throwResponseInvalidBodyError({
                            status: responseStatus,
                            cause: cause,
                            bodyJson: safeJSONstringify(bodyJson),
                        });
                    }
                    const retryAfterMs = this._getRetryAfterHeaderValueInMs(response);
                    // Debug: will throw an assert failed error if jobId has already been set
                    this._setJobIdOnce(bodyJson.result.jobId);
                    // Async onProgress callback
                    this._postAsyncOnProgressCallback({
                        type: "queued",
                        url: this._url,
                        method: "POST",
                        status: responseStatus,
                        requestId: bodyJson.requestId,
                        jobId: this.jobId,
                        operation: this._relayerOperation,
                        retryCount: this._retryCount,
                        retryAfterMs,
                        elapsed: this._elapsed,
                        step: this._step,
                        totalSteps: this._totalSteps,
                    });
                    await this._setRetryAfterTimeout(retryAfterMs);
                    const json = await this._runGetLoop();
                    return json;
                }
                // RelayerResponseFailed
                // RelayerApiError400
                // RelayerApiError400WithDetails
                case 400: {
                    const bodyJson = await this._getResponseJson(response);
                    try {
                        assertIsRelayerResponseFailedWithError400(bodyJson, "body", {});
                    }
                    catch (cause) {
                        this._throwResponseInvalidBodyError({
                            status: responseStatus,
                            cause: cause,
                            bodyJson: safeJSONstringify(bodyJson),
                        });
                    }
                    this._throwRelayerResponseApiError({
                        status: responseStatus,
                        relayerApiError: bodyJson.error,
                    });
                }
                // RelayerResponseFailed
                // RelayerApiError401
                // falls through
                case 401: {
                    this._throwUnauthorizedError(responseStatus);
                }
                // RelayerResponseFailed
                // RelayerApiError429
                // falls through
                case 429: {
                    // Retry
                    // Rate Limit error (Cloudflare/Kong/Relayer), reason in message
                    // Protocol Overload error
                    const bodyJson = await this._getResponseJson(response);
                    try {
                        assertIsRelayerResponseFailedWithError429(bodyJson, "body", {});
                    }
                    catch (cause) {
                        this._throwResponseInvalidBodyError({
                            status: responseStatus,
                            cause: cause,
                            bodyJson: safeJSONstringify(bodyJson),
                        });
                    }
                    const retryAfterMs = this._getRetryAfterHeaderValueInMs(response);
                    // Async onProgress callback
                    this._postAsyncOnProgressCallback({
                        type: "throttled",
                        operation: this._relayerOperation,
                        url: this._url,
                        method: "POST",
                        status: responseStatus,
                        retryAfterMs,
                        retryCount: this._retryCount,
                        elapsed: this._elapsed,
                        relayerApiError: bodyJson.error,
                        step: this._step,
                        totalSteps: this._totalSteps,
                    });
                    // Wait if needed (minimum 1s)
                    await this._setRetryAfterTimeout(retryAfterMs);
                    continue;
                }
                // RelayerResponseFailed
                // RelayerApiError500
                case 500: {
                    // Abort
                    // Relayer internal error
                    const bodyJson = await this._getResponseJson(response);
                    try {
                        assertIsRelayerResponseFailedWithError500(bodyJson, "body", {});
                    }
                    catch (cause) {
                        this._throwResponseInvalidBodyError({
                            status: responseStatus,
                            cause: cause,
                            bodyJson: safeJSONstringify(bodyJson),
                        });
                    }
                    this._throwRelayerResponseApiError({
                        status: responseStatus,
                        relayerApiError: bodyJson.error,
                    });
                }
                // RelayerResponseFailed
                // RelayerApiError503
                // falls through
                case 503: {
                    // Abort
                    // Possible Reasons: Gateway has some internal error (unknown)
                    const bodyJson = await this._getResponseJson(response);
                    //////////////////////////////////////////////////////////////////////
                    //
                    // readiness_check_timedout : only on GET for decryption points
                    // Exponential retry for GET / readiness_check_timedout
                    // 1. first attempt failed
                    // 2. an array of intervals
                    //
                    //////////////////////////////////////////////////////////////////////
                    try {
                        assertIsRelayerResponseFailedWithError503(bodyJson, "body", {});
                    }
                    catch (cause) {
                        this._throwResponseInvalidBodyError({
                            status: responseStatus,
                            cause: cause,
                            bodyJson: safeJSONstringify(bodyJson),
                        });
                    }
                    this._throwRelayerResponseApiError({
                        status: responseStatus,
                        relayerApiError: bodyJson.error,
                    });
                }
                // falls through
                default: {
                    // Use TS compiler + `never` to guarantee the switch integrity
                    const throwUnsupportedStatus = (unsupportedStatus) => {
                        throw new RelayerResponseStatusError({
                            fetchMethod: "POST",
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
        this._throwMaxRetryError({ fetchMethod: "POST" });
    }
    //////////////////////////////////////////////////////////////////////////////
    // Get Loop
    //////////////////////////////////////////////////////////////////////////////
    // GET: 200 | 202 | 401 | 404 | 500 | 503
    // GET is not rate-limited, therefore there is not 429 error
    async _runGetLoop() {
        this._assert(this._fetchMethod === "POST", "this._fetchMethod === 'POST'");
        this._assert(this._jobId !== undefined, "this._jobId !== undefined");
        this._assert(this._jobIdTimestamp !== undefined, "this._jobIdTimestamp !== undefined");
        this._fetchMethod = "GET";
        let fetchAttempts = 0;
        let i = 0;
        while (i < RelayerAsyncRequest.MAX_GET_RETRY) {
            ++i;
            this._assertCanContinueAfterAwait();
            this._elapsed = Date.now() - this._jobIdTimestamp;
            // ===================== Begin Fetch Retry ===============================
            // Increment fetch attempts counter before fetch (1-based count)
            fetchAttempts++;
            // Execute the native fetch
            const response = await this._fetchWithRetry(() => this._fetchGet(), fetchAttempts);
            // Failure: retry if no response
            if (response === undefined) {
                continue;
            }
            // Success: fetch attempts counter
            fetchAttempts = 0;
            // ======================= End Fetch Retry ===============================
            // At this stage: `terminated` is guaranteed to be `false`.
            const responseStatus = response.status;
            switch (responseStatus) {
                // RelayerGetResponseSucceeded
                case 200: {
                    const bodyJson = await this._getResponseJson(response);
                    // Done
                    this._step = this._totalSteps;
                    try {
                        //
                        // INPUT_PROOF
                        //
                        if (this._relayerOperation === "INPUT_PROOF") {
                            assertIsRelayerInputProofSucceeded(bodyJson, "body", {});
                            const inputProofBodyResult = bodyJson.result;
                            // InputProof rejected
                            if (!inputProofBodyResult.accepted) {
                                const e = new RelayerResponseInputProofRejectedError({
                                    url: this._url,
                                    fetchMethod: "GET",
                                    jobId: this.jobId,
                                    operation: this._relayerOperation,
                                    retryCount: this._retryCount,
                                    status: responseStatus,
                                    state: { ...this._state },
                                    elapsed: this._elapsed,
                                });
                                throw e;
                            }
                            // InputProof accepted
                            const inputProofAccepted = inputProofBodyResult;
                            const fhevmHandles = inputProofAccepted.handles.map(bytes32HexToFhevmHandle);
                            const returnValue = {
                                extraData: inputProofAccepted.extraData,
                                signatures: inputProofAccepted.signatures,
                                handles: Object.freeze(fhevmHandles),
                            };
                            // Async onProgress callback
                            this._postAsyncOnProgressCallback({
                                type: "succeeded",
                                url: this._url,
                                method: "GET",
                                status: responseStatus,
                                jobId: this.jobId,
                                requestId: bodyJson.requestId,
                                operation: this._relayerOperation,
                                retryCount: this._retryCount,
                                elapsed: this._elapsed,
                                result: returnValue,
                                step: this._step,
                                totalSteps: this._totalSteps,
                            });
                            return returnValue;
                        }
                        //
                        // PUBLIC_DECRYPT
                        //
                        else if (this._relayerOperation === "PUBLIC_DECRYPT") {
                            assertIsRelayerPublicDecryptSucceeded(bodyJson, "body", {});
                            const publicDecryptBodyResult = bodyJson.result;
                            // The final return value is exactly the body json result field
                            const returnValue = publicDecryptBodyResult;
                            // Async onProgress callback
                            this._postAsyncOnProgressCallback({
                                type: "succeeded",
                                url: this._url,
                                method: "GET",
                                status: responseStatus,
                                jobId: this.jobId,
                                requestId: bodyJson.requestId,
                                operation: this._relayerOperation,
                                retryCount: this._retryCount,
                                elapsed: this._elapsed,
                                result: returnValue,
                                step: this._step,
                                totalSteps: this._totalSteps,
                            });
                            return returnValue;
                        }
                        //
                        // USER_DECRYPT
                        //
                        else if (this._relayerOperation === "USER_DECRYPT") {
                            assertIsRelayerUserDecryptSucceeded(bodyJson, "body", {});
                            const userDecryptBodyResult = bodyJson.result;
                            // The final return value is exactly the body json result.result field (x2 result!)
                            const returnValue = userDecryptBodyResult.result;
                            // Async onProgress callback
                            this._postAsyncOnProgressCallback({
                                type: "succeeded",
                                url: this._url,
                                method: "GET",
                                status: responseStatus,
                                jobId: this.jobId,
                                requestId: bodyJson.requestId,
                                operation: this._relayerOperation,
                                retryCount: this._retryCount,
                                elapsed: this._elapsed,
                                result: returnValue,
                                step: this._step,
                                totalSteps: this._totalSteps,
                            });
                            return returnValue;
                        }
                        //
                        // DELEGATED_USER_DECRYPT
                        //
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                        else if (this._relayerOperation === "DELEGATED_USER_DECRYPT") {
                            // DELEGATED_USER_DECRYPT and USER_DECRYPT use the same body json
                            assertIsRelayerUserDecryptSucceeded(bodyJson, "body", {});
                            const userDecryptBodyResult = bodyJson.result;
                            // The final return value is exactly the body json result.result field (x2 result!)
                            const returnValue = userDecryptBodyResult.result;
                            // Async onProgress callback
                            this._postAsyncOnProgressCallback({
                                type: "succeeded",
                                url: this._url,
                                method: "GET",
                                status: responseStatus,
                                jobId: this.jobId,
                                requestId: bodyJson.requestId,
                                operation: this._relayerOperation,
                                retryCount: this._retryCount,
                                elapsed: this._elapsed,
                                result: returnValue,
                                step: this._step,
                                totalSteps: this._totalSteps,
                            });
                            return returnValue;
                        }
                        //
                        // Unkown operation, assert failed
                        //
                        else {
                            assertNever(this._relayerOperation, `Unkown operation: ${this._relayerOperation}`);
                        }
                    }
                    catch (cause) {
                        // Special case for InputProof rejected
                        if (cause instanceof RelayerResponseInputProofRejectedError) {
                            throw cause;
                        }
                        this._throwResponseInvalidBodyError({
                            status: responseStatus,
                            cause: cause,
                            bodyJson: safeJSONstringify(bodyJson),
                        });
                    }
                    // unreachable code here
                    // break or return not accepted by TSC
                    // use 'falls through' comment to help eslint
                }
                // RelayerResponseQueued
                // falls through
                case 202: {
                    const bodyJson = await this._getResponseJson(response);
                    try {
                        assertIsRelayerGetResponse202Queued(bodyJson, "body", {});
                    }
                    catch (cause) {
                        this._throwResponseInvalidBodyError({
                            status: responseStatus,
                            cause: cause,
                            bodyJson: safeJSONstringify(bodyJson),
                        });
                    }
                    const retryAfterMs = this._getRetryAfterHeaderValueInMs(response);
                    // Async onProgress callback
                    this._postAsyncOnProgressCallback({
                        type: "queued",
                        url: this._url,
                        method: "GET",
                        status: responseStatus,
                        requestId: bodyJson.requestId,
                        operation: this._relayerOperation,
                        jobId: this.jobId,
                        retryAfterMs,
                        retryCount: this._retryCount,
                        elapsed: this._elapsed,
                        step: this._step,
                        totalSteps: this._totalSteps,
                    });
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
                        assertIsRelayerResponseFailedWithError400(bodyJson, "body", {});
                    }
                    catch (cause) {
                        this._throwResponseInvalidBodyError({
                            status: responseStatus,
                            cause: cause,
                            bodyJson: safeJSONstringify(bodyJson),
                        });
                    }
                    this._throwRelayerResponseApiError({
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
                        assertIsRelayerResponseFailedWithError404(bodyJson, "body", {});
                    }
                    catch (cause) {
                        this._throwResponseInvalidBodyError({
                            status: responseStatus,
                            cause: cause,
                            bodyJson: safeJSONstringify(bodyJson),
                        });
                    }
                    this._throwRelayerResponseApiError({
                        status: responseStatus,
                        relayerApiError: bodyJson.error,
                    });
                }
                // RelayerResponseFailed
                // RelayerApiError500
                // falls through
                case 500: {
                    // Abort
                    // Relayer internal error
                    const bodyJson = await this._getResponseJson(response);
                    try {
                        assertIsRelayerResponseFailedWithError500(bodyJson, "body", {});
                    }
                    catch (cause) {
                        this._throwResponseInvalidBodyError({
                            status: responseStatus,
                            cause: cause,
                            bodyJson: safeJSONstringify(bodyJson),
                        });
                    }
                    this._throwRelayerResponseApiError({
                        status: responseStatus,
                        relayerApiError: bodyJson.error,
                    });
                }
                // RelayerResponseFailed
                // RelayerApiError503
                // falls through
                case 503: {
                    // Abort
                    // Possible Reasons: Gateway has some internal error (unknown)
                    const bodyJson = await this._getResponseJson(response);
                    try {
                        assertIsRelayerResponseFailedWithError503(bodyJson, "body", {});
                    }
                    catch (cause) {
                        this._throwResponseInvalidBodyError({
                            status: responseStatus,
                            cause: cause,
                            bodyJson: safeJSONstringify(bodyJson),
                        });
                    }
                    this._throwRelayerResponseApiError({
                        status: responseStatus,
                        relayerApiError: bodyJson.error,
                    });
                }
                // falls through
                default: {
                    // Use TS compiler + `never` to guarantee the switch integrity
                    const throwUnsupportedStatus = (unsupportedStatus) => {
                        throw new RelayerResponseStatusError({
                            fetchMethod: "GET",
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
        this._throwMaxRetryError({ fetchMethod: "GET" });
    }
    //////////////////////////////////////////////////////////////////////////////
    /**
     * Parses the response body as JSON.
     * @throws {RelayerFetchError} If the body is not valid JSON (e.g., Cloudflare HTML error page).
     */
    async _getResponseJson(response) {
        try {
            // This situation usually happens when Cloudflare overrides the relayer's reply body.
            // and put a HTML page instead
            const bodyJson = (await response.json());
            this._assertCanContinueAfterAwait();
            return bodyJson;
        }
        catch (e) {
            this._throwFetchError({
                message: "JSON parsing failed.",
                cause: e,
            });
        }
    }
    //////////////////////////////////////////////////////////////////////////////
    _getRetryAfterHeaderValueInMs(response) {
        if (!response.headers.has("Retry-After")) {
            if (this._throwErrorIfNoRetryAfter) {
                throw new Error(`Missing 'Retry-After' header key`);
            }
            return RelayerAsyncRequest.DEFAULT_RETRY_AFTER_MS;
        }
        try {
            const n = Number.parseInt(
            // can be null
            response.headers.get("Retry-After"));
            if (isUint(n)) {
                const ms = n * 1000;
                return ms < RelayerAsyncRequest.MINIMUM_RETRY_AFTER_MS
                    ? RelayerAsyncRequest.MINIMUM_RETRY_AFTER_MS
                    : ms;
            }
        }
        catch {
            //
        }
        if (this._throwErrorIfNoRetryAfter) {
            throw new Error(`Invalid 'Retry-After' header key`);
        }
        return RelayerAsyncRequest.DEFAULT_RETRY_AFTER_MS;
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
     * @throws {RelayerRequestInternalError} Thrown if jobId is undefined or if the jobId has already been set.
     */
    _setJobIdOnce(jobId) {
        this._assert(jobId !== undefined, "jobId !== undefined");
        this._assert(this._jobId === undefined, "this._jobId === undefined");
        this._jobId = jobId;
        this._jobIdTimestamp = Date.now();
    }
    get jobId() {
        this._assert(this._jobId !== undefined, "this._jobId !== undefined");
        return this._jobId;
    }
    //////////////////////////////////////////////////////////////////////////////
    // Fetch functions
    //////////////////////////////////////////////////////////////////////////////
    /**
     * Wraps a fetch call with retry logic for transient network failures.
     *
     * @param fetchFn - The fetch function to call (either _fetchPost or _fetchGet)
     * @param attempts - Current attempt count (1-based, caller increments before calling)
     * @returns Response on success, or undefined to signal retry
     * @throws {Error} AbortError if the fetch was aborted
     * @throws {RelayerFetchError} If max retries exhausted
     */
    async _fetchWithRetry(fetchFn, attempts) {
        try {
            return await fetchFn();
        }
        catch (fetchError) {
            // AbortError indicates user/external cancellation - propagate immediately
            if (fetchError.name === "AbortError") {
                throw fetchError;
            }
            // At this point: fetchError is guaranteed to be RelayerFetchError
            // Max retries exhausted - propagate the network error
            if (attempts >= this._fetchRetries) {
                throw fetchError;
            }
            // Wait before retry using state-machine-aware timeout
            // This allows cancellation to interrupt the delay
            // Skip incrementing _retryCount since fetch retries are separate from polling retries
            await this._setRetryAfterTimeout(this._fetchRetryDelayInMilliseconds, {
                skipIncrementRetryCount: true,
            });
            return undefined;
        }
    }
    /**
     * Performs a POST request to initiate a new job
     * @throws {RelayerFetchError} If the fetch fails (network error, etc.)
     */
    async _fetchPost() {
        // Debug state-check guards:
        // - the fetchMethod is guaranteed to be 'POST'.
        // - the jobId is guaranteed to be undefined.
        // - `terminated` is guaranteed to be `false`
        // - `fetching` is guaranteed to be `false`
        this._assert(this._fetchMethod === "POST", 'this._fetchMethod === "POST"');
        this._assert(this._jobId === undefined, "this._jobId === undefined");
        this._assert(!this._state.terminated, "!this._state.terminated");
        this._assert(!this._state.fetching, "!this._state.fetching");
        this._trace("_fetchPost", this._url);
        // API key is required!
        const init = setAuth({
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "ZAMA-SDK-VERSION": version,
                "ZAMA-SDK-NAME": sdkName,
            },
            body: JSON.stringify(this._payload),
            ...(this._internalAbortSignal
                ? { signal: this._internalAbortSignal }
                : {}),
        }, this._fhevmAuth);
        this._state.fetching = true;
        let response;
        try {
            response = await fetch(this._url, init);
        }
        catch (cause) {
            this._state.fetching = false;
            // Warning: `terminated` can be `true` here!
            // (ex: if `controller.abort()` has been called from the outside while still executing `fetch`)
            this._trace("_fetchPost", formatFetchErrorMetaMessages(cause).join(". "));
            // Keep the standard 'AbortError'
            if (cause.name === "AbortError") {
                throw cause;
            }
            else {
                this._throwFetchError({
                    message: "Fetch POST failed.",
                    cause,
                });
            }
        }
        this._state.fetching = false;
        // Debug state-check guards:
        // - the jobId is guaranteed to be undefined.
        // - `terminated` is guaranteed to be `false`
        this._assert(!this._state.terminated, "!this._state.terminated");
        // Debug
        this._assertCanContinueAfterAwait();
        this._trace("_fetchPost", "return response Ok");
        return response;
    }
    //////////////////////////////////////////////////////////////////////////////
    /**
     * Performs a GET request to poll the job status.
     * @throws {RelayerFetchError} If the fetch fails (network error, etc.)
     */
    async _fetchGet() {
        // Debug state-check guards:
        // - the fetchMethod is guaranteed to be 'GET'.
        // - the jobId is guaranteed to be set.
        // - `terminated` is guaranteed to be `false`
        // - `fetching` is guaranteed to be `false`
        this._assert(this._fetchMethod === "GET", 'this._fetchMethod === "GET"');
        this._assert(this._jobId !== undefined, "this._jobId !== undefined");
        this._assert(!this._state.terminated, "!this._state.terminated");
        this._assert(!this._state.fetching, "!this._state.fetching");
        this._trace("_fetchGet", `jobId=${this.jobId}`);
        // Do not include API key here!
        // API key is only required on POST (by design).
        // This is necessary for future caching on gateway.
        // It will be implemented in future releases on (relayer).
        // See relayer team.
        const init = {
            method: "GET",
            headers: {
                "ZAMA-SDK-VERSION": version,
                "ZAMA-SDK-NAME": sdkName,
            },
            ...(this._internalAbortSignal
                ? { signal: this._internalAbortSignal }
                : {}),
        };
        this._state.fetching = true;
        let response;
        try {
            response = await fetch(`${this._url}/${this.jobId}`, init);
        }
        catch (cause) {
            this._state.fetching = false;
            // Warning: `terminated` can be `true` here!
            // (ex: if `controller.abort()` has been called from the outside while still executing `fetch`)
            this._trace("_fetchGet", `jobId=${this.jobId}, ${formatFetchErrorMetaMessages(cause).join(". ")}`);
            // Keep the standard 'AbortError'
            if (cause.name === "AbortError") {
                throw cause;
            }
            else {
                this._throwFetchError({
                    message: "Fetch GET failed.",
                    cause,
                });
            }
        }
        this._state.fetching = false;
        // Debug state-check guards:
        // - the jobId is guaranteed to be set.
        // - `terminated` is guaranteed to be `false`
        this._assert(!this._state.terminated, "!this._state.terminated");
        // Debug
        this._assertCanContinueAfterAwait();
        this._trace("_fetchGet", `jobId=${this.jobId}, return response Ok, status=${response.status}`);
        return response;
    }
    //////////////////////////////////////////////////////////////////////////////
    // Terminate
    //////////////////////////////////////////////////////////////////////////////
    /**
     * Can be called multiple times
     */
    _terminate(reason, error) {
        // Warning: this._state.fetching can be true
        // ex: call cancel while fetch is running
        if (this._state.terminated) {
            this._trace(`_terminate`, `reason=${reason}. Already terminated with reason='${this._terminateReason}'. IGNORE`);
            this._assert(this._terminateReason !== undefined, "this._terminateReason !== undefined");
            this._assert(this._internalAbortSignal === undefined, "this._signal === undefined");
            this._assert(this._requestGlobalTimeoutID === undefined, "this._requestGlobalTimeoutID === undefined");
            this._assert(this._retryAfterTimeoutID === undefined, "this._retryAfterTimeoutID === undefined");
            this._assert(this._retryAfterTimeoutPromiseFuncReject === undefined, "this._retryAfterTimeoutPromiseFuncReject === undefined");
            return;
        }
        this._trace("_terminate", `reason=${reason}`);
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
            es.removeEventListener("abort", this._handleExternalSignalAbort);
        }
        if (is) {
            is.removeEventListener("abort", this._handleInternalSignalAbort);
        }
        this._trace("_terminate", `reason=${reason} completed.`);
    }
    //////////////////////////////////////////////////////////////////////////////
    // Retry-After timeout
    //////////////////////////////////////////////////////////////////////////////
    async _setRetryAfterTimeout(delayMs, options) {
        const { skipIncrementRetryCount = false } = options ?? {};
        // Debug
        this._assert(!this._state.terminated, "!this._state.terminated");
        this._assert(this._retryAfterTimeoutID === undefined, "this._retryAfterTimeoutID === undefined");
        this._trace("_setRetryAfterTimeout", `delayMs=${delayMs}`);
        // Keep the test in case we must remove the assert
        if (this._retryAfterTimeoutID !== undefined) {
            return Promise.reject(new Error(`retry-after already running.`));
        }
        const p = new Promise((resolve, reject) => {
            this._retryAfterTimeoutPromiseFuncReject = reject;
            const callback = () => {
                this._retryAfterTimeoutID = undefined;
                this._retryAfterTimeoutPromiseFuncReject = undefined;
                resolve();
            };
            if (!skipIncrementRetryCount) {
                this._retryCount++;
            }
            this._retryAfterTimeoutID = setTimeout(callback, delayMs);
        });
        // Keep the assertion (defensive)
        this._assert(this._retryAfterTimeoutID !== undefined, "this._retryAfterTimeoutID !== undefined");
        this._assert(this._retryAfterTimeoutPromiseFuncReject !== undefined, "this._retryAfterTimeoutPromiseFuncReject !== undefined");
        return p;
    }
    //////////////////////////////////////////////////////////////////////////////
    _tryClearRetryAfterTimeout(error) {
        if (this._retryAfterTimeoutID === undefined) {
            // Debug
            this._assert(this._retryAfterTimeoutPromiseFuncReject === undefined, "this._retryAfterTimeoutPromiseFuncReject === undefined");
            return;
        }
        this._assert(this._retryAfterTimeoutPromiseFuncReject !== undefined, "this._retryAfterTimeoutPromiseFuncReject !== undefined");
        const reject = this._retryAfterTimeoutPromiseFuncReject;
        const tid = this._retryAfterTimeoutID;
        this._retryAfterTimeoutID = undefined;
        this._retryAfterTimeoutPromiseFuncReject = undefined;
        clearTimeout(tid);
        // Calling reject will
        reject(error ?? new Error("_tryClearRetryAfterTimeout"));
    }
    //////////////////////////////////////////////////////////////////////////////
    // Global Request Timeout
    //////////////////////////////////////////////////////////////////////////////
    _setGlobalRequestTimeout(delayMs) {
        // Debug
        this._assert(this._requestGlobalTimeoutID === undefined, "this._requestGlobalTimeoutID === undefined");
        const callback = () => {
            this._requestGlobalTimeoutID = undefined;
            this._handleGlobalRequestTimeout();
        };
        this._requestGlobalTimeoutID = setTimeout(callback, delayMs);
    }
    _handleGlobalRequestTimeout() {
        // Debug state-check guards:
        this._assert(this instanceof RelayerAsyncRequest, `this instanceof RelayerAsyncRequest`);
        this._assert(!this._state.terminated, `!this._state.terminated`);
        this._assert(!this._state.timeout, "!this._state.timeout");
        this._state.timeout = true;
        this._postAsyncOnProgressCallback({
            type: "timeout",
            url: this._url,
            ...(this._fetchMethod !== undefined ? { method: this._fetchMethod } : {}),
            ...(this._jobId !== undefined ? { jobId: this._jobId } : {}),
            operation: this._relayerOperation,
            retryCount: this._retryCount,
            step: this._step,
            totalSteps: this._totalSteps,
        });
        this._terminate("timeout", new RelayerTimeoutError({
            operation: this._relayerOperation,
            jobId: this._jobId,
            url: this._url,
            timeoutMs: this._requestMaxDurationInMs,
        }));
    }
    _tryClearGlobalRequestTimeout() {
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
    _postAsyncOnProgressCallback(args) {
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
    /**
     * Throws an unauthorized error for 401 responses.
     * @throws {RelayerResponseApiError} Always throws with 'unauthorized' label.
     */
    _throwUnauthorizedError(status) {
        this._throwRelayerResponseApiError({
            status,
            relayerApiError: {
                label: "unauthorized",
                message: "Unauthorized, missing or invalid Zama Fhevm API Key.",
            },
        });
    }
    /**
     * Throws a relayer API error with the given status and error details.
     * @throws {RelayerResponseApiError} Always throws with the provided error details.
     */
    _throwRelayerResponseApiError(params) {
        // Clone
        const clonedRelayerApiError = JSON.parse(JSON.stringify(params.relayerApiError));
        const args = {
            type: "failed",
            url: this._url,
            method: this._fetchMethod,
            status: params.status,
            ...(this._jobId !== undefined ? { jobId: this._jobId } : {}),
            operation: this._relayerOperation,
            retryCount: this._retryCount,
            elapsed: this._elapsed,
            relayerApiError: clonedRelayerApiError,
            step: this._step,
            totalSteps: this._totalSteps,
        };
        // Async onProgress callback
        this._postAsyncOnProgressCallback(this._relayerOperation === "INPUT_PROOF"
            ? args
            : this._relayerOperation === "PUBLIC_DECRYPT"
                ? args
                : this._relayerOperation === "USER_DECRYPT"
                    ? args
                    : args);
        throw new RelayerResponseApiError({
            url: this._url,
            fetchMethod: this._fetchMethod,
            status: params.status,
            jobId: this._jobId,
            operation: this._relayerOperation,
            retryCount: this._retryCount,
            relayerApiError: params.relayerApiError,
            elapsed: this._elapsed,
            state: { ...this._state },
        });
    }
    _assert(condition, message) {
        if (!condition) {
            this._throwInternalError(`Assertion failed: ${message}`);
        }
    }
    /**
     * Throws an internal error
     * @throws {RelayerRequestInternalError}
     */
    _throwInternalError(message) {
        throw new RelayerRequestInternalError({
            operation: this._relayerOperation,
            url: this._url,
            message,
            state: JSON.stringify(this._state),
            jobId: this._jobId, // internal value
        });
    }
    /**
     * Throws a max retry error when the request has exceeded the retry limit.
     * @throws {RelayerMaxRetryError} Always throws.
     */
    _throwMaxRetryError(params) {
        const elapsed = this._jobIdTimestamp !== undefined
            ? Date.now() - this._jobIdTimestamp
            : 0;
        throw new RelayerMaxRetryError({
            operation: this._relayerOperation,
            url: this._url,
            state: { ...this._state },
            retryCount: this._retryCount,
            jobId: this._jobId, // internal value
            fetchMethod: params.fetchMethod,
            elapsed,
        });
    }
    /**
     * Throws an error when the response body does not match the expected schema.
     * @throws {RelayerResponseInvalidBodyError} Always throws.
     */
    _throwResponseInvalidBodyError(params) {
        throw new RelayerResponseInvalidBodyError({
            ...params,
            fetchMethod: this._fetchMethod,
            url: this._url,
            jobId: this._jobId,
            operation: this._relayerOperation,
            state: { ...this._state },
            retryCount: this._retryCount,
            elapsed: this._elapsed,
        });
    }
    /**
     * Throws an error when a fetch operation fails (network error, JSON parse error, etc.).
     * @throws {RelayerFetchError} Always throws.
     */
    _throwFetchError(params) {
        throw new RelayerFetchError({
            ...params,
            elapsed: this._elapsed,
            url: this._url,
            jobId: this._jobId,
            operation: this._relayerOperation,
            state: { ...this._state },
            retryCount: this._retryCount,
            fetchMethod: this._fetchMethod,
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
     * @throws {RelayerRequestInternalError} Thrown if the state check fails (i.e., this._canContinue() is false).
     * The error includes relevant state information (like current state and jobId)
     * to aid in debugging the exact point of the integrity failure.
     */
    _assertCanContinueAfterAwait() {
        if (!this._canContinue()) {
            this._throwInternalError("cannot continue.");
        }
    }
    //////////////////////////////////////////////////////////////////////////////
    // Trace
    //////////////////////////////////////////////////////////////////////////////
    _trace(functionName, message) {
        if (this._debug) {
            console.log(`[RelayerAsyncRequest]:${functionName}: ${message}`);
        }
    }
}
// Warning: the following condition should always stand!
// DEFAULT_RETRY_AFTER_MS >= MINIMUM_RETRY_AFTER_MS
Object.defineProperty(RelayerAsyncRequest, "DEFAULT_RETRY_AFTER_MS", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 2500
});
Object.defineProperty(RelayerAsyncRequest, "MINIMUM_RETRY_AFTER_MS", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 1000
});
Object.defineProperty(RelayerAsyncRequest, "DEFAULT_GLOBAL_REQUEST_TIMEOUT_MS", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 60 * 60 * 1000
}); // 1 hour
Object.defineProperty(RelayerAsyncRequest, "MAX_GET_RETRY", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 60 * 24
}); // number of default retries in 1 hour (24 retries/min)
Object.defineProperty(RelayerAsyncRequest, "MAX_POST_RETRY", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: RelayerAsyncRequest.MAX_GET_RETRY
});
// Can be lower than MINIMUM_RETRY_AFTER_MS
Object.defineProperty(RelayerAsyncRequest, "FETCH_RETRY_AFTER_MS", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 1000
});
Object.defineProperty(RelayerAsyncRequest, "FETCH_RETRY", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 3
});
//# sourceMappingURL=RelayerAsyncRequest.js.map