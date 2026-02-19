import type { ErrorMetadataParams } from '@base/errors/ErrorBase';
import type {
  RelayerGetResponse202Queued,
  RelayerPostResponse202Queued,
} from '../types/private-api';
import { assertRecordStringProperty } from '@base/string';
import { assertRecordNonNullableProperty } from '@base/record';

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
export function assertIsRelayerPostResponse202Queued(
  value: unknown,
  name: string,
  options: ErrorMetadataParams,
): asserts value is RelayerPostResponse202Queued {
  type T = RelayerPostResponse202Queued;
  assertRecordStringProperty(value, 'status' satisfies keyof T, name, {
    expectedValue: 'queued' satisfies T['status'],
    ...options,
  });
  assertRecordStringProperty(
    value,
    'requestId' satisfies keyof T,
    name,
    options,
  );
  assertRecordNonNullableProperty(
    value,
    'result' satisfies keyof T,
    name,
    options,
  );
  assertRecordStringProperty(value.result, 'jobId', `${name}.result`, options);
}

/**
 * Asserts that `value` matches the {@link RelayerGetResponse202Queued} schema:
 * ```json
 * {
 *   "status": "queued",
 *   "requestId": "string"
 * }
 * ```
 */
export function assertIsRelayerGetResponse202Queued(
  value: unknown,
  name: string,
  options: ErrorMetadataParams,
): asserts value is RelayerGetResponse202Queued {
  type T = RelayerGetResponse202Queued;
  assertRecordStringProperty(value, 'status' satisfies keyof T, name, {
    expectedValue: 'queued' satisfies T['status'],
    ...options,
  });
  assertRecordStringProperty(
    value,
    'requestId' satisfies keyof T,
    name,
    options,
  );
}
