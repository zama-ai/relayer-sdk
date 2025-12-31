import type { RelayerV2GetResponseInputProofSucceeded } from './types';
import { assertRecordStringProperty } from '../../../utils/string';
import { assertRecordNonNullableProperty } from '../../../utils/record';
import { assertIsRelayerV2ResultInputProof } from './RelayerV2ResultInputProof';

export function assertIsRelayerV2GetResponseInputProofSucceeded(
  value: unknown,
  name: string,
): asserts value is RelayerV2GetResponseInputProofSucceeded {
  assertRecordNonNullableProperty(
    value,
    'result' satisfies keyof RelayerV2GetResponseInputProofSucceeded,
    name,
  );
  assertRecordStringProperty(
    value,
    'status' satisfies keyof RelayerV2GetResponseInputProofSucceeded,
    name,
    'succeeded',
  );
  assertRecordStringProperty(
    value,
    'requestId' satisfies keyof RelayerV2GetResponseInputProofSucceeded,
    name,
  );
  assertIsRelayerV2ResultInputProof(value.result, `${name}.result`);
}
