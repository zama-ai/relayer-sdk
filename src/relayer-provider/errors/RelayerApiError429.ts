import type { RelayerApiError429Type } from '../types/public-api';
import { assertRecordStringProperty } from '@base/string';

////////////////////////////////////////////////////////////////////////////////

/*
  export type RelayerApiError429Type = {
    label: 'rate_limited';
    message: string;
  };
*/
export function assertIsRelayerApiError429Type(
  value: unknown,
  name: string,
): asserts value is RelayerApiError429Type {
  type T = RelayerApiError429Type;
  assertRecordStringProperty(
    value,
    'label' satisfies keyof T,
    name,
    'rate_limited' satisfies T['label'],
  );
  assertRecordStringProperty(value, 'message' satisfies keyof T, name);
}
