import type { RelayerV2ResultUserDecrypt } from './types';
import { assertBytesHexNo0xArrayProperty } from '../../../utils/bytes';

export function assertIsRelayerV2ResultUserDecrypt(
  value: unknown,
  name: string,
): asserts value is RelayerV2ResultUserDecrypt {
  assertBytesHexNo0xArrayProperty(value, 'payloads', name);
  assertBytesHexNo0xArrayProperty(value, 'signatures', name);
}
