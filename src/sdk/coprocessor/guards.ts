import type { CoprocessorEIP712DomainType } from './public-api';
import { assertRecordChecksummedAddressProperty } from '@base/address';
import { assertRecordStringProperty } from '@base/string';
import { assertRecordUintBigIntProperty } from '@base/uint';

export function assertCoprocessorEIP712DomainType(
  value: unknown,
  name: string,
): asserts value is CoprocessorEIP712DomainType {
  type T = CoprocessorEIP712DomainType;
  assertRecordStringProperty(
    value,
    'name' satisfies keyof T,
    name,
    'InputVerification' satisfies T['name'],
  );
  assertRecordStringProperty(
    value,
    'version' satisfies keyof T,
    name,
    '1' satisfies T['version'],
  );
  assertRecordUintBigIntProperty(value, 'chainId' satisfies keyof T, name);
  assertRecordChecksummedAddressProperty(
    value,
    'verifyingContract' satisfies keyof T,
    name,
  );
}
