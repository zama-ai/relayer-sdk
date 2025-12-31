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
  type T = RelayerV2ResultPublicDecrypt;
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
