import { InvalidPropertyError } from '../../../../errors/InvalidPropertyError';
import {
  assertRecordArrayProperty,
  isRecordArrayProperty,
} from '../../../../utils/record';
import {
  assertRecordStringProperty,
  isRecordStringProperty,
} from '../../../../utils/string';
import { RelayerV2ApiError400WithDetails } from '../types';

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
  assertRecordStringProperty(value, 'label', name);
  if (
    !(value.label === 'missing_fields' || value.label === 'validation_failed')
  ) {
    throw new InvalidPropertyError({
      objName: name,
      property: 'label',
      expectedType: 'string',
      expectedValue: ['missing_fields', 'validation_failed'],
      type: typeof value.label,
      value: value.label,
    });
  }
  assertRecordStringProperty(value, 'message', name);
  assertRecordArrayProperty(value, 'details', name);
  const arr = value.details;
  for (let i = 0; i < arr.length; ++i) {
    const detail = arr[i];
    assertRecordStringProperty(detail, 'field', `${name}.details[${i}]`);
    assertRecordStringProperty(detail, 'issue', `${name}.details[${i}]`);
  }
}

export function isRelayerV2ApiError400WithDetails(
  error: unknown,
): error is RelayerV2ApiError400WithDetails {
  if (!isRecordStringProperty(error, 'label')) {
    return false;
  }
  if (
    !(error.label === 'missing_fields' || error.label === 'validation_failed')
  ) {
    return false;
  }
  if (!isRecordStringProperty(error, 'message')) {
    return false;
  }
  if (!isRecordArrayProperty(error, 'details')) {
    return false;
  }
  const arr = error.details;
  for (let i = 0; i < arr.length; ++i) {
    const detail = arr[i];
    if (!isRecordStringProperty(detail, 'field')) {
      return false;
    }
    if (!isRecordStringProperty(detail, 'issue')) {
      return false;
    }
  }
  return true;
}
