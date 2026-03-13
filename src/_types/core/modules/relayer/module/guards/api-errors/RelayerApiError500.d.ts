import type { ErrorMetadataParams } from "../../../../../base/errors/ErrorBase.js";
import type { RelayerApiError500 } from "../../../../../types/relayer-p.js";
/**
 * Asserts that `value` matches the {@link RelayerApiError500} schema:
 * ```json
 * {
 *   "label": "internal_server_error",
 *   "message": "string"
 * }
 * ```
 */
export declare function assertIsRelayerApiError500(value: unknown, name: string, options: ErrorMetadataParams): asserts value is RelayerApiError500;
//# sourceMappingURL=RelayerApiError500.d.ts.map