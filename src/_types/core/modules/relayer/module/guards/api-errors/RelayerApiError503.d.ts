import type { ErrorMetadataParams } from "../../../../../base/errors/ErrorBase.js";
import type { RelayerApiError503 } from "../../../../../types/relayer-p.js";
/**
 * Asserts that `value` matches the {@link RelayerApiError503} schema:
 * ```json
 * {
 *   "label": "protocol_paused" | "gateway_not_reachable" | "readiness_check_timed_out" | "response_timed_out",
 *   "message": "string"
 * }
 * ```
 */
export declare function assertIsRelayerApiError503(value: unknown, name: string, options: ErrorMetadataParams): asserts value is RelayerApiError503;
//# sourceMappingURL=RelayerApiError503.d.ts.map