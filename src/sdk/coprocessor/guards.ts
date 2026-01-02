import type { CoprocessorEIP712DomainType } from './types';
import { assertRecordChecksummedAddressProperty } from '@base/address';
import { assertRecordUint256Property } from '@base/uint';
import { assertRecordStringProperty } from '@base/string';

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
  assertRecordUint256Property(value, 'chainId' satisfies keyof T, name);
  assertRecordChecksummedAddressProperty(
    value,
    'verifyingContract' satisfies keyof T,
    name,
  );
}
