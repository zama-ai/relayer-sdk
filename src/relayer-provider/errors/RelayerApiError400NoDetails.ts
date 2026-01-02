import type { RelayerApiError400NoDetailsType } from '../types/public-api';
import { InvalidPropertyError } from '../../errors/InvalidPropertyError';
import {
  assertRecordStringProperty,
  isRecordStringProperty,
} from '@base/string';

////////////////////////////////////////////////////////////////////////////////

/*
    type RelayerApiError400NoDetailsType = {
      code: "malformed_json" | "request_error" | "not_ready_for_decryption";
      message: string;
      request_id: string;
    };
*/
export function isRelayerApiError400NoDetailsType(
  error: unknown,
): error is RelayerApiError400NoDetailsType {
  type T = RelayerApiError400NoDetailsType;
  if (!isRecordStringProperty(error, 'label' satisfies keyof T)) {
    return false;
  }
  if (
    !(
      error.label === ('malformed_json' satisfies T['label']) ||
      error.label === ('request_error' satisfies T['label']) ||
      error.label === ('not_ready_for_decryption' satisfies T['label'])
    )
  ) {
    return false;
  }
  return isRecordStringProperty(error, 'message' satisfies keyof T);
}

////////////////////////////////////////////////////////////////////////////////

export function assertIsRelayerApiError400NoDetailsType(
  value: unknown,
  name: string,
): asserts value is RelayerApiError400NoDetailsType {
  type T = RelayerApiError400NoDetailsType;
  assertRecordStringProperty(value, 'label' satisfies keyof T, name);
  if (
    !(
      value.label === ('malformed_json' satisfies T['label']) ||
      value.label === ('request_error' satisfies T['label']) ||
      value.label === ('not_ready_for_decryption' satisfies T['label'])
    )
  ) {
    throw new InvalidPropertyError({
      objName: name,
      property: 'label' satisfies keyof T,
      expectedType: 'string',
      expectedValue: [
        'malformed_json' satisfies T['label'],
        'request_error' satisfies T['label'],
        'not_ready_for_decryption' satisfies T['label'],
      ],
      type: typeof value.label, // === "string"
      value: value.label,
    });
  }
  assertRecordStringProperty(value, 'message' satisfies keyof T, name);
}
