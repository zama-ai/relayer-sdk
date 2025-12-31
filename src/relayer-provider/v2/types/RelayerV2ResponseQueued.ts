import type {
  RelayerV2GetResponseQueued,
  RelayerV2PostResponseQueued,
} from './types';
import { assertRecordStringProperty } from '../../../utils/string';
import { assertRecordNonNullableProperty } from '../../../utils/record';
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
  type T = RelayerV2PostResponseQueued;
  assertRecordStringProperty(
    value,
    'status' satisfies keyof T,
    name,
    'queued' satisfies T['status'],
  );
  assertRecordStringProperty(value, 'requestId' satisfies keyof T, name);
  assertRecordNonNullableProperty(value, 'result' satisfies keyof T, name);
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
  type T = RelayerV2GetResponseQueued;
  assertRecordStringProperty(
    value,
    'status' satisfies keyof T,
    name,
    'queued' satisfies T['status'],
  );
  assertRecordStringProperty(value, 'requestId' satisfies keyof T, name);
}
