import type { RelayerV2ResultQueued } from './types';
import {
  assertRecordStringProperty,
  assertRecordTimestampProperty,
} from '../../../utils/string';

export function assertIsRelayerV2ResultQueued(
  value: unknown,
  name: string,
): asserts value is RelayerV2ResultQueued {
  assertRecordStringProperty(value, 'id', name);
  assertRecordTimestampProperty(value, 'retry_after', name);
}
