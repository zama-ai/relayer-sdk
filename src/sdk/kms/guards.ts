import { assertRecordStringProperty } from '../../utils/string';
import { assertRecordChecksummedAddressProperty } from '../../utils/address';
import { KmsEIP712DomainType } from './types';
import { assertRecordUint256Property } from '../../utils/uint';

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
  assertRecordUint256Property(value, 'chainId' satisfies keyof T, name);
  assertRecordChecksummedAddressProperty(
    value,
    'verifyingContract' satisfies keyof T,
    name,
  );
}
