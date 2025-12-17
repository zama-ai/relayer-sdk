import { InvalidPropertyError } from '../../../../errors/InvalidPropertyError';
import {
  assertRecordStringProperty,
  isRecordStringProperty,
} from '../../../../utils/string';
import { RelayerV2ApiError400NoDetails } from '../types';

/*
    type RelayerV2ApiError400 = {
      code: "malformed_json" | "request_error" | "not_ready_for_decryption";
      message: string;
      request_id: string;
    };
*/
export function isRelayerV2ApiError400NoDetails(
  error: unknown,
): error is RelayerV2ApiError400NoDetails {
  if (!isRecordStringProperty(error, 'label')) {
    return false;
  }
  if (
    !(
      error.label === 'malformed_json' ||
      error.label === 'request_error' ||
      error.label === 'not_ready_for_decryption'
    )
  ) {
    return false;
  }
  return isRecordStringProperty(error, 'message');
}

export function assertIsRelayerV2ApiError400NoDetails(
  value: unknown,
  name: string,
): asserts value is RelayerV2ApiError400NoDetails {
  assertRecordStringProperty(value, 'label', name);
  if (
    !(
      value.label === 'malformed_json' ||
      value.label === 'request_error' ||
      value.label === 'not_ready_for_decryption'
    )
  ) {
    throw new InvalidPropertyError({
      objName: name,
      property: 'label',
      expectedType: 'string',
      expectedValue: [
        'malformed_json',
        'request_error',
        'not_ready_for_decryption',
      ],
      type: typeof value.label, // === "string"
      value: value.label,
    });
  }
  assertRecordStringProperty(value, 'message', name);
}
