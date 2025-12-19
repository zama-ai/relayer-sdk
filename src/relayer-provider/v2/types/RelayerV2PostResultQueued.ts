import type { RelayerV2PostResultQueued } from './types';
import { assertRecordStringProperty } from '../../../utils/string';

export function assertIsRelayerV2PostResultQueued(
  value: unknown,
  name: string,
): asserts value is RelayerV2PostResultQueued {
  assertRecordStringProperty(value, 'jobId', name);
}
