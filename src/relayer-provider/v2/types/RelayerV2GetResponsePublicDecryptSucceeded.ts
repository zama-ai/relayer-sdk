import { assertRecordStringProperty } from '../../../utils/string';
import { assertNonNullableRecordProperty } from '../../../utils/record';
import { assertIsRelayerV2ResultPublicDecrypt } from './RelayerV2ResultPublicDecrypt';
import { RelayerV2GetResponsePublicDecryptSucceeded } from './types';

export function assertIsRelayerV2GetResponsePublicDecryptSucceeded(
  value: unknown,
  name: string,
): asserts value is RelayerV2GetResponsePublicDecryptSucceeded {
  assertNonNullableRecordProperty(value, 'result', name);
  assertRecordStringProperty(value, 'status', name, 'succeeded');
  assertRecordStringProperty(value, 'requestId', name);
  assertIsRelayerV2ResultPublicDecrypt(value.result, `${name}.result`);
}
