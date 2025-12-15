import { assertRecordStringProperty } from '../../../../utils/string';
import { RelayerV2ResponseApiError500 } from '../types';

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
  assertRecordStringProperty(value, 'label', name, 'internal_server_error');
  assertRecordStringProperty(value, 'message', name);
}
