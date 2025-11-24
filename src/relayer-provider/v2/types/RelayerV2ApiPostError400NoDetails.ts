import { assertRecordStringProperty } from '../../../utils/string';
import { RelayerV2ApiError, RelayerV2ApiPostError400NoDetails } from './types';

/*
    type RelayerV2ApiPostError400 = {
      code: "malformed_json" | "request_error" | "not_ready_for_decryption";
      message: string;
      request_id: string;
    };
*/
export function assertIsRelayerV2ApiPostError400NoDetails(
  value: unknown,
  name: string,
): asserts value is RelayerV2ApiPostError400NoDetails {
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

export function isRelayerV2ApiPostError400NoDetails(
  error: RelayerV2ApiError,
  name: string,
): error is RelayerV2ApiPostError400NoDetails {
  if (
    !(
      error.code === 'malformed_json' ||
      error.code === 'request_error' ||
      error.code === 'not_ready_for_decryption'
    )
  ) {
    return false;
  }
  assertRecordStringProperty(error, 'message', name);
  assertRecordStringProperty(error, 'request_id', name);
  return true;
}
