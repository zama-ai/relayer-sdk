import type { ErrorMetadataParams } from "../../../../../base/errors/ErrorBase.js";
import type { RelayerApiError404 } from "../../../../../types/relayer-p.js";
/**
 * Asserts that `value` matches the {@link RelayerApiError404} schema:
 * ```json
 * {
 *   "label": "not_found",
 *   "message": "string"
 * }
 * ```
 */
export declare function assertIsRelayerApiError404(value: unknown, name: string, options: ErrorMetadataParams): asserts value is RelayerApiError404;
//# sourceMappingURL=RelayerApiError404.d.ts.map