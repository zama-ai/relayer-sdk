import type { RelayerAsyncRequestState, RelayerTerminateReason } from "../../../types/relayer-p.js";
import type { FetchInputProofResult, FetchPublicDecryptResult, FetchUserDecryptResult, RelayerDelegatedUserDecryptOptions, RelayerInputProofOptions, RelayerPostOperation, RelayerPublicDecryptOptions, RelayerUserDecryptOptions } from "../../../types/relayer.js";
type RelayerAsyncRequestParams = {
    relayerOperation: RelayerPostOperation;
    url: string;
    payload: Record<string, unknown>;
    timeoutInSeconds?: number | undefined;
    throwErrorIfNoRetryAfter?: boolean | undefined;
    options?: RelayerInputProofOptions | RelayerUserDecryptOptions | RelayerDelegatedUserDecryptOptions | RelayerPublicDecryptOptions | undefined;
};
export declare class RelayerAsyncRequest {
    private readonly _debug;
    private _fetchMethod;
    private _elapsed;
    private _jobId;
    private _jobIdTimestamp;
    private readonly _state;
    private readonly _relayerOperation;
    private _internalAbortController;
    private _internalAbortSignal;
    private _externalAbortSignal;
    private _terminateReason;
    private _terminateError;
    private _retryCount;
    private readonly _fetchRetries;
    private readonly _fetchRetryDelayInMilliseconds;
    private _totalSteps;
    private _step;
    private _retryAfterTimeoutID;
    private readonly _url;
    private readonly _payload;
    private readonly _fhevmAuth;
    private _retryAfterTimeoutPromiseFuncReject?;
    private readonly _onProgress?;
    private readonly _requestMaxDurationInMs;
    private _requestStartTimestamp;
    private _requestGlobalTimeoutID;
    private readonly _throwErrorIfNoRetryAfter;
    private static readonly DEFAULT_RETRY_AFTER_MS;
    private static readonly MINIMUM_RETRY_AFTER_MS;
    private static readonly DEFAULT_GLOBAL_REQUEST_TIMEOUT_MS;
    private static readonly MAX_GET_RETRY;
    private static readonly MAX_POST_RETRY;
    private static readonly FETCH_RETRY_AFTER_MS;
    private static readonly FETCH_RETRY;
    constructor(params: RelayerAsyncRequestParams);
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
    run(params?: {
        existingJobId: string;
    }): Promise<FetchInputProofResult | FetchPublicDecryptResult | FetchUserDecryptResult>;
    private _canContinue;
    cancel(): void;
    get state(): RelayerAsyncRequestState;
    get canceled(): boolean;
    get terminated(): boolean;
    get terminateReason(): RelayerTerminateReason | undefined;
    get terminateError(): unknown;
    get running(): boolean;
    get fetching(): boolean;
    get failed(): boolean;
    get aborted(): boolean;
    get timeout(): boolean;
    get succeeded(): boolean;
    get startTimeMs(): number | undefined;
    get elapsedTimeMs(): number | undefined;
    get retryCount(): number;
    private _runPostLoop;
    private _runGetLoop;
    /**
     * Parses the response body as JSON.
     * @throws {RelayerFetchError} If the body is not valid JSON (e.g., Cloudflare HTML error page).
     */
    private _getResponseJson;
    private _getRetryAfterHeaderValueInMs;
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
    private _setJobIdOnce;
    private get jobId();
    /**
     * Wraps a fetch call with retry logic for transient network failures.
     *
     * @param fetchFn - The fetch function to call (either _fetchPost or _fetchGet)
     * @param attempts - Current attempt count (1-based, caller increments before calling)
     * @returns Response on success, or undefined to signal retry
     * @throws {Error} AbortError if the fetch was aborted
     * @throws {RelayerFetchError} If max retries exhausted
     */
    private _fetchWithRetry;
    /**
     * Performs a POST request to initiate a new job
     * @throws {RelayerFetchError} If the fetch fails (network error, etc.)
     */
    private _fetchPost;
    /**
     * Performs a GET request to poll the job status.
     * @throws {RelayerFetchError} If the fetch fails (network error, etc.)
     */
    private _fetchGet;
    private readonly _handleExternalSignalAbort;
    private readonly _handleInternalSignalAbort;
    /**
     * Can be called multiple times
     */
    private _terminate;
    private _setRetryAfterTimeout;
    private _tryClearRetryAfterTimeout;
    private _setGlobalRequestTimeout;
    private _handleGlobalRequestTimeout;
    private _tryClearGlobalRequestTimeout;
    private _postAsyncOnProgressCallback;
    /**
     * Throws an unauthorized error for 401 responses.
     * @throws {RelayerResponseApiError} Always throws with 'unauthorized' label.
     */
    private _throwUnauthorizedError;
    /**
     * Throws a relayer API error with the given status and error details.
     * @throws {RelayerResponseApiError} Always throws with the provided error details.
     */
    private _throwRelayerResponseApiError;
    private _assert;
    /**
     * Throws an internal error
     * @throws {RelayerRequestInternalError}
     */
    private _throwInternalError;
    /**
     * Throws a max retry error when the request has exceeded the retry limit.
     * @throws {RelayerMaxRetryError} Always throws.
     */
    private _throwMaxRetryError;
    /**
     * Throws an error when the response body does not match the expected schema.
     * @throws {RelayerResponseInvalidBodyError} Always throws.
     */
    private _throwResponseInvalidBodyError;
    /**
     * Throws an error when a fetch operation fails (network error, JSON parse error, etc.).
     * @throws {RelayerFetchError} Always throws.
     */
    private _throwFetchError;
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
    private _assertCanContinueAfterAwait;
    private _trace;
}
export {};
//# sourceMappingURL=RelayerAsyncRequest.d.ts.map