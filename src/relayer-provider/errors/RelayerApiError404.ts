import type { RelayerApiError404Type } from '../types/public-api';
import { assertRecordStringProperty } from '@base/string';

////////////////////////////////////////////////////////////////////////////////

/*
  export type RelayerApiError404Type = {
    label: 'not_found';
    message: string;
  };
*/
export function assertIsRelayerApiError404Type(
  value: unknown,
  name: string,
): asserts value is RelayerApiError404Type {
  type T = RelayerApiError404Type;
  assertRecordStringProperty(
    value,
    'label' satisfies keyof T,
    name,
    'not_found' satisfies T['label'],
  );
  assertRecordStringProperty(value, 'message' satisfies keyof T, name);
}
