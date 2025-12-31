import type { RelayerV2ApiError400WithDetails } from '../types';
import { InvalidPropertyError } from '../../../../errors/InvalidPropertyError';
import {
  assertRecordArrayProperty,
  isRecordArrayProperty,
} from '../../../../utils/record';
import {
  assertRecordStringProperty,
  isRecordStringProperty,
} from '../../../../utils/string';

/*
    type RelayerV2ApiError400WithDetails = {
      label: 'missing_fields' | 'validation_failed';
      message: string;
      details: Array<RelayerV2ErrorDetail>;
    };
    type RelayerV2ErrorDetail = {
      field: string;
      issue: string;
    }
*/
export function assertIsRelayerV2ApiError400WithDetails(
  value: unknown,
  name: string,
): asserts value is RelayerV2ApiError400WithDetails {
  type T = RelayerV2ApiError400WithDetails;
  type DetailItem = T['details'][number];
  assertRecordStringProperty(value, 'label' satisfies keyof T, name);
  if (
    !(
      value.label === ('missing_fields' satisfies T['label']) ||
      value.label === ('validation_failed' satisfies T['label'])
    )
  ) {
    throw new InvalidPropertyError({
      objName: name,
      property: 'label' satisfies keyof T,
      expectedType: 'string',
      expectedValue: [
        'missing_fields' satisfies T['label'],
        'validation_failed' satisfies T['label'],
      ],
      type: typeof value.label,
      value: value.label,
    });
  }
  assertRecordStringProperty(value, 'message' satisfies keyof T, name);
  assertRecordArrayProperty(value, 'details' satisfies keyof T, name);
  const arr = value.details;
  for (let i = 0; i < arr.length; ++i) {
    const detail = arr[i];
    assertRecordStringProperty(
      detail,
      'field' satisfies keyof DetailItem,
      `${name}.details[${i}]`,
    );
    assertRecordStringProperty(
      detail,
      'issue' satisfies keyof DetailItem,
      `${name}.details[${i}]`,
    );
  }
}

export function isRelayerV2ApiError400WithDetails(
  error: unknown,
): error is RelayerV2ApiError400WithDetails {
  type T = RelayerV2ApiError400WithDetails;
  type DetailItem = T['details'][number];
  if (!isRecordStringProperty(error, 'label' satisfies keyof T)) {
    return false;
  }
  if (
    !(
      error.label === ('missing_fields' satisfies T['label']) ||
      error.label === ('validation_failed' satisfies T['label'])
    )
  ) {
    return false;
  }
  if (!isRecordStringProperty(error, 'message' satisfies keyof T)) {
    return false;
  }
  if (!isRecordArrayProperty(error, 'details' satisfies keyof T)) {
    return false;
  }
  const arr = error.details;
  for (let i = 0; i < arr.length; ++i) {
    const detail = arr[i];
    if (!isRecordStringProperty(detail, 'field' satisfies keyof DetailItem)) {
      return false;
    }
    if (!isRecordStringProperty(detail, 'issue' satisfies keyof DetailItem)) {
      return false;
    }
  }
  return true;
}
