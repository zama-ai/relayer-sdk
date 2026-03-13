import type { ErrorMetadataParams } from "../../../../../base/errors/ErrorBase.js";
import type { RelayerApiError400WithDetails } from "../../../../../types/relayer-p.js";
/** @see {@link assertIsRelayerApiError400WithDetails} */
export declare function isRelayerApiError400WithDetails(error: unknown): error is RelayerApiError400WithDetails;
/**
 * Asserts that a value matches the {@link RelayerApiError400WithDetails} schema:
 * ```json
 * {
 *   "label": "missing_fields" | "validation_failed",
 *   "message": "string",
 *   "details": [
 *     { "field": "string", "issue": "string" }
 *   ]
 * }
 * ```
 */
export declare function assertIsRelayerApiError400WithDetails(value: unknown, name: string, options: ErrorMetadataParams): asserts value is RelayerApiError400WithDetails;
//# sourceMappingURL=RelayerApiError400WithDetails.d.ts.map