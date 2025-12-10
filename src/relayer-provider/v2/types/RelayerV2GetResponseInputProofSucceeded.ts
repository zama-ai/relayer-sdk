import type { RelayerV2GetResponseInputProofSucceeded } from './types';
import { assertRecordStringProperty } from '../../../utils/string';
import { assertNonNullableRecordProperty } from '../../../utils/record';
import { assertIsRelayerV2ResultInputProof } from './RelayerV2ResultInputProof';

export function assertIsRelayerV2GetResponseInputProofSucceeded(
  value: unknown,
  name: string,
): asserts value is RelayerV2GetResponseInputProofSucceeded {
  assertNonNullableRecordProperty(value, 'result', name);
  assertRecordStringProperty(value, 'status', name, 'succeeded');
  assertRecordStringProperty(value, 'requestId', name);
  assertIsRelayerV2ResultInputProof(value.result, `${name}.result`);
}
