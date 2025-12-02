import type { RelayerV2GetResponseSucceeded } from './types';
import { assertRecordStringProperty } from '../../../utils/string';
import {
  assertNonNullableRecordProperty,
  isNonNullableRecordProperty,
} from '../../../utils/record';
import { InvalidPropertyError } from '../../../errors/InvalidPropertyError';
import { assertIsRelayerV2ResultPublicDecrypt } from './RelayerV2ResultPublicDecrypt';
import { assertIsRelayerV2ResultUserDecrypt } from './RelayerV2ResultUserDecrypt';
import { assertIsRelayerV2ResultInputProof } from './RelayerV2ResultInputProof';

export function assertIsRelayerV2GetResponseSucceeded(
  value: unknown,
  name: string,
): asserts value is RelayerV2GetResponseSucceeded {
  assertNonNullableRecordProperty(value, 'result', name);
  assertRecordStringProperty(value, 'status', name, 'succeeded');

  const result = value.result;
  if (isNonNullableRecordProperty(result, 'decrypted_value')) {
    assertIsRelayerV2ResultPublicDecrypt(result, `${name}.result`);
  } else if (isNonNullableRecordProperty(result, 'payloads')) {
    assertIsRelayerV2ResultUserDecrypt(result, `${name}.result`);
  } else if (isNonNullableRecordProperty(result, 'accepted')) {
    assertIsRelayerV2ResultInputProof(result, `${name}.result`);
  } else {
    throw InvalidPropertyError.invalidFormat({
      objName: name,
      property: 'result',
    });
  }
}
