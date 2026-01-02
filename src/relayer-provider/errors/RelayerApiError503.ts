import type { RelayerApiError503Type } from '../types/public-api';
import { assertRecordStringProperty } from '@base/string';

////////////////////////////////////////////////////////////////////////////////

/*
    export type RelayerApiError503Type = {
      label: "protocol_paused" | "gateway_not_reachable" | "readiness_check_timedout" | "response_timedout";
      message: string;
    };
*/
export function assertIsRelayerApiError503Type(
  value: unknown,
  name: string,
): asserts value is RelayerApiError503Type {
  type T = RelayerApiError503Type;
  assertRecordStringProperty(value, 'label' satisfies keyof T, name, [
    'protocol_paused' satisfies T['label'],
    'gateway_not_reachable' satisfies T['label'],
    'readiness_check_timedout' satisfies T['label'],
    'response_timedout' satisfies T['label'],
  ]);
  assertRecordStringProperty(value, 'message' satisfies keyof T, name);
}
