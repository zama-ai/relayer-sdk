import type { ErrorMetadataParams } from "../../../../base/errors/ErrorBase.js";
import type { RelayerGetResponse202Queued, RelayerPostResponse202Queued } from "../../../../types/relayer-p.js";
/**
 * Asserts that `value` matches the {@link RelayerPostResponseQueued} schema:
 * ```json
 * {
 *   "status": "queued",
 *   "requestId": "string",
 *   "result": { "jobId": "string" }
 * }
 * ```
 */
export declare function assertIsRelayerPostResponse202Queued(value: unknown, name: string, options: ErrorMetadataParams): asserts value is RelayerPostResponse202Queued;
/**
 * Asserts that `value` matches the {@link RelayerGetResponse202Queued} schema:
 * ```json
 * {
 *   "status": "queued",
 *   "requestId": "string"
 * }
 * ```
 */
export declare function assertIsRelayerGetResponse202Queued(value: unknown, name: string, options: ErrorMetadataParams): asserts value is RelayerGetResponse202Queued;
//# sourceMappingURL=RelayerResponseQueued.d.ts.map