import type { RelayerV2ResponseApiError500 } from '../types';
import { assertRecordStringProperty } from '../../../../utils/string';

/*
    export type RelayerV2ApiError500 = {
        label: 'internal_server_error';
        message: string;
    };
*/
export function assertIsRelayerV2ApiError500(
  value: unknown,
  name: string,
): asserts value is RelayerV2ResponseApiError500 {
  type T = RelayerV2ResponseApiError500;
  assertRecordStringProperty(
    value,
    'label' satisfies keyof T,
    name,
    'internal_server_error' satisfies T['label'],
  );
  assertRecordStringProperty(value, 'message' satisfies keyof T, name);
}
