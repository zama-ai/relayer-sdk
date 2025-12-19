import { assertRecordStringProperty } from '../../../utils/string';
import { assertNonNullableRecordProperty } from '../../../utils/record';
import {
  RelayerV2GetResponseQueued,
  RelayerV2PostResponseQueued,
} from './types';
import { assertIsRelayerV2PostResultQueued } from './RelayerV2PostResultQueued';

/*
  {
    status: 'queued';
    requestId: string;
    result: { 
      jobId: string;
    };
  }
*/
export function assertIsRelayerV2PostResponseQueued(
  value: unknown,
  name: string,
): asserts value is RelayerV2PostResponseQueued {
  assertRecordStringProperty(value, 'status', name, 'queued');
  assertRecordStringProperty(value, 'requestId', name);
  assertNonNullableRecordProperty(value, 'result', name);
  assertIsRelayerV2PostResultQueued(value.result, `${name}.result`);
}

/*
  {
    status: 'queued';
    requestId: string;
  }
*/
export function assertIsRelayerV2GetResponseQueued(
  value: unknown,
  name: string,
): asserts value is RelayerV2GetResponseQueued {
  assertRecordStringProperty(value, 'status', name, 'queued');
  assertRecordStringProperty(value, 'requestId', name);
}
