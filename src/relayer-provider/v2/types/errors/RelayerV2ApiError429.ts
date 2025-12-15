import { assertRecordStringProperty } from '../../../../utils/string';
import { RelayerV2ResponseApiError429 } from '../types';

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
  assertRecordStringProperty(value, 'label', name, 'rate_limited');
  assertRecordStringProperty(value, 'message', name);
}
