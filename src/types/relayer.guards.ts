import type {
  FhevmPkeCrsByCapacityType,
  FhevmPkeCrsType,
  FhevmPublicKeyType,
} from './relayer';
import { assertRecordUint8ArrayProperty } from '@base/bytes';
import { assertRecordStringProperty } from '@base/string';
import { assertRecordNonNullableProperty } from '@base/record';

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
