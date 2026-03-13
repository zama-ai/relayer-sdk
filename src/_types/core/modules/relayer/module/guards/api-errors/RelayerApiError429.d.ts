import type { ErrorMetadataParams } from "../../../../../base/errors/ErrorBase.js";
import type { RelayerApiError429 } from "../../../../../types/relayer-p.js";
/**
 * Asserts that `error` matches the {@link RelayerApiError429} schema:
 * ```json
 * {
 *   "label": "rate_limited" | "protocol_overload",
 *   "message": "string"
 * }
 * ```
 */
export declare function assertIsRelayerApiError429(error: unknown, name: string, options: ErrorMetadataParams): asserts error is RelayerApiError429;
//# sourceMappingURL=RelayerApiError429.d.ts.map