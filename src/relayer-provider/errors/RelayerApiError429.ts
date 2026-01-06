import type { RelayerApiError429Type } from '../types/public-api';
import { assertRecordStringProperty } from '@base/string';

////////////////////////////////////////////////////////////////////////////////

/*
  export type RelayerApiError429Type = {
    label: 'rate_limited' | 'protocol_overload';
    message: string;
  };
*/
export function assertIsRelayerApiError429Type(
  error: unknown,
  name: string,
): asserts error is RelayerApiError429Type {
  type T = RelayerApiError429Type;
  assertRecordStringProperty(error, 'label' satisfies keyof T, name, [
    'rate_limited' satisfies T['label'],
    'protocol_overload' satisfies T['label'],
  ]);
  assertRecordStringProperty(error, 'message' satisfies keyof T, name);
}
