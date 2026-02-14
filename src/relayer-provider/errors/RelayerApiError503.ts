import type { RelayerApiError503Type } from '../types/public-api';
import { assertRecordStringProperty } from '@base/string';

////////////////////////////////////////////////////////////////////////////////

/*
    export type RelayerApiError503Type = {
      label: "protocol_paused" | "insufficient_balance"  | "insufficient_allowance" | "gateway_not_reachable" | "readiness_check_timed_out" | "response_timed_out";
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
    'insufficient_balance' satisfies T['label'],
    'insufficient_allowance' satisfies T['label'],
    'gateway_not_reachable' satisfies T['label'],
    'readiness_check_timed_out' satisfies T['label'],
    'response_timed_out' satisfies T['label'],
  ]);
  assertRecordStringProperty(value, 'message' satisfies keyof T, name);
}
