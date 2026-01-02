import type {
  TFHEPkeCrsUrlType,
  TFHEPksCrsBytesType,
  TFHEPublicKeyBytesType,
  TFHEPublicKeyUrlType,
} from './types';
import { assertRecordUint8ArrayProperty } from '@base/bytes';
import { assertRecordStringProperty } from '@base/string';
import { assertRecordUintProperty } from '@base/uint';
import { isRecordNonNullableProperty } from '@base/record';

////////////////////////////////////////////////////////////////////////////////
// TFHEPkeCrsUrlType
////////////////////////////////////////////////////////////////////////////////

export function assertIsTFHEPkeCrsUrlType(
  value: unknown,
  name: string,
): asserts value is TFHEPkeCrsUrlType {
  assertRecordStringProperty(
    value,
    'id' satisfies keyof TFHEPkeCrsUrlType,
    name,
  );
  assertRecordUintProperty(
    value,
    'capacity' satisfies keyof TFHEPkeCrsUrlType,
    name,
  );
  assertRecordStringProperty(
    value,
    'srcUrl' satisfies keyof TFHEPkeCrsUrlType,
    name,
  );
}

////////////////////////////////////////////////////////////////////////////////
// TFHEPksCrsBytesType
////////////////////////////////////////////////////////////////////////////////

export function assertIsTFHEPksCrsBytesType(
  value: unknown,
  name: string,
): asserts value is TFHEPksCrsBytesType {
  assertRecordStringProperty(
    value,
    'id' satisfies keyof TFHEPksCrsBytesType,
    name,
  );
  assertRecordUint8ArrayProperty(
    value,
    'bytes' satisfies keyof TFHEPksCrsBytesType,
    name,
  );
  assertRecordUintProperty(
    value,
    'capacity' satisfies keyof TFHEPksCrsBytesType,
    name,
  );
  if (
    isRecordNonNullableProperty(
      value,
      'srcUrl' satisfies keyof TFHEPksCrsBytesType,
    )
  ) {
    assertRecordStringProperty(
      value,
      'srcUrl' satisfies keyof TFHEPksCrsBytesType,
      name,
    );
  }
}

////////////////////////////////////////////////////////////////////////////////
// TFHEPublicKeyBytesType
////////////////////////////////////////////////////////////////////////////////

export function assertIsTFHEPublicKeyBytesType(
  value: unknown,
  name: string,
): asserts value is TFHEPublicKeyBytesType {
  assertRecordStringProperty(
    value,
    'id' satisfies keyof TFHEPublicKeyBytesType,
    name,
  );
  assertRecordUint8ArrayProperty(
    value,
    'bytes' satisfies keyof TFHEPublicKeyBytesType,
    name,
  );
  if (
    isRecordNonNullableProperty(
      value,
      'srcUrl' satisfies keyof TFHEPublicKeyBytesType,
    )
  ) {
    assertRecordStringProperty(
      value,
      'srcUrl' satisfies keyof TFHEPublicKeyBytesType,
      name,
    );
  }
}

////////////////////////////////////////////////////////////////////////////////
// TFHEPublicKeyUrlType
////////////////////////////////////////////////////////////////////////////////

export function assertIsTFHEPublicKeyUrlType(
  value: unknown,
  name: string,
): asserts value is TFHEPublicKeyUrlType {
  assertRecordStringProperty(
    value,
    'id' satisfies keyof TFHEPublicKeyUrlType,
    name,
  );
  assertRecordStringProperty(
    value,
    'srcUrl' satisfies keyof TFHEPublicKeyUrlType,
    name,
  );
}
