import type { RelayerV2ResultPublicDecrypt } from './types';
import {
  assertRecordBytesHexNo0xArrayProperty,
  assertRecordBytesHexNo0xProperty,
  assertRecordBytesHexProperty,
} from '../../../utils/bytes';

export function assertIsRelayerV2ResultPublicDecrypt(
  value: unknown,
  name: string,
): asserts value is RelayerV2ResultPublicDecrypt {
  assertRecordBytesHexProperty(value, 'extra_data', name);
  assertRecordBytesHexNo0xArrayProperty(value, 'signatures', name);
  assertRecordBytesHexNo0xProperty(value, 'decrypted_value', name);
}
