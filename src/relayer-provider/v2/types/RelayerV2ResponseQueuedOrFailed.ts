import { RelayerV2ResponseQueuedOrFailed } from './types';
import { assertRecordStringProperty } from '../../../utils/string';
import { InvalidPropertyError } from '../../../errors/InvalidPropertyError';
import { assertIsRelayerV2ResponseFailed } from './RelayerV2ResponseFailed';
import { assertIsRelayerV2ResponseQueued } from './RelayerV2ResponseQueued';

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
    throw InvalidPropertyError.invalidFormat({
      objName: name,
      property: 'result',
    });
  }
}
