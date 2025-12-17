import {
  isAddress as ethersIsAddress,
  getAddress as ethersGetAddress,
} from 'ethers';
import {
  assertRecordArrayProperty,
  isNonNullableRecordProperty,
  typeofProperty,
} from './record';
import { ChecksummedAddressError } from '../errors/ChecksummedAddressError';
import { AddressError } from '../errors/AddressError';
import { InvalidPropertyError } from '../errors/InvalidPropertyError';
import { InvalidTypeError } from '../errors/InvalidTypeError';
import type { ChecksummedAddress } from '../types/primitives';
import { remove0x } from './string';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export function isChecksummedAddress(
  value: unknown,
): value is ChecksummedAddress {
  if (typeof value !== 'string') {
    return false;
  }
  if (!value.startsWith('0x')) {
    return false;
  }
  if (value.length !== 42) {
    return false;
  }
  try {
    const a = ethersGetAddress(value);
    return a === value;
  } catch (e) {
    return false;
  }
}

export function assertIsChecksummedAddress(
  value: unknown,
): asserts value is ChecksummedAddress {
  if (!isChecksummedAddress(value)) {
    throw new ChecksummedAddressError({ address: String(value) });
  }
}

export function assertIsChecksummedAddressArray(
  value: unknown,
): asserts value is ChecksummedAddress[] {
  if (!Array.isArray(value)) {
    throw new InvalidTypeError({
      type: typeof value,
      expectedType: 'ChecksummedAddressArray',
    });
  }
  for (let i = 0; i < value.length; ++i) {
    if (!isChecksummedAddress(value[i])) {
      throw new ChecksummedAddressError({ address: String(value) });
    }
  }
}

export function isAddress(value: unknown): value is `0x${string}` {
  if (typeof value !== 'string') {
    return false;
  }
  if (!value.startsWith('0x')) {
    return false;
  }
  if (value.length !== 42) {
    return false;
  }
  if (!ethersIsAddress(value)) {
    return false;
  }
  return true;
}

export function assertIsAddress(
  value: unknown,
): asserts value is `0x${string}` {
  if (!isAddress(value)) {
    throw new AddressError({ address: String(value) });
  }
}

type RecordWithProperty<K extends string, T> = Record<string, unknown> & {
  [P in K]: T;
};

export function isRecordChecksummedAddressProperty<K extends string>(
  o: unknown,
  property: K,
): o is RecordWithProperty<K, ChecksummedAddress> {
  if (!isNonNullableRecordProperty(o, property)) {
    return false;
  }
  return isChecksummedAddress(o[property]);
}

export function assertRecordChecksummedAddressProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is RecordWithProperty<K, ChecksummedAddress> {
  if (!isRecordChecksummedAddressProperty(o, property)) {
    throw new InvalidPropertyError({
      objName,
      property,
      expectedType: 'ChecksummedAddress',
      type: typeofProperty(o, property),
    });
  }
}

export function assertRecordChecksummedAddressArrayProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is RecordWithProperty<K, Array<ChecksummedAddress>> {
  assertRecordArrayProperty(o, property, objName);
  const arr = o[property];
  for (let i = 0; i < arr.length; ++i) {
    if (!isChecksummedAddress(arr[i])) {
      throw new InvalidPropertyError({
        objName,
        property: `${property}[${i}]`,
        expectedType: 'ChecksummedAddress',
        type: typeof arr[i],
      });
    }
  }
}

export function checksummedAddressToBytes20(
  address: ChecksummedAddress,
): Uint8Array {
  if (!isAddress(address)) {
    throw new InvalidTypeError({ expectedType: 'ChecksummedAddress' });
  }

  const hex = remove0x(address);
  const bytes = new Uint8Array(20);
  for (let i = 0; i < 20; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
