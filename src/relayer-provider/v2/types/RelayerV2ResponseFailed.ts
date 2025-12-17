import { assertNonNullableRecordProperty } from '../../../utils/record';
import { assertRecordStringProperty } from '../../../utils/string';
import {
  RelayerV2ResponseApiErrorCode,
  RelayerV2ResponseApiError500,
  RelayerV2ResponseApiError400,
  RelayerV2ResponseApiError429,
  RelayerV2ResponseFailed,
  RelayerV2ResponseApiError404,
  RelayerV2ResponseApiError503,
  RelayerV2ResponseApiError504,
} from './types';
import { assertIsRelayerV2ApiError400NoDetails } from './errors/RelayerV2ApiError400NoDetails';
import { assertIsRelayerV2ApiError400WithDetails } from './errors/RelayerV2ApiError400WithDetails';
import { assertIsRelayerV2ApiError429 } from './errors/RelayerV2ApiError429';
import { assertIsRelayerV2ApiError500 } from './errors/RelayerV2ApiError500';
import { InvalidPropertyError } from '../../../errors/InvalidPropertyError';
import { assertIsRelayerV2ApiError404 } from './errors/RelayerV2ApiError404';
import { assertIsRelayerV2ApiError503 } from './errors/RelayerV2ApiError503';
import { assertIsRelayerV2ApiError504 } from './errors/RelayerV2ApiError504';

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
): asserts value is RelayerV2ResponseApiErrorCode {
  assertRecordStringProperty(value, 'label', name);
  // 400
  if (
    value.label === 'malformed_json' ||
    value.label === 'request_error' ||
    value.label === 'not_ready_for_decryption'
  ) {
    assertIsRelayerV2ApiError400NoDetails(value, name);
  }
  // 400 (with details)
  else if (
    value.label === 'missing_fields' ||
    value.label === 'validation_failed'
  ) {
    assertIsRelayerV2ApiError400WithDetails(value, name);
  }
  // 404
  else if (value.label === 'not_found') {
    assertIsRelayerV2ApiError404(value, name);
  }
  // 429
  else if (value.label === 'rate_limited') {
    assertIsRelayerV2ApiError429(value, name);
  }
  // 500
  else if (value.label === 'internal_server_error') {
    assertIsRelayerV2ApiError500(value, name);
  }
  // 503
  else if (
    value.label === 'protocol_paused' ||
    value.label === 'gateway_not_reachable'
  ) {
    assertIsRelayerV2ApiError503(value, name);
  }
  // 504
  else if (
    value.label === 'readiness_check_timedout' ||
    value.label === 'response_timedout'
  ) {
    assertIsRelayerV2ApiError504(value, name);
  }
  // Unsupported
  else {
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
        'protocol_paused',
        'gateway_not_reachable',
        'readiness_check_timedout',
        'response_timedout',
      ],
      type: typeof value.label,
      value: value.label,
    });
  }
}

////////////////////////////////////////////////////////////////////////////////
// 400
////////////////////////////////////////////////////////////////////////////////

export function assertIsRelayerV2ResponseFailedWithError400(
  value: unknown,
  name: string,
): asserts value is {
  status: 'failed';
  error: RelayerV2ResponseApiError400;
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

////////////////////////////////////////////////////////////////////////////////
// 404
////////////////////////////////////////////////////////////////////////////////

export function assertIsRelayerV2ResponseFailedWithError404(
  value: unknown,
  name: string,
): asserts value is {
  status: 'failed';
  error: RelayerV2ResponseApiError404;
} {
  assertIsRelayerV2ResponseFailed(value, name);
  assertIsRelayerV2ApiError404(value.error, `${name}.error`);
}

////////////////////////////////////////////////////////////////////////////////
// 429
////////////////////////////////////////////////////////////////////////////////

export function assertIsRelayerV2ResponseFailedWithError429(
  value: unknown,
  name: string,
): asserts value is {
  status: 'failed';
  error: RelayerV2ResponseApiError429;
} {
  assertIsRelayerV2ResponseFailed(value, name);
  assertIsRelayerV2ApiError429(value.error, `${name}.error`);
}

////////////////////////////////////////////////////////////////////////////////
// 500
////////////////////////////////////////////////////////////////////////////////

export function assertIsRelayerV2ResponseFailedWithError500(
  value: unknown,
  name: string,
): asserts value is {
  status: 'failed';
  error: RelayerV2ResponseApiError500;
} {
  assertIsRelayerV2ResponseFailed(value, name);
  assertIsRelayerV2ApiError500(value.error, `${name}.error`);
}

////////////////////////////////////////////////////////////////////////////////
// 503
////////////////////////////////////////////////////////////////////////////////

export function assertIsRelayerV2ResponseFailedWithError503(
  value: unknown,
  name: string,
): asserts value is {
  status: 'failed';
  error: RelayerV2ResponseApiError503;
} {
  assertIsRelayerV2ResponseFailed(value, name);
  assertIsRelayerV2ApiError503(value.error, `${name}.error`);
}

////////////////////////////////////////////////////////////////////////////////
// 504
////////////////////////////////////////////////////////////////////////////////

export function assertIsRelayerV2ResponseFailedWithError504(
  value: unknown,
  name: string,
): asserts value is {
  status: 'failed';
  error: RelayerV2ResponseApiError504;
} {
  assertIsRelayerV2ResponseFailed(value, name);
  assertIsRelayerV2ApiError504(value.error, `${name}.error`);
}
