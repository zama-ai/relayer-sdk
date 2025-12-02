import { assertRecordStringProperty } from '../../../utils/string';
import { RelayerV2ApiGetError504 } from './types';

/*
    export type RelayerV2ApiGetError504 = {
      label: 'readiness_check_timedout' | 'response_timedout';
      message: string;
    };
*/
export function assertIsRelayerV2ApiGetError504(
  value: unknown,
  name: string,
): asserts value is RelayerV2ApiGetError504 {
  assertRecordStringProperty(value, 'label', name, [
    'readiness_check_timedout',
    'response_timedout',
  ]);
  assertRecordStringProperty(value, 'message', name);
}
