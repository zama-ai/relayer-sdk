import type { ErrorMetadataParams } from "../../../../base/errors/ErrorBase.js";
import type { RelayerUserDecryptSucceeded } from "../../../../types/relayer-p.js";
/**
 * Asserts that `value` matches the {@link RelayerUserDecryptSucceeded} schema:
 * ```json
 * {
 *   "status": "succeeded",
 *   "requestId": "string",
 *   "result": {
 *     "result": [{
 *       "payload": "hexNo0x...",
 *       "signature": "hexNo0x...",
 *       "extraData": "hex_or_hexNo0x_?..."
 *     }]
 *   }
 * }
 * ```
 */
export declare function assertIsRelayerUserDecryptSucceeded(value: unknown, name: string, options: ErrorMetadataParams): asserts value is RelayerUserDecryptSucceeded;
//# sourceMappingURL=RelayerUserDecryptSucceeded.d.ts.map