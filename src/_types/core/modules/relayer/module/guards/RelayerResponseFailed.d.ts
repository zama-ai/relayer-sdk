import type { RelayerApiError, RelayerApiError400, RelayerApiError404, RelayerApiError429, RelayerApiError500, RelayerApiError503, RelayerResponseFailed } from "../../../../types/relayer-p.js";
import type { ErrorMetadataParams } from "../../../../base/errors/ErrorBase.js";
/**
 * Asserts that `value` matches the {@link RelayerResponseFailed} schema:
 * ```json
 * {
 *   "status": "failed",
 *   "error": { ... }
 * }
 * ```
 * Where `error` is a {@link RelayerApiError}.
 */
export declare function assertIsRelayerResponseFailed(value: unknown, name: string, options: ErrorMetadataParams): asserts value is RelayerResponseFailed;
/**
 * Asserts that `value` matches one of the {@link RelayerApiError} schemas,
 * dispatching by `label`:
 * - 400: {@link RelayerApiError400NoDetails} or {@link RelayerApiError400WithDetails}
 * - 404: {@link RelayerApiError404}
 * - 429: {@link RelayerApiError429}
 * - 500: {@link RelayerApiError500}
 * - 503: {@link RelayerApiError503}
 */
export declare function assertIsRelayerApiError(value: unknown, name: string, options: ErrorMetadataParams): asserts value is RelayerApiError;
/**
 * Asserts that `value` matches the failed response with 400 error schema:
 * ```json
 * {
 *   "status": "failed",
 *   "error": RelayerApiError400NoDetails | RelayerApiError400WithDetails
 * }
 * ```
 * @see {@link assertIsRelayerApiError400NoDetails}
 * @see {@link assertIsRelayerApiError400WithDetails}
 */
export declare function assertIsRelayerResponseFailedWithError400(value: unknown, name: string, options: ErrorMetadataParams): asserts value is {
    status: "failed";
    error: RelayerApiError400;
};
export declare function assertIsRelayerResponseFailedWithError404(value: unknown, name: string, options: ErrorMetadataParams): asserts value is {
    status: "failed";
    error: RelayerApiError404;
};
export declare function assertIsRelayerResponseFailedWithError429(value: unknown, name: string, options: ErrorMetadataParams): asserts value is {
    status: "failed";
    error: RelayerApiError429;
};
export declare function assertIsRelayerResponseFailedWithError500(value: unknown, name: string, options: ErrorMetadataParams): asserts value is {
    status: "failed";
    error: RelayerApiError500;
};
export declare function assertIsRelayerResponseFailedWithError503(value: unknown, name: string, options: ErrorMetadataParams): asserts value is {
    status: "failed";
    error: RelayerApiError503;
};
//# sourceMappingURL=RelayerResponseFailed.d.ts.map