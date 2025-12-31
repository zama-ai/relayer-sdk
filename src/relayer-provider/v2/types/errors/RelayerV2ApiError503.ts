import type { RelayerV2ResponseApiError503 } from '../types';
import { assertRecordStringProperty } from '../../../../utils/string';

/*
    export type RelayerV2ApiError503 = {
      label: "protocol_paused" | "gateway_not_reachable" | "readiness_check_timedout" | "response_timedout";
      message: string;
    };
*/
export function assertIsRelayerV2ApiError503(
  value: unknown,
  name: string,
): asserts value is RelayerV2ResponseApiError503 {
  type T = RelayerV2ResponseApiError503;
  assertRecordStringProperty(value, 'label' satisfies keyof T, name, [
    'protocol_paused' satisfies T['label'],
    'gateway_not_reachable' satisfies T['label'],
    'readiness_check_timedout' satisfies T['label'],
    'response_timedout' satisfies T['label'],
  ]);
  assertRecordStringProperty(value, 'message' satisfies keyof T, name);
}
