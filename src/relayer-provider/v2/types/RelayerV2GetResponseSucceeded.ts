import { assertRecordStringProperty } from '../../../utils/string';
import { assertNonNullableRecordProperty } from '../../../utils/record';
import { assertIsRelayerV2ResultUserDecrypt } from './RelayerV2ResultUserDecrypt';
import { assertIsRelayerV2ResultInputProof } from './RelayerV2ResultInputProof';

import {
  RelayerV2GetResponseSucceededMap,
  RelayerV2PostOperationResultMap,
} from './types';
import { assertIsRelayerV2ResultPublicDecrypt } from './RelayerV2ResultPublicDecrypt';
import { assertNever } from '../../../errors/utils';
import { RelayerPostOperation } from '../../../types/relayer';

export function assertIsRelayerV2GetResponseSucceeded<
  T extends RelayerPostOperation,
>(
  operation: T,
  value: unknown,
  name: string,
): asserts value is RelayerV2GetResponseSucceededMap[T] {
  assertNonNullableRecordProperty(value, 'result', name);
  assertRecordStringProperty(value, 'status', name, 'succeeded');
  assertIsRelayerV2Result(operation, value.result, `${name}.result`);
}

export function assertIsRelayerV2Result<T extends RelayerPostOperation>(
  operation: T,
  value: unknown,
  name: string,
): asserts value is RelayerV2PostOperationResultMap[T] {
  if (operation === 'INPUT_PROOF') {
    assertIsRelayerV2ResultInputProof(value, name);
  } else if (operation === 'PUBLIC_DECRYPT') {
    assertIsRelayerV2ResultPublicDecrypt(value, name);
  } else if (operation === 'USER_DECRYPT') {
    assertIsRelayerV2ResultUserDecrypt(value, name);
  } else {
    assertNever(operation, `Unexpected operation ${operation}`);
  }
}
