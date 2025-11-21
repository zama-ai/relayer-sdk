import { assertRecordStringProperty } from '../../../utils/string';
import { assertNonNullableRecordProperty } from '../../../utils/record';
import {
  RelayerV2ResponseQueued,
  RelayerV2ResponseQueuedOrFailed,
} from './types';
import { assertIsRelayerV2ResponseFailed } from './RelayerV2ResponseFailed';
import { assertIsRelayerV2ResultQueued } from './RelayerV2ResultQueued';

export function assertIsRelayerV2ResponseQueuedOrFailed(
  value: unknown,
  name: string,
): asserts value is RelayerV2ResponseQueuedOrFailed {
  assertRecordStringProperty(value, 'status', name);
  if (value.status === 'failed') {
    assertIsRelayerV2ResponseFailed(value, name);
  } else if (value.status === 'queued') {
    assertIsRelayerV2ResponseQueued(value, name);
  } else {
    throw new Error(
      `Invalid value for ${name}.status. Expected 'failed' | 'queued'. Got '${value.status}'.`,
    );
  }
}

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
