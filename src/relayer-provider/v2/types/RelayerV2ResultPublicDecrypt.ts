import type { RelayerV2ResultPublicDecrypt } from './types';
import {
  assertBytesHexNo0xArrayProperty,
  assertBytesHexNo0xProperty,
  assertBytesHexProperty,
} from '../../../utils/bytes';

export function assertIsRelayerV2ResultPublicDecrypt(
  value: unknown,
  name: string,
): asserts value is RelayerV2ResultPublicDecrypt {
  assertBytesHexProperty(value, 'extra_data', name);
  assertBytesHexNo0xArrayProperty(value, 'signatures', name);
  assertBytesHexNo0xProperty(value, 'decrypted_value', name);
}
