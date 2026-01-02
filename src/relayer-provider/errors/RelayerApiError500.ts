import type { RelayerApiError500Type } from '../types/public-api';
import { assertRecordStringProperty } from '@base/string';

////////////////////////////////////////////////////////////////////////////////

/*
    export type RelayerApiError500Type = {
        label: 'internal_server_error';
        message: string;
    };
*/
export function assertIsRelayerApiError500Type(
  value: unknown,
  name: string,
): asserts value is RelayerApiError500Type {
  type T = RelayerApiError500Type;
  assertRecordStringProperty(
    value,
    'label' satisfies keyof T,
    name,
    'internal_server_error' satisfies T['label'],
  );
  assertRecordStringProperty(value, 'message' satisfies keyof T, name);
}
