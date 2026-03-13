import type { ErrorMetadataParams } from "../../../../../base/errors/ErrorBase.js";
import type { RelayerApiError400NoDetails } from "../../../../../types/relayer-p.js";
/** @see {@link assertIsRelayerApiError400NoDetails} */
export declare function isRelayerApiError400NoDetails(error: unknown): error is RelayerApiError400NoDetails;
/**
 * Asserts that a value matches the {@link RelayerApiError400NoDetails} schema:
 * ```json
 * {
 *   "label": "malformed_json" | "request_error" | "not_ready_for_decryption",
 *   "message": "string"
 * }
 * ```
 */
export declare function assertIsRelayerApiError400NoDetails(value: unknown, name: string, options: ErrorMetadataParams): asserts value is RelayerApiError400NoDetails;
//# sourceMappingURL=RelayerApiError400NoDetails.d.ts.map