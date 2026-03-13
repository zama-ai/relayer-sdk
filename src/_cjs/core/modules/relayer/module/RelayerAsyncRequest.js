"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayerAsyncRequest = void 0;
const _version_js_1 = require("../../../_version.js");
const auth_js_1 = require("../../../base/auth.js");
const InvalidPropertyError_js_1 = require("../../../base/errors/InvalidPropertyError.js");
const utils_js_1 = require("../../../base/errors/utils.js");
const fetch_js_1 = require("../../../base/fetch.js");
const string_js_1 = require("../../../base/string.js");
const uint_js_1 = require("../../../base/uint.js");
const RelayerAbortError_js_1 = require("../../../errors/RelayerAbortError.js");
const RelayerFetchError_js_1 = require("../../../errors/RelayerFetchError.js");
const RelayerMaxRetryError_js_1 = require("../../../errors/RelayerMaxRetryError.js");
const RelayerRequestInternalError_js_1 = require("../../../errors/RelayerRequestInternalError.js");
const RelayerResponseApiError_js_1 = require("../../../errors/RelayerResponseApiError.js");
const RelayerResponseInputProofRejectedError_js_1 = require("../../../errors/RelayerResponseInputProofRejectedError.js");
const RelayerResponseInvalidBodyError_js_1 = require("../../../errors/RelayerResponseInvalidBodyError.js");
const RelayerResponseStatusError_js_1 = require("../../../errors/RelayerResponseStatusError.js");
const RelayerStateError_js_1 = require("../../../errors/RelayerStateError.js");
const RelayerTimeoutError_js_1 = require("../../../errors/RelayerTimeoutError.js");
const FhevmHandle_js_1 = require("../../../handle/FhevmHandle.js");
const RelayerInputProofSucceeded_js_1 = require("./guards/RelayerInputProofSucceeded.js");
const RelayerPublicDecryptSucceeded_js_1 = require("./guards/RelayerPublicDecryptSucceeded.js");
const RelayerResponseFailed_js_1 = require("./guards/RelayerResponseFailed.js");
const RelayerResponseQueued_js_1 = require("./guards/RelayerResponseQueued.js");
const RelayerUserDecryptSucceeded_js_1 = require("./guards/RelayerUserDecryptSucceeded.js");
class RelayerAsyncRequest {
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
        Object.defineProperty(this, "_handleExternalSignalAbort", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (ev) => {
                const signal = ev.currentTarget;
                this._assert(this instanceof RelayerAsyncRequest, `this instanceof RelayerAsyncRequest`);
                this._assert(signal === this._externalAbortSignal, "signal === this._externalAbortSignal");
                this._assert(!this._state.terminated, `!this._state.terminated`);
                this._assert(!this._state.aborted, "!this._state.aborted");
                this._assert(!this._state.canceled, "!this._state.canceled");
                this.cancel();
            }
        });
        Object.defineProperty(this, "_handleInternalSignalAbort", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (ev) => {
                const signal = ev.currentTarget;
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
                this._terminate("abort", new RelayerAbortError_js_1.RelayerAbortError({
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
            throw new InvalidPropertyError_js_1.InvalidPropertyError({
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
    async run(params) {
        this._trace("run", `existingJobId=${params?.existingJobId}`);
        if (this._state.terminated) {
            throw new RelayerStateError_js_1.RelayerStateError({
                message: `Relayer.run() failed. Request already terminated.`,
                state: { ...this._state },
            });
        }
        if (this._state.canceled) {
            throw new RelayerStateError_js_1.RelayerStateError({
                message: `Relayer.run() failed. Request already canceled.`,
                state: { ...this._state },
            });
        }
        if (this._state.succeeded) {
            throw new RelayerStateError_js_1.RelayerStateError({
                message: `Relayer.run() failed. Request already succeeded.`,
                state: { ...this._state },
            });
        }
        if (this._state.failed) {
            throw new RelayerStateError_js_1.RelayerStateError({
                message: `Relayer.run() failed. Request already failed.`,
                state: { ...this._state },
            });
        }
        if (this._state.aborted) {
            throw new RelayerStateError_js_1.RelayerStateError({
                message: `Relayer.run() failed. Request already aborted.`,
                state: { ...this._state },
            });
        }
        if (this._state.timeout) {
            throw new RelayerStateError_js_1.RelayerStateError({
                message: `Relayer.run() failed. Request already timeout.`,
                state: { ...this._state },
            });
        }
        if (this._externalAbortSignal?.aborted === true) {
            throw new RelayerStateError_js_1.RelayerStateError({
                message: `Relayer.run() failed. External AbortSignal already aborted (reason:${this._externalAbortSignal.reason}).`,
                state: { ...this._state },
            });
        }
        if (this._internalAbortSignal?.aborted === true) {
            throw new RelayerStateError_js_1.RelayerStateError({
                message: `Relayer.run() failed. Internal AbortSignal already aborted (reason:${this._internalAbortSignal.reason}).`,
                state: { ...this._state },
            });
        }
        if (this._state.running) {
            throw new RelayerStateError_js_1.RelayerStateError({
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
            this._terminate("failed", e);
            throw e;
        }
    }
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
        this._assert(this._state.aborted, "this._state.aborted");
        this._assert(this._state.terminated, "this._state.terminated");
    }
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
    async _runPostLoop(params) {
        this._assert(this._fetchMethod === undefined, "this._fetchMethod === undefined");
        this._fetchMethod = "POST";
        this._totalSteps = 1;
        this._step = 0;
        if ((0, string_js_1.isNonEmptyString)(params?.existingJobId)) {
            this._setJobIdOnce(params.existingJobId);
            return await this._runGetLoop();
        }
        let fetchAttempts = 0;
        let i = 0;
        while (i < RelayerAsyncRequest.MAX_POST_RETRY) {
            ++i;
            this._assertCanContinueAfterAwait();
            this._elapsed =
                this._jobId !== undefined ? Date.now() - this._jobIdTimestamp : 0;
            fetchAttempts++;
            const response = await this._fetchWithRetry(() => this._fetchPost(), fetchAttempts);
            if (response === undefined) {
                continue;
            }
            fetchAttempts = 0;
            const responseStatus = response.status;
            switch (responseStatus) {
                case 202: {
                    const bodyJson = await this._getResponseJson(response);
                    try {
                        (0, RelayerResponseQueued_js_1.assertIsRelayerPostResponse202Queued)(bodyJson, "body", {});
                    }
                    catch (cause) {
                        this._throwResponseInvalidBodyError({
                            status: responseStatus,
                            cause: cause,
                            bodyJson: (0, string_js_1.safeJSONstringify)(bodyJson),
                        });
                    }
                    const retryAfterMs = this._getRetryAfterHeaderValueInMs(response);
                    this._setJobIdOnce(bodyJson.result.jobId);
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
                case 400: {
                    const bodyJson = await this._getResponseJson(response);
                    try {
                        (0, RelayerResponseFailed_js_1.assertIsRelayerResponseFailedWithError400)(bodyJson, "body", {});
                    }
                    catch (cause) {
                        this._throwResponseInvalidBodyError({
                            status: responseStatus,
                            cause: cause,
                            bodyJson: (0, string_js_1.safeJSONstringify)(bodyJson),
                        });
                    }
                    this._throwRelayerResponseApiError({
                        status: responseStatus,
                        relayerApiError: bodyJson.error,
                    });
                }
                case 401: {
                    this._throwUnauthorizedError(responseStatus);
                }
                case 429: {
                    const bodyJson = await this._getResponseJson(response);
                    try {
                        (0, RelayerResponseFailed_js_1.assertIsRelayerResponseFailedWithError429)(bodyJson, "body", {});
                    }
                    catch (cause) {
                        this._throwResponseInvalidBodyError({
                            status: responseStatus,
                            cause: cause,
                            bodyJson: (0, string_js_1.safeJSONstringify)(bodyJson),
                        });
                    }
                    const retryAfterMs = this._getRetryAfterHeaderValueInMs(response);
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
                    await this._setRetryAfterTimeout(retryAfterMs);
                    continue;
                }
                case 500: {
                    const bodyJson = await this._getResponseJson(response);
                    try {
                        (0, RelayerResponseFailed_js_1.assertIsRelayerResponseFailedWithError500)(bodyJson, "body", {});
                    }
                    catch (cause) {
                        this._throwResponseInvalidBodyError({
                            status: responseStatus,
                            cause: cause,
                            bodyJson: (0, string_js_1.safeJSONstringify)(bodyJson),
                        });
                    }
                    this._throwRelayerResponseApiError({
                        status: responseStatus,
                        relayerApiError: bodyJson.error,
                    });
                }
                case 503: {
                    const bodyJson = await this._getResponseJson(response);
                    try {
                        (0, RelayerResponseFailed_js_1.assertIsRelayerResponseFailedWithError503)(bodyJson, "body", {});
                    }
                    catch (cause) {
                        this._throwResponseInvalidBodyError({
                            status: responseStatus,
                            cause: cause,
                            bodyJson: (0, string_js_1.safeJSONstringify)(bodyJson),
                        });
                    }
                    this._throwRelayerResponseApiError({
                        status: responseStatus,
                        relayerApiError: bodyJson.error,
                    });
                }
                default: {
                    const throwUnsupportedStatus = (unsupportedStatus) => {
                        throw new RelayerResponseStatusError_js_1.RelayerResponseStatusError({
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
        this._throwMaxRetryError({ fetchMethod: "POST" });
    }
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
            fetchAttempts++;
            const response = await this._fetchWithRetry(() => this._fetchGet(), fetchAttempts);
            if (response === undefined) {
                continue;
            }
            fetchAttempts = 0;
            const responseStatus = response.status;
            switch (responseStatus) {
                case 200: {
                    const bodyJson = await this._getResponseJson(response);
                    this._step = this._totalSteps;
                    try {
                        if (this._relayerOperation === "INPUT_PROOF") {
                            (0, RelayerInputProofSucceeded_js_1.assertIsRelayerInputProofSucceeded)(bodyJson, "body", {});
                            const inputProofBodyResult = bodyJson.result;
                            if (!inputProofBodyResult.accepted) {
                                const e = new RelayerResponseInputProofRejectedError_js_1.RelayerResponseInputProofRejectedError({
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
                            const inputProofAccepted = inputProofBodyResult;
                            const fhevmHandles = inputProofAccepted.handles.map(FhevmHandle_js_1.bytes32HexToFhevmHandle);
                            const returnValue = {
                                extraData: inputProofAccepted.extraData,
                                signatures: inputProofAccepted.signatures,
                                handles: Object.freeze(fhevmHandles),
                            };
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
                        else if (this._relayerOperation === "PUBLIC_DECRYPT") {
                            (0, RelayerPublicDecryptSucceeded_js_1.assertIsRelayerPublicDecryptSucceeded)(bodyJson, "body", {});
                            const publicDecryptBodyResult = bodyJson.result;
                            const returnValue = publicDecryptBodyResult;
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
                        else if (this._relayerOperation === "USER_DECRYPT") {
                            (0, RelayerUserDecryptSucceeded_js_1.assertIsRelayerUserDecryptSucceeded)(bodyJson, "body", {});
                            const userDecryptBodyResult = bodyJson.result;
                            const returnValue = userDecryptBodyResult.result;
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
                        else if (this._relayerOperation === "DELEGATED_USER_DECRYPT") {
                            (0, RelayerUserDecryptSucceeded_js_1.assertIsRelayerUserDecryptSucceeded)(bodyJson, "body", {});
                            const userDecryptBodyResult = bodyJson.result;
                            const returnValue = userDecryptBodyResult.result;
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
                        else {
                            (0, utils_js_1.assertNever)(this._relayerOperation, `Unkown operation: ${this._relayerOperation}`);
                        }
                    }
                    catch (cause) {
                        if (cause instanceof RelayerResponseInputProofRejectedError_js_1.RelayerResponseInputProofRejectedError) {
                            throw cause;
                        }
                        this._throwResponseInvalidBodyError({
                            status: responseStatus,
                            cause: cause,
                            bodyJson: (0, string_js_1.safeJSONstringify)(bodyJson),
                        });
                    }
                }
                case 202: {
                    const bodyJson = await this._getResponseJson(response);
                    try {
                        (0, RelayerResponseQueued_js_1.assertIsRelayerGetResponse202Queued)(bodyJson, "body", {});
                    }
                    catch (cause) {
                        this._throwResponseInvalidBodyError({
                            status: responseStatus,
                            cause: cause,
                            bodyJson: (0, string_js_1.safeJSONstringify)(bodyJson),
                        });
                    }
                    const retryAfterMs = this._getRetryAfterHeaderValueInMs(response);
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
                    await this._setRetryAfterTimeout(retryAfterMs);
                    continue;
                }
                case 400: {
                    const bodyJson = await this._getResponseJson(response);
                    try {
                        (0, RelayerResponseFailed_js_1.assertIsRelayerResponseFailedWithError400)(bodyJson, "body", {});
                    }
                    catch (cause) {
                        this._throwResponseInvalidBodyError({
                            status: responseStatus,
                            cause: cause,
                            bodyJson: (0, string_js_1.safeJSONstringify)(bodyJson),
                        });
                    }
                    this._throwRelayerResponseApiError({
                        status: responseStatus,
                        relayerApiError: bodyJson.error,
                    });
                }
                case 401: {
                    this._throwUnauthorizedError(responseStatus);
                }
                case 404: {
                    const bodyJson = await this._getResponseJson(response);
                    try {
                        (0, RelayerResponseFailed_js_1.assertIsRelayerResponseFailedWithError404)(bodyJson, "body", {});
                    }
                    catch (cause) {
                        this._throwResponseInvalidBodyError({
                            status: responseStatus,
                            cause: cause,
                            bodyJson: (0, string_js_1.safeJSONstringify)(bodyJson),
                        });
                    }
                    this._throwRelayerResponseApiError({
                        status: responseStatus,
                        relayerApiError: bodyJson.error,
                    });
                }
                case 500: {
                    const bodyJson = await this._getResponseJson(response);
                    try {
                        (0, RelayerResponseFailed_js_1.assertIsRelayerResponseFailedWithError500)(bodyJson, "body", {});
                    }
                    catch (cause) {
                        this._throwResponseInvalidBodyError({
                            status: responseStatus,
                            cause: cause,
                            bodyJson: (0, string_js_1.safeJSONstringify)(bodyJson),
                        });
                    }
                    this._throwRelayerResponseApiError({
                        status: responseStatus,
                        relayerApiError: bodyJson.error,
                    });
                }
                case 503: {
                    const bodyJson = await this._getResponseJson(response);
                    try {
                        (0, RelayerResponseFailed_js_1.assertIsRelayerResponseFailedWithError503)(bodyJson, "body", {});
                    }
                    catch (cause) {
                        this._throwResponseInvalidBodyError({
                            status: responseStatus,
                            cause: cause,
                            bodyJson: (0, string_js_1.safeJSONstringify)(bodyJson),
                        });
                    }
                    this._throwRelayerResponseApiError({
                        status: responseStatus,
                        relayerApiError: bodyJson.error,
                    });
                }
                default: {
                    const throwUnsupportedStatus = (unsupportedStatus) => {
                        throw new RelayerResponseStatusError_js_1.RelayerResponseStatusError({
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
        this._throwMaxRetryError({ fetchMethod: "GET" });
    }
    async _getResponseJson(response) {
        try {
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
    _getRetryAfterHeaderValueInMs(response) {
        if (!response.headers.has("Retry-After")) {
            if (this._throwErrorIfNoRetryAfter) {
                throw new Error(`Missing 'Retry-After' header key`);
            }
            return RelayerAsyncRequest.DEFAULT_RETRY_AFTER_MS;
        }
        try {
            const n = Number.parseInt(response.headers.get("Retry-After"));
            if ((0, uint_js_1.isUint)(n)) {
                const ms = n * 1000;
                return ms < RelayerAsyncRequest.MINIMUM_RETRY_AFTER_MS
                    ? RelayerAsyncRequest.MINIMUM_RETRY_AFTER_MS
                    : ms;
            }
        }
        catch {
        }
        if (this._throwErrorIfNoRetryAfter) {
            throw new Error(`Invalid 'Retry-After' header key`);
        }
        return RelayerAsyncRequest.DEFAULT_RETRY_AFTER_MS;
    }
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
    async _fetchWithRetry(fetchFn, attempts) {
        try {
            return await fetchFn();
        }
        catch (fetchError) {
            if (fetchError.name === "AbortError") {
                throw fetchError;
            }
            if (attempts >= this._fetchRetries) {
                throw fetchError;
            }
            await this._setRetryAfterTimeout(this._fetchRetryDelayInMilliseconds, {
                skipIncrementRetryCount: true,
            });
            return undefined;
        }
    }
    async _fetchPost() {
        this._assert(this._fetchMethod === "POST", 'this._fetchMethod === "POST"');
        this._assert(this._jobId === undefined, "this._jobId === undefined");
        this._assert(!this._state.terminated, "!this._state.terminated");
        this._assert(!this._state.fetching, "!this._state.fetching");
        this._trace("_fetchPost", this._url);
        const init = (0, auth_js_1.setAuth)({
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "ZAMA-SDK-VERSION": _version_js_1.version,
                "ZAMA-SDK-NAME": _version_js_1.sdkName,
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
            this._trace("_fetchPost", (0, fetch_js_1.formatFetchErrorMetaMessages)(cause).join(". "));
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
        this._assert(!this._state.terminated, "!this._state.terminated");
        this._assertCanContinueAfterAwait();
        this._trace("_fetchPost", "return response Ok");
        return response;
    }
    async _fetchGet() {
        this._assert(this._fetchMethod === "GET", 'this._fetchMethod === "GET"');
        this._assert(this._jobId !== undefined, "this._jobId !== undefined");
        this._assert(!this._state.terminated, "!this._state.terminated");
        this._assert(!this._state.fetching, "!this._state.fetching");
        this._trace("_fetchGet", `jobId=${this.jobId}`);
        const init = {
            method: "GET",
            headers: {
                "ZAMA-SDK-VERSION": _version_js_1.version,
                "ZAMA-SDK-NAME": _version_js_1.sdkName,
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
            this._trace("_fetchGet", `jobId=${this.jobId}, ${(0, fetch_js_1.formatFetchErrorMetaMessages)(cause).join(". ")}`);
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
        this._assert(!this._state.terminated, "!this._state.terminated");
        this._assertCanContinueAfterAwait();
        this._trace("_fetchGet", `jobId=${this.jobId}, return response Ok, status=${response.status}`);
        return response;
    }
    _terminate(reason, error) {
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
    async _setRetryAfterTimeout(delayMs, options) {
        const { skipIncrementRetryCount = false } = options ?? {};
        this._assert(!this._state.terminated, "!this._state.terminated");
        this._assert(this._retryAfterTimeoutID === undefined, "this._retryAfterTimeoutID === undefined");
        this._trace("_setRetryAfterTimeout", `delayMs=${delayMs}`);
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
        this._assert(this._retryAfterTimeoutID !== undefined, "this._retryAfterTimeoutID !== undefined");
        this._assert(this._retryAfterTimeoutPromiseFuncReject !== undefined, "this._retryAfterTimeoutPromiseFuncReject !== undefined");
        return p;
    }
    _tryClearRetryAfterTimeout(error) {
        if (this._retryAfterTimeoutID === undefined) {
            this._assert(this._retryAfterTimeoutPromiseFuncReject === undefined, "this._retryAfterTimeoutPromiseFuncReject === undefined");
            return;
        }
        this._assert(this._retryAfterTimeoutPromiseFuncReject !== undefined, "this._retryAfterTimeoutPromiseFuncReject !== undefined");
        const reject = this._retryAfterTimeoutPromiseFuncReject;
        const tid = this._retryAfterTimeoutID;
        this._retryAfterTimeoutID = undefined;
        this._retryAfterTimeoutPromiseFuncReject = undefined;
        clearTimeout(tid);
        reject(error ?? new Error("_tryClearRetryAfterTimeout"));
    }
    _setGlobalRequestTimeout(delayMs) {
        this._assert(this._requestGlobalTimeoutID === undefined, "this._requestGlobalTimeoutID === undefined");
        const callback = () => {
            this._requestGlobalTimeoutID = undefined;
            this._handleGlobalRequestTimeout();
        };
        this._requestGlobalTimeoutID = setTimeout(callback, delayMs);
    }
    _handleGlobalRequestTimeout() {
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
        this._terminate("timeout", new RelayerTimeoutError_js_1.RelayerTimeoutError({
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
    _postAsyncOnProgressCallback(args) {
        const onProgressFunc = this._onProgress;
        if (onProgressFunc) {
            queueMicrotask(() => {
                onProgressFunc(args);
            });
        }
    }
    _throwUnauthorizedError(status) {
        this._throwRelayerResponseApiError({
            status,
            relayerApiError: {
                label: "unauthorized",
                message: "Unauthorized, missing or invalid Zama Fhevm API Key.",
            },
        });
    }
    _throwRelayerResponseApiError(params) {
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
        this._postAsyncOnProgressCallback(this._relayerOperation === "INPUT_PROOF"
            ? args
            : this._relayerOperation === "PUBLIC_DECRYPT"
                ? args
                : this._relayerOperation === "USER_DECRYPT"
                    ? args
                    : args);
        throw new RelayerResponseApiError_js_1.RelayerResponseApiError({
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
    _throwInternalError(message) {
        throw new RelayerRequestInternalError_js_1.RelayerRequestInternalError({
            operation: this._relayerOperation,
            url: this._url,
            message,
            state: JSON.stringify(this._state),
            jobId: this._jobId,
        });
    }
    _throwMaxRetryError(params) {
        const elapsed = this._jobIdTimestamp !== undefined
            ? Date.now() - this._jobIdTimestamp
            : 0;
        throw new RelayerMaxRetryError_js_1.RelayerMaxRetryError({
            operation: this._relayerOperation,
            url: this._url,
            state: { ...this._state },
            retryCount: this._retryCount,
            jobId: this._jobId,
            fetchMethod: params.fetchMethod,
            elapsed,
        });
    }
    _throwResponseInvalidBodyError(params) {
        throw new RelayerResponseInvalidBodyError_js_1.RelayerResponseInvalidBodyError({
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
    _throwFetchError(params) {
        throw new RelayerFetchError_js_1.RelayerFetchError({
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
    _assertCanContinueAfterAwait() {
        if (!this._canContinue()) {
            this._throwInternalError("cannot continue.");
        }
    }
    _trace(functionName, message) {
        if (this._debug) {
            console.log(`[RelayerAsyncRequest]:${functionName}: ${message}`);
        }
    }
}
exports.RelayerAsyncRequest = RelayerAsyncRequest;
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
});
Object.defineProperty(RelayerAsyncRequest, "MAX_GET_RETRY", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 60 * 24
});
Object.defineProperty(RelayerAsyncRequest, "MAX_POST_RETRY", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: RelayerAsyncRequest.MAX_GET_RETRY
});
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