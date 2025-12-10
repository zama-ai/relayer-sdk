import type { RelayerV2ResultUserDecrypt } from './types';
import {
  assertRecordBytesHexNo0xArrayProperty,
  assertRecordBytesHexProperty,
} from '../../../utils/bytes';

export function assertIsRelayerV2ResultUserDecrypt(
  value: unknown,
  name: string,
): asserts value is RelayerV2ResultUserDecrypt {
  assertRecordBytesHexNo0xArrayProperty(value, 'payloads', name);
  assertRecordBytesHexNo0xArrayProperty(value, 'signatures', name);
  assertRecordBytesHexProperty(value, 'extra_data', name);
}
