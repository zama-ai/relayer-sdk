import { assertRecordStringProperty } from '../../../utils/string';
import { RelayerV2ApiError500 } from './types';

/*
    export type RelayerV2ApiError500 = {
        code: 'internal_server_error';
        message: string;
        request_id: string;
    };
*/
export function assertIsRelayerV2ApiError500(
  value: unknown,
  name: string,
): asserts value is RelayerV2ApiError500 {
  assertRecordStringProperty(value, 'code', name, 'internal_server_error');
  assertRecordStringProperty(value, 'message', name);
  assertRecordStringProperty(value, 'request_id', name);
}
