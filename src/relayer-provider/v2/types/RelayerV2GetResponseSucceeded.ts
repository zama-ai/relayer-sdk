import type { RelayerPostOperation } from '../../../types/relayer';
import type {
  RelayerV2GetResponseSucceededMap,
  RelayerV2PostOperationResultMap,
} from './types';
import { assertRecordStringProperty } from '../../../utils/string';
import { assertRecordNonNullableProperty } from '../../../utils/record';
import { assertIsRelayerV2ResultUserDecrypt } from './RelayerV2ResultUserDecrypt';
import { assertIsRelayerV2ResultInputProof } from './RelayerV2ResultInputProof';
import { assertIsRelayerV2ResultPublicDecrypt } from './RelayerV2ResultPublicDecrypt';
import { assertNever } from '../../../errors/utils';

export function assertIsRelayerV2GetResponseSucceeded<
  T extends RelayerPostOperation,
>(
  operation: T,
  value: unknown,
  name: string,
): asserts value is RelayerV2GetResponseSucceededMap[T] {
  type K = RelayerV2GetResponseSucceededMap[T];
  assertRecordNonNullableProperty(value, 'result' satisfies keyof K, name);
  assertRecordStringProperty(
    value,
    'status' satisfies keyof K,
    name,
    'succeeded' satisfies K['status'],
  );
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
