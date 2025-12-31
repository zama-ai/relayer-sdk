import type { RelayerV2ApiError400NoDetails } from '../types';
import { InvalidPropertyError } from '../../../../errors/InvalidPropertyError';
import {
  assertRecordStringProperty,
  isRecordStringProperty,
} from '../../../../utils/string';

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
  type T = RelayerV2ApiError400NoDetails;
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

export function assertIsRelayerV2ApiError400NoDetails(
  value: unknown,
  name: string,
): asserts value is RelayerV2ApiError400NoDetails {
  type T = RelayerV2ApiError400NoDetails;
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
