import { assertRecordStringProperty } from '../../../../utils/string';
import { RelayerV2ResponseApiError504 } from '../types';

/*
    export type RelayerV2ApiError504 = {
      label: 'readiness_check_timedout' | 'response_timedout';
      message: string;
    };
*/
export function assertIsRelayerV2ApiError504(
  value: unknown,
  name: string,
): asserts value is RelayerV2ResponseApiError504 {
  assertRecordStringProperty(value, 'label', name, [
    'readiness_check_timedout',
    'response_timedout',
  ]);
  assertRecordStringProperty(value, 'message', name);
}
