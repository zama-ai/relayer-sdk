import type {
  TFHEPkeCrsUrlType,
  TFHEPksCrsBytesType,
  TFHEPublicKeyBytesType,
  TFHEPublicKeyUrlType,
} from '@sdk/lowlevel/types';
import type {
  FhevmPkeCrsByCapacityType,
  FhevmPkeCrsType,
  FhevmPublicKeyType,
} from './relayer';
import { assertRecordUintProperty } from '@base/uint';
import { assertRecordUint8ArrayProperty } from '@base/bytes';
import { assertRecordStringProperty } from '@base/string';
import {
  assertRecordNonNullableProperty,
  isRecordNonNullableProperty,
} from '@base/record';

////////////////////////////////////////////////////////////////////////////////
// FhevmPublicKeyType
////////////////////////////////////////////////////////////////////////////////

export function isFhevmPublicKeyType(
  value: unknown,
): value is FhevmPublicKeyType {
  try {
    assertIsFhevmPublicKeyType(value, '');
    return true;
  } catch {
    return false;
  }
}

export function assertIsFhevmPublicKeyType(
  value: unknown,
  name: string,
): asserts value is FhevmPublicKeyType {
  assertRecordStringProperty(
    value,
    'id' satisfies keyof FhevmPublicKeyType,
    name,
  );
  assertRecordUint8ArrayProperty(
    value,
    'data' satisfies keyof FhevmPublicKeyType,
    name,
  );
}

////////////////////////////////////////////////////////////////////////////////
// FhevmPkeCrsByCapacityType
////////////////////////////////////////////////////////////////////////////////

export function assertIsFhevmPkeCrsByCapacityType(
  value: unknown,
  name: string,
): asserts value is FhevmPkeCrsByCapacityType {
  assertRecordNonNullableProperty(
    value,
    (2048 satisfies keyof FhevmPkeCrsByCapacityType).toString(),
    name,
  );
  assertIsFhevmPkeCrsType(value['2048'], `${name}.2048`);
}

export function isFhevmPkeCrsByCapacityType(
  value: unknown,
): value is FhevmPkeCrsByCapacityType {
  try {
    assertIsFhevmPkeCrsByCapacityType(value, '');
    return true;
  } catch {
    return false;
  }
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
// FhevmPkeCrsType
////////////////////////////////////////////////////////////////////////////////

export function assertIsFhevmPkeCrsType(
  value: unknown,
  name: string,
): asserts value is FhevmPkeCrsType {
  assertRecordStringProperty(
    value,
    'publicParamsId' satisfies keyof FhevmPkeCrsType,
    name,
  );
  assertRecordUint8ArrayProperty(
    value,
    'publicParams' satisfies keyof FhevmPkeCrsType,
    name,
  );
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
