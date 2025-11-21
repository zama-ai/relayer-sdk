import { assertNonNullableRecordProperty } from '../../../utils/record';
import { assertRecordStringProperty } from '../../../utils/string';
import { RelayerV2ApiError, RelayerV2ResponseFailed } from './types';
import { assertIsRelayerV2ApiError400 } from './RelayerV2ApiError400';
import { assertIsRelayerV2ApiError400WithDetails } from './RelayerV2ApiError400WithDetails';
import { assertIsRelayerV2ApiPostError429 } from './RelayerV2ApiErrorPost429';
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
    assertIsRelayerV2ApiError400(value, name);
  } else if (
    value.code === 'missing_fields' ||
    value.code === 'validation_failed'
  ) {
    assertIsRelayerV2ApiError400WithDetails(value, name);
  } else if (value.code === 'rate_limited') {
    assertIsRelayerV2ApiPostError429(value, name);
  } else if (value.code === 'internal_server_error') {
    assertIsRelayerV2ApiError500(value, name);
  } else {
    throw new Error(`Invalid ${name}.error.code='${value.code}'.`);
  }
}
