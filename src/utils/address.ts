import {
  isAddress as ethersIsAddress,
  getAddress as ethersGetAddress,
} from 'ethers';
import {
  assertNonNullableRecordProperty,
  assertRecordArrayProperty,
} from './record';

export type ChecksummedAddress = `0x${string}`;

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
    throw new TypeError('Invalid Checksummed Address');
  }
}

export function isAddress(value: unknown): value is `0x${string}` {
  if (!ethersIsAddress(value)) {
    return false;
  }
  if (!value.startsWith('0x')) {
    return false;
  }
  if (value.length !== 42) {
    return false;
  }
  return true;
}

export function assertIsAddress(
  value: unknown,
): asserts value is `0x${string}` {
  if (!isAddress(value)) {
    throw new TypeError('Invalid Address');
  }
}

type ObjectWithProperty<K extends string, T> = Record<string, unknown> & {
  [P in K]: T;
};

export function assertChecksummedAddressProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is ObjectWithProperty<K, ChecksummedAddress> {
  assertNonNullableRecordProperty(o, property, objName);
  if (!isChecksummedAddress(o[property])) {
    throw new Error(`Invalid checksummed address ${objName}.${property}`);
  }
}

export function assertChecksummedAddressArrayProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is ObjectWithProperty<K, Array<ChecksummedAddress>> {
  assertRecordArrayProperty(o, property, objName);
  const arr = o[property];
  for (let i = 0; i < arr.length; ++i) {
    if (!isChecksummedAddress(arr[i])) {
      throw new Error(
        `Invalid checksummed address ${objName}.${property}[${i}]`,
      );
    }
  }
}
