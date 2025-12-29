import type { RelayerV2ResponseApiError429 } from '../types';
import { assertRecordStringProperty } from '../../../../utils/string';

/*
  export type RelayerV2ApiError429 = {
    label: 'rate_limited';
    message: string;
  };
*/
export function assertIsRelayerV2ApiError429(
  value: unknown,
  name: string,
): asserts value is RelayerV2ResponseApiError429 {
  type T = RelayerV2ResponseApiError429;
  assertRecordStringProperty(
    value,
    'label' satisfies keyof T,
    name,
    'rate_limited' satisfies T['label'],
  );
  assertRecordStringProperty(value, 'message' satisfies keyof T, name);
}
