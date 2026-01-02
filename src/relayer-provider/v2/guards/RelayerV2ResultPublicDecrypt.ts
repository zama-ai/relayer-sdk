import {
  assertRecordBytesHexNo0xArrayProperty,
  assertRecordBytesHexNo0xProperty,
  assertRecordBytesHexProperty,
} from '@base/bytes';
import type { RelayerPublicDecryptResult } from '../../types/public-api';

export function assertIsRelayerV2ResultPublicDecrypt(
  value: unknown,
  name: string,
): asserts value is RelayerPublicDecryptResult {
  type T = RelayerPublicDecryptResult;
  assertRecordBytesHexNo0xArrayProperty(
    value,
    'signatures' satisfies keyof T,
    name,
  );
  assertRecordBytesHexNo0xProperty(
    value,
    'decryptedValue' satisfies keyof T,
    name,
  );
  assertRecordBytesHexProperty(value, 'extraData' satisfies keyof T, name);
}
