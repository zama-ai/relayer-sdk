import type { KmsEIP712DomainType } from './public-api';
import { assertRecordStringProperty } from '@base/string';
import { assertRecordChecksummedAddressProperty } from '@base/address';
import { assertRecordUintBigIntProperty } from '@base/uint';

export function assertKmsEIP712DomainType(
  value: unknown,
  name: string,
): asserts value is KmsEIP712DomainType {
  type T = KmsEIP712DomainType;
  assertRecordStringProperty(
    value,
    'name' satisfies keyof T,
    name,
    'Decryption' satisfies T['name'],
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
