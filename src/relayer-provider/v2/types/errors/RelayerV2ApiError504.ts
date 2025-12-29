import type { RelayerV2ResponseApiError504 } from '../types';
import { assertRecordStringProperty } from '../../../../utils/string';

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
  type T = RelayerV2ResponseApiError504;
  assertRecordStringProperty(value, 'label' satisfies keyof T, name, [
    'readiness_check_timedout' satisfies T['label'],
    'response_timedout' satisfies T['label'],
  ]);
  assertRecordStringProperty(value, 'message' satisfies keyof T, name);
}
