import type { RelayerPublicDecryptSucceeded } from "../../../../types/relayer-p.js";
import type { ErrorMetadataParams } from "../../../../base/errors/ErrorBase.js";
/**
 * Asserts that `value` matches the {@link RelayerPublicDecryptSucceeded} schema:
 * ```json
 * {
 *   "status": "succeeded",
 *   "requestId": "string",
 *   "result": {
 *     "signatures": ["hexNo0x..."],
 *     "decryptedValue": "hexNo0x...",
 *     "extraData": "0x..."
 *   }
 * }
 * ```
 */
export declare function assertIsRelayerPublicDecryptSucceeded(value: unknown, name: string, options: ErrorMetadataParams): asserts value is RelayerPublicDecryptSucceeded;
//# sourceMappingURL=RelayerPublicDecryptSucceeded.d.ts.map