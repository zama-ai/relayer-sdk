import type { RelayerV2GetResponsePublicDecryptSucceeded } from './types';
import { assertRecordStringProperty } from '../../../utils/string';
import { assertRecordNonNullableProperty } from '../../../utils/record';
import { assertIsRelayerV2ResultPublicDecrypt } from './RelayerV2ResultPublicDecrypt';

export function assertIsRelayerV2GetResponsePublicDecryptSucceeded(
  value: unknown,
  name: string,
): asserts value is RelayerV2GetResponsePublicDecryptSucceeded {
  type T = RelayerV2GetResponsePublicDecryptSucceeded;
  assertRecordNonNullableProperty(value, 'result' satisfies keyof T, name);
  assertRecordStringProperty(
    value,
    'status' satisfies keyof T,
    name,
    'succeeded' satisfies T['status'],
  );
  assertRecordStringProperty(value, 'requestId' satisfies keyof T, name);
  assertIsRelayerV2ResultPublicDecrypt(value.result, `${name}.result`);
}
