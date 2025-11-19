import {
  isAddress as ethersIsAddress,
  getAddress as ethersGetAddress,
} from 'ethers';

export type ChecksummedAddress = `0x${string}`;

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

export function ensure0x(s: string): `0x${string}` {
  return !s.startsWith('0x') ? `0x${s}` : (s as `0x${string}`);
}

export function isChecksummedAddress(
  value: unknown,
): value is ChecksummedAddress {
  if (typeof value !== 'string') {
    return false;
  }
  const a = ethersGetAddress(value);
  return a === value;
}

export function assertIsChecksummedAddress(
  value: unknown,
): asserts value is ChecksummedAddress {
  if (!isChecksummedAddress(value)) {
    throw new TypeError('Invalid Checksummed Address');
  }
}

export function isAddress(value: unknown): value is `0x${string}` {
  return ethersIsAddress(value);
}

export function assertIsAddress(
  value: unknown,
): asserts value is `0x${string}` {
  if (!isAddress(value)) {
    throw new TypeError('Invalid Address');
  }
}

export function isBytesHex(value: unknown): value is `0x${string}` {
  if (typeof value !== 'string') {
    return false;
  }
  if (!value.startsWith('0x')) {
    return false;
  }
  const hexRegex = /^0x[a-fA-F0-9]*$/;
  if (!hexRegex.test(value)) {
    return false;
  }
  if ((value.length - 2) % 2 !== 0) {
    return false;
  }
  return true;
}

export function isBytes32Hex(value: unknown): value is `0x${string}` {
  if (!isBytesHex(value)) {
    return false;
  }
  if (value.length !== 66) {
    throw new RangeError('Invalid Bytes32Hex');
  }
  return true;
}

export function assertIsBytesHex(
  value: unknown,
): asserts value is `0x${string}` {
  if (!isBytesHex(value)) {
    throw new RangeError('Invalid BytesHex');
  }
}

export function assertIsBytes32Hex(
  value: unknown,
): asserts value is `0x${string}` {
  if (!isBytes32Hex(value)) {
    throw new RangeError('Invalid Bytes32Hex');
  }
}
