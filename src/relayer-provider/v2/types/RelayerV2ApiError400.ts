import { assertRecordStringProperty } from '../../../utils/string';
import { RelayerV2ApiPostError400 } from './types';

/*
    type RelayerV2ApiError500 = {
      code: "malformed_json" | "request_error" | "not_ready_for_decryption";
      message: string;
      request_id: string;
    };
*/
export function assertIsRelayerV2ApiError400(
  value: unknown,
  name: string,
): asserts value is RelayerV2ApiPostError400 {
  assertRecordStringProperty(value, 'code', name);
  if (
    !(
      value.code === 'malformed_json' ||
      value.code === 'request_error' ||
      value.code === 'not_ready_for_decryption'
    )
  ) {
    throw new Error(
      `Invalid value for ${name}.code. Expected 'malformed_json' | 'request_error' | 'not_ready_for_decryption'. Got '${value.code}'.`,
    );
  }
  assertRecordStringProperty(value, 'message', name);
  assertRecordStringProperty(value, 'request_id', name);
}
