import { assertRecordStringProperty } from '../../../utils/string';
import { assertNonNullableRecordProperty } from '../../../utils/record';
import { RelayerV2ResponseQueued } from './types';
import { assertIsRelayerV2ResultQueued } from './RelayerV2ResultQueued';

/*
  type RelayerV2ResponseQueued = {
    status: "queued";
    result: RelayerV2ResultQueued;
  }
*/
export function assertIsRelayerV2ResponseQueued(
  value: unknown,
  name: string,
): asserts value is RelayerV2ResponseQueued {
  assertRecordStringProperty(value, 'status', name, 'queued');
  assertNonNullableRecordProperty(value, 'result', name);
  assertIsRelayerV2ResultQueued(value.result, `${name}.result`);
}
