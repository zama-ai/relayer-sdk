import type { RelayerV2ResultQueued } from './types';
import { assertRecordStringProperty } from '../../../utils/string';
import { assertRecordUintProperty } from '../../../utils/uint';

export function assertIsRelayerV2ResultQueued(
  value: unknown,
  name: string,
): asserts value is RelayerV2ResultQueued {
  assertRecordStringProperty(value, 'jobId', name);
  assertRecordUintProperty(value, 'retryAfterSeconds', name);
}
