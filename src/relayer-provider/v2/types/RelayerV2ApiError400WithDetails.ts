import { assertRecordArrayProperty } from '../../../utils/record';
import { assertRecordStringProperty } from '../../../utils/string';
import { RelayerV2ApiPostError400WithDetails } from './types';

/*
    type RelayerV2ApiPostError400WithDetails = {
      code: 'missing_fields' | 'validation_failed';
      message: string;
      request_id: string;
      details: Array<RelayerV2PostErrorDetail>;
    };
    type RelayerV2PostErrorDetail = {
      field: string;
      issue: string;
    }
*/
export function assertIsRelayerV2ApiError400WithDetails(
  value: unknown,
  name: string,
): asserts value is RelayerV2ApiPostError400WithDetails {
  assertRecordStringProperty(value, 'code', name);
  if (
    !(value.code === 'missing_fields' || value.code === 'validation_failed')
  ) {
    throw new Error(
      `Invalid value for ${name}.code. Expected 'missing_fields' | 'validation_failed'. Got '${value.code}'.`,
    );
  }
  assertRecordStringProperty(value, 'message', name);
  assertRecordStringProperty(value, 'request_id', name);
  assertRecordArrayProperty(value, 'details', name);
  const arr = value.details;
  for (let i = 0; i < arr.length; ++i) {
    const detail = arr[i];
    assertRecordStringProperty(detail, 'field', `${name}.details[${i}]`);
    assertRecordStringProperty(detail, 'issue', `${name}.details[${i}]`);
  }
}
