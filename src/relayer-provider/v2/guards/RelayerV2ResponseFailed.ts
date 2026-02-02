import type {
  RelayerApiError400NoDetailsType,
  RelayerApiError400Type,
  RelayerApiError400WithDetailsType,
  RelayerApiError404Type,
  RelayerApiError429Type,
  RelayerApiError503Type,
} from '../../types/public-api';
import type {
  RelayerApiErrorType,
  RelayerApiError500Type,
} from '../../types/public-api';
import type { RelayerV2ResponseFailed } from '../types';
import { InvalidPropertyError } from '../../../errors/InvalidPropertyError';
import { assertRecordNonNullableProperty } from '@base/record';
import { assertRecordStringProperty } from '@base/string';
import { assertIsRelayerApiError400NoDetailsType } from '../../errors/RelayerApiError400NoDetails';
import { assertIsRelayerApiError400WithDetailsType } from '../../errors/RelayerApiError400WithDetails';
import { assertIsRelayerApiError429Type } from '../../errors/RelayerApiError429';
import { assertIsRelayerApiError500Type } from '../../errors/RelayerApiError500';
import { assertIsRelayerApiError404Type } from '../../errors/RelayerApiError404';
import { assertIsRelayerApiError503Type } from '../../errors/RelayerApiError503';

////////////////////////////////////////////////////////////////////////////////

export function assertIsRelayerV2ResponseFailed(
  value: unknown,
  name: string,
): asserts value is RelayerV2ResponseFailed {
  type T = RelayerV2ResponseFailed;
  assertRecordStringProperty(
    value,
    'status' satisfies keyof T,
    name,
    'failed' satisfies T['status'],
  );
  assertRecordNonNullableProperty(value, 'error' satisfies keyof T, name);
  assertIsRelayerV2ApiError(value.error, `${name}.error`);
}

////////////////////////////////////////////////////////////////////////////////

export function assertIsRelayerV2ApiError(
  value: unknown,
  name: string,
): asserts value is RelayerApiErrorType {
  assertRecordStringProperty(value, 'label', name);
  // 400
  if (
    value.label ===
      ('malformed_json' satisfies RelayerApiError400NoDetailsType['label']) ||
    value.label ===
      ('request_error' satisfies RelayerApiError400NoDetailsType['label']) ||
    value.label ===
      ('not_ready_for_decryption' satisfies RelayerApiError400NoDetailsType['label'])
  ) {
    assertIsRelayerApiError400NoDetailsType(value, name);
  }
  // 400 (with details)
  else if (
    value.label ===
      ('missing_fields' satisfies RelayerApiError400WithDetailsType['label']) ||
    value.label ===
      ('validation_failed' satisfies RelayerApiError400WithDetailsType['label'])
  ) {
    assertIsRelayerApiError400WithDetailsType(value, name);
  }
  // 404
  else if (
    value.label === ('not_found' satisfies RelayerApiError404Type['label'])
  ) {
    assertIsRelayerApiError404Type(value, name);
  }
  // 429
  else if (
    value.label ===
      ('rate_limited' satisfies RelayerApiError429Type['label']) ||
    value.label ===
      ('protocol_overload' satisfies RelayerApiError429Type['label'])
  ) {
    assertIsRelayerApiError429Type(value, name);
  }
  // 500
  else if (
    value.label ===
    ('internal_server_error' satisfies RelayerApiError500Type['label'])
  ) {
    assertIsRelayerApiError500Type(value, name);
  }
  // 503
  else if (
    value.label ===
      ('readiness_check_timed_out' satisfies RelayerApiError503Type['label']) ||
    value.label ===
      ('response_timed_out' satisfies RelayerApiError503Type['label']) ||
    value.label ===
      ('protocol_paused' satisfies RelayerApiError503Type['label']) ||
    value.label ===
      ('gateway_not_reachable' satisfies RelayerApiError503Type['label'])
  ) {
    assertIsRelayerApiError503Type(value, name);
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
        'protocol_overload',
        'gateway_not_reachable',
        'readiness_check_timed_out',
        'response_timed_out',
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
  error: RelayerApiError400Type;
} {
  assertIsRelayerV2ResponseFailed(value, name);
  if (
    value.error.label ===
      ('malformed_json' satisfies RelayerApiError400NoDetailsType['label']) ||
    value.error.label ===
      ('request_error' satisfies RelayerApiError400NoDetailsType['label']) ||
    value.error.label ===
      ('not_ready_for_decryption' satisfies RelayerApiError400NoDetailsType['label'])
  ) {
    assertIsRelayerApiError400NoDetailsType(value.error, `${name}.error`);
  } else if (
    value.error.label ===
      ('missing_fields' satisfies RelayerApiError400WithDetailsType['label']) ||
    value.error.label ===
      ('validation_failed' satisfies RelayerApiError400WithDetailsType['label'])
  ) {
    assertIsRelayerApiError400WithDetailsType(value.error, `${name}.error`);
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
  error: RelayerApiError404Type;
} {
  assertIsRelayerV2ResponseFailed(value, name);
  assertIsRelayerApiError404Type(value.error, `${name}.error`);
}

////////////////////////////////////////////////////////////////////////////////
// 429
////////////////////////////////////////////////////////////////////////////////

export function assertIsRelayerV2ResponseFailedWithError429(
  value: unknown,
  name: string,
): asserts value is {
  status: 'failed';
  error: RelayerApiError429Type;
} {
  assertIsRelayerV2ResponseFailed(value, name);
  assertIsRelayerApiError429Type(value.error, `${name}.error`);
}

////////////////////////////////////////////////////////////////////////////////
// 500
////////////////////////////////////////////////////////////////////////////////

export function assertIsRelayerV2ResponseFailedWithError500(
  value: unknown,
  name: string,
): asserts value is {
  status: 'failed';
  error: RelayerApiError500Type;
} {
  assertIsRelayerV2ResponseFailed(value, name);
  assertIsRelayerApiError500Type(value.error, `${name}.error`);
}

////////////////////////////////////////////////////////////////////////////////
// 503
////////////////////////////////////////////////////////////////////////////////

export function assertIsRelayerV2ResponseFailedWithError503(
  value: unknown,
  name: string,
): asserts value is {
  status: 'failed';
  error: RelayerApiError503Type;
} {
  assertIsRelayerV2ResponseFailed(value, name);
  assertIsRelayerApiError503Type(value.error, `${name}.error`);
}
