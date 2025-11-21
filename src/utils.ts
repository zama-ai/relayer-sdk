import { isBytesHex } from './utils/bytes';

export const SERIALIZED_SIZE_LIMIT_CIPHERTEXT = BigInt(1024 * 1024 * 512);
export const SERIALIZED_SIZE_LIMIT_PK = BigInt(1024 * 1024 * 512);
export const SERIALIZED_SIZE_LIMIT_CRS = BigInt(1024 * 1024 * 512);

export const cleanURL = (url: string | undefined) => {
  if (!url) return '';
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

export const numberToHex = (num: number) => {
  let hex = num.toString(16);
  return hex.length % 2 ? '0' + hex : hex;
};

export const fromHexString = (hexString: string): Uint8Array => {
  const arr = hexString.replace(/^(0x)/, '').match(/.{1,2}/g);
  if (!arr) return new Uint8Array();
  return Uint8Array.from(arr.map((byte) => parseInt(byte, 16)));
};

export function toHexString(bytes: Uint8Array, with0x: true): `0x${string}`;
export function toHexString(bytes: Uint8Array, with0x?: false): string;
export function toHexString(bytes: Uint8Array, with0x = false): string {
  return `${with0x ? '0x' : ''}${bytes.reduce(
    (str, byte) => str + byte.toString(16).padStart(2, '0'),
    '',
  )}`;
}

export const bytesToHex = function (byteArray: Uint8Array): `0x${string}` {
  if (!byteArray || byteArray?.length === 0) {
    return '0x0';
  }
  const buffer = Buffer.from(byteArray);
  return `0x${buffer.toString('hex')}`;
};

export const bytesToBigInt = function (byteArray: Uint8Array): bigint {
  if (!byteArray || byteArray?.length === 0) {
    return BigInt(0);
  }
  const hex = Array.from(byteArray)
    .map((b) => b.toString(16).padStart(2, '0')) // byte to hex
    .join('');

  return BigInt(`0x${hex}`);
};

type ObjectWithObjectProperty<K extends string> = Record<string, unknown> & {
  [P in K]: Record<string, unknown>;
};

type ObjectWithProperty<K extends string, T> = Record<string, unknown> & {
  [P in K]: T;
};

export function assertStringProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is ObjectWithProperty<K, string> {
  if (
    !o ||
    typeof o !== 'object' ||
    !(property in o) ||
    !(o as Record<string, unknown>)[property] ||
    typeof (o as Record<string, unknown>)[property] !== 'string'
  ) {
    throw new Error(`Invalid ${objName}.${property}`);
  }
}

export function assertObjectProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is ObjectWithObjectProperty<K> {
  if (
    !o ||
    typeof o !== 'object' ||
    !(property in o) ||
    !(o as Record<string, unknown>)[property] ||
    typeof (o as Record<string, unknown>)[property] !== 'object'
  ) {
    throw new Error(`Invalid ${objName}.${property}`);
  }
}

type ObjectWithArrayProperty<K extends string> = Record<string, unknown> & {
  [P in K]: Array<unknown>;
};

export function assertArrayProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is ObjectWithArrayProperty<K> {
  if (
    !o ||
    typeof o !== 'object' ||
    !(property in o) ||
    !(o as Record<string, unknown>)[property] ||
    !Array.isArray((o as Record<string, unknown>)[property])
  ) {
    throw new Error(`Invalid array ${objName}.${property}`);
  }
}

export function assertBytesHexArrayProperty<K extends string>(
  o: unknown,
  property: K,
  objName: string,
): asserts o is ObjectWithProperty<K, `0x${string}`[]> {
  assertArrayProperty(o, property, objName);
  const arr = o[property];
  for (let i = 0; i < arr.length; ++i) {
    if (!isBytesHex(arr[i])) {
      throw new Error(`Invalid ${objName}.${property}[${i}]`);
    }
  }
}
