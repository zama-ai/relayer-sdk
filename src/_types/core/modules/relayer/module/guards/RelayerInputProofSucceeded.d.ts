import type { RelayerInputProofSucceeded } from "../../../../types/relayer-p.js";
import type { ErrorMetadataParams } from "../../../../base/errors/ErrorBase.js";
/**
 * Asserts that `value` matches the {@link RelayerInputProofSucceeded} schema:
 * ```json
 * {
 *   "status": "succeeded",
 *   "requestId": "string",
 *   "result": {
 *     "accepted": true,
 *     "extraData": "0x...",
 *     "handles": ["0x..."],
 *     "signatures": ["0x..."]
 *   } | {
 *     "accepted": false,
 *     "extraData": "0x..."
 *   }
 * }
 * ```
 */
export declare function assertIsRelayerInputProofSucceeded(value: unknown, name: string, options: ErrorMetadataParams): asserts value is RelayerInputProofSucceeded;
//# sourceMappingURL=RelayerInputProofSucceeded.d.ts.map