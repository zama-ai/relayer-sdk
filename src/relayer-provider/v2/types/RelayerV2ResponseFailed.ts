import { assertNonNullableRecordProperty } from '../../../utils/record';
import { assertRecordStringProperty } from '../../../utils/string';
import {
  RelayerV2ApiError,
  RelayerV2ApiError500,
  RelayerV2ApiPostError400,
  RelayerV2ApiPostError429,
  RelayerV2ResponseFailed,
} from './types';
import { assertIsRelayerV2ApiPostError400NoDetails } from './RelayerV2ApiPostError400NoDetails';
import { assertIsRelayerV2ApiPostError400WithDetails } from './RelayerV2ApiPostError400WithDetails';
import { assertIsRelayerV2ApiPostError429 } from './RelayerV2ApiPostError429';
import { assertIsRelayerV2ApiError500 } from './RelayerV2ApiError500';

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
  assertRecordStringProperty(value, 'code', name);
  if (
    value.code === 'malformed_json' ||
    value.code === 'request_error' ||
    value.code === 'not_ready_for_decryption'
  ) {
    assertIsRelayerV2ApiPostError400NoDetails(value, name);
  } else if (
    value.code === 'missing_fields' ||
    value.code === 'validation_failed'
  ) {
    assertIsRelayerV2ApiPostError400WithDetails(value, name);
  } else if (value.code === 'rate_limited') {
    assertIsRelayerV2ApiPostError429(value, name);
  } else if (value.code === 'internal_server_error') {
    assertIsRelayerV2ApiError500(value, name);
  } else {
    throw new Error(`Invalid ${name}.error.code='${value.code}'.`);
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

export function assertIsRelayerV2ResponseFailedWithPostError400(
  value: unknown,
  name: string,
): asserts value is {
  status: 'failed';
  error: RelayerV2ApiPostError400;
} {
  assertIsRelayerV2ResponseFailed(value, name);
  if (
    value.error.label === 'malformed_json' ||
    value.error.label === 'request_error' ||
    value.error.label === 'not_ready_for_decryption'
  ) {
    assertIsRelayerV2ApiPostError400NoDetails(value.error, `${name}.error`);
  } else if (
    value.error.label === 'missing_fields' ||
    value.error.label === 'validation_failed'
  ) {
    assertIsRelayerV2ApiPostError400WithDetails(value.error, `${name}.error`);
  } else {
    throw new Error(`Invalid ${name}.error.code='${value.error.label}'.`);
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
