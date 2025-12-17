import { assertRecordStringProperty } from '../../../../utils/string';
import { RelayerV2ResponseApiError404 } from '../types';

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
  assertRecordStringProperty(value, 'label', name, 'not_found');
  assertRecordStringProperty(value, 'message', name);
}
