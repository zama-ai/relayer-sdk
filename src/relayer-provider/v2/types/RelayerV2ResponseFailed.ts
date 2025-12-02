import { assertNonNullableRecordProperty } from '../../../utils/record';
import { assertRecordStringProperty } from '../../../utils/string';
import {
  RelayerV2ApiError,
  RelayerV2ApiError500,
  RelayerV2ApiError400,
  RelayerV2ApiPostError429,
  RelayerV2ResponseFailed,
} from './types';
import { assertIsRelayerV2ApiError400NoDetails } from './RelayerV2ApiError400NoDetails';
import { assertIsRelayerV2ApiError400WithDetails } from './RelayerV2ApiError400WithDetails';
import { assertIsRelayerV2ApiPostError429 } from './RelayerV2ApiPostError429';
import { assertIsRelayerV2ApiError500 } from './RelayerV2ApiError500';
import { InvalidPropertyError } from '../../../errors/InvalidPropertyError';

export function assertIsRelayerV2ResponseFailed(
  value: unknown,
  name: string,
): asserts value is RelayerV2ResponseFailed {
  assertRecordStringProperty(value, 'status', name, 'failed');
  assertNonNullableRecordProperty(value, 'error', name);
  assertIsRelayerV2ApiError(value.error, `${name}.error`);
}

export function assertIsRelayerV2ApiError(
  value: unknown,
  name: string,
): asserts value is RelayerV2ApiError {
  assertRecordStringProperty(value, 'label', name);
  if (
    value.label === 'malformed_json' ||
    value.label === 'request_error' ||
    value.label === 'not_ready_for_decryption'
  ) {
    assertIsRelayerV2ApiError400NoDetails(value, name);
  } else if (
    value.label === 'missing_fields' ||
    value.label === 'validation_failed'
  ) {
    assertIsRelayerV2ApiError400WithDetails(value, name);
  } else if (value.label === 'rate_limited') {
    assertIsRelayerV2ApiPostError429(value, name);
  } else if (value.label === 'internal_server_error') {
    assertIsRelayerV2ApiError500(value, name);
  } else {
    throw new InvalidPropertyError({
      objName: name,
      property: 'label',
      expectedType: 'string',
      expectedValue: [
        'malformed_json',
        'request_error',
        'not_ready_for_decryption',
        'missing_fields',
        'validation_failed',
        'rate_limited',
        'internal_server_error',
      ],
      type: typeof value.label,
      value: value.label,
    });
  }
}

export function assertIsRelayerV2ResponseFailedWithPostError429(
  value: unknown,
  name: string,
): asserts value is {
  status: 'failed';
  error: RelayerV2ApiPostError429;
} {
  assertIsRelayerV2ResponseFailed(value, name);
  assertIsRelayerV2ApiPostError429(value.error, `${name}.error`);
}

export function assertIsRelayerV2ResponseFailedWithError400(
  value: unknown,
  name: string,
): asserts value is {
  status: 'failed';
  error: RelayerV2ApiError400;
} {
  assertIsRelayerV2ResponseFailed(value, name);
  if (
    value.error.label === 'malformed_json' ||
    value.error.label === 'request_error' ||
    value.error.label === 'not_ready_for_decryption'
  ) {
    assertIsRelayerV2ApiError400NoDetails(value.error, `${name}.error`);
  } else if (
    value.error.label === 'missing_fields' ||
    value.error.label === 'validation_failed'
  ) {
    assertIsRelayerV2ApiError400WithDetails(value.error, `${name}.error`);
  } else {
    throw new InvalidPropertyError({
      objName: `${name}.error`,
      property: 'label',
      expectedType: 'string',
      expectedValue: [
        'malformed_json',
        'request_error',
        'not_ready_for_decryption',
        'missing_fields',
        'validation_failed',
      ],
      type: typeof value.error.label,
      value: value.error.label,
    });
  }
}

export function assertIsRelayerV2ResponseFailedWithError500(
  value: unknown,
  name: string,
): asserts value is {
  status: 'failed';
  error: RelayerV2ApiError500;
} {
  assertIsRelayerV2ResponseFailed(value, name);
  assertIsRelayerV2ApiError500(value.error, `${name}.error`);
}
