import type { RelayerApiError400WithDetailsType } from '../types/public-api';
import { InvalidPropertyError } from '../../errors/InvalidPropertyError';
import { assertRecordArrayProperty, isRecordArrayProperty } from '@base/record';
import {
  assertRecordStringProperty,
  isRecordStringProperty,
} from '@base/string';

////////////////////////////////////////////////////////////////////////////////

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

export function isRelayerApiError400WithDetailsType(
  error: unknown,
): error is RelayerApiError400WithDetailsType {
  type T = RelayerApiError400WithDetailsType;
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

////////////////////////////////////////////////////////////////////////////////

export function assertIsRelayerApiError400WithDetailsType(
  value: unknown,
  name: string,
): asserts value is RelayerApiError400WithDetailsType {
  type T = RelayerApiError400WithDetailsType;
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
