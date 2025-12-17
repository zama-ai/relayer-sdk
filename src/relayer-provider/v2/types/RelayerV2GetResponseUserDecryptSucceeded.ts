import type { RelayerV2GetResponseUserDecryptSucceeded } from './types';
import { assertRecordStringProperty } from '../../../utils/string';
import { assertNonNullableRecordProperty } from '../../../utils/record';
import { assertIsRelayerV2ResultUserDecrypt } from './RelayerV2ResultUserDecrypt';

export function assertIsRelayerV2GetResponseUserDecryptSucceeded(
  value: unknown,
  name: string,
): asserts value is RelayerV2GetResponseUserDecryptSucceeded {
  assertNonNullableRecordProperty(value, 'result', name);
  assertRecordStringProperty(value, 'status', name, 'succeeded');
  assertRecordStringProperty(value, 'requestId', name);
  assertIsRelayerV2ResultUserDecrypt(value.result, `${name}.result`);
}
