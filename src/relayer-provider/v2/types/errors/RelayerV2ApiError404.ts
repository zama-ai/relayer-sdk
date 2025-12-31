import type { RelayerV2ResponseApiError404 } from '../types';
import { assertRecordStringProperty } from '../../../../utils/string';

/*
  export type RelayerV2ApiError404 = {
    label: 'not_found';
    message: string;
  };
*/
export function assertIsRelayerV2ApiError404(
  value: unknown,
  name: string,
): asserts value is RelayerV2ResponseApiError404 {
  type T = RelayerV2ResponseApiError404;
  assertRecordStringProperty(
    value,
    'label' satisfies keyof T,
    name,
    'not_found' satisfies T['label'],
  );
  assertRecordStringProperty(value, 'message' satisfies keyof T, name);
}
