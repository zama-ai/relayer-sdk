import { toBigIntBE, toBufferBE } from 'bigint-buffer';
import {
  FheBool,
  FheUint4,
  FheUint8,
  FheUint16,
  FheUint32,
  FheUint64,
  FheUint128,
  FheUint160,
  FheUint256,
  FheUint512,
  FheUint1024,
  FheUint2048,
  TfheClientKey,
} from 'node-tfhe';

export const SERIALIZED_SIZE_LIMIT_CIPHERTEXT = BigInt(1024 * 1024 * 512);
export const SERIALIZED_SIZE_LIMIT_PK = BigInt(1024 * 1024 * 512);
export const SERIALIZED_SIZE_LIMIT_CRS = BigInt(1024 * 1024 * 512);

export const cleanURL = (url: string | undefined) => {
  if (!url) return '';
  return new URL(url).href;
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

export const toHexString = (bytes: Uint8Array) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

export const bigIntToBytes64 = (value: bigint) => {
  return new Uint8Array(toBufferBE(value, 64));
};

export const bigIntToBytes128 = (value: bigint) => {
  return new Uint8Array(toBufferBE(value, 128));
};

export const bigIntToBytes256 = (value: bigint) => {
  return new Uint8Array(toBufferBE(value, 256));
};

export const bytesToHex = function (byteArray: Uint8Array): string {
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

  const buffer = Buffer.from(byteArray);
  const result = toBigIntBE(buffer);
  return result;
};

export const clientKeyDecryptor = (clientKeySer: Uint8Array) => {
  const clientKey = TfheClientKey.deserialize(clientKeySer);
  return {
    decryptBool: (ciphertext: string) =>
      FheBool.safe_deserialize(
        fromHexString(ciphertext),
        SERIALIZED_SIZE_LIMIT_CIPHERTEXT,
      ).decrypt(clientKey),
    decrypt4: (ciphertext: string) =>
      FheUint4.safe_deserialize(
        fromHexString(ciphertext),
        SERIALIZED_SIZE_LIMIT_CIPHERTEXT,
      ).decrypt(clientKey),
    decrypt8: (ciphertext: string) =>
      FheUint8.safe_deserialize(
        fromHexString(ciphertext),
        SERIALIZED_SIZE_LIMIT_CIPHERTEXT,
      ).decrypt(clientKey),
    decrypt16: (ciphertext: string) =>
      FheUint16.safe_deserialize(
        fromHexString(ciphertext),
        SERIALIZED_SIZE_LIMIT_CIPHERTEXT,
      ).decrypt(clientKey),
    decrypt32: (ciphertext: string) =>
      FheUint32.safe_deserialize(
        fromHexString(ciphertext),
        SERIALIZED_SIZE_LIMIT_CIPHERTEXT,
      ).decrypt(clientKey),
    decrypt64: (ciphertext: string) =>
      FheUint64.safe_deserialize(
        fromHexString(ciphertext),
        SERIALIZED_SIZE_LIMIT_CIPHERTEXT,
      ).decrypt(clientKey),
    decrypt128: (ciphertext: string) =>
      FheUint128.safe_deserialize(
        fromHexString(ciphertext),
        SERIALIZED_SIZE_LIMIT_CIPHERTEXT,
      ).decrypt(clientKey),
    decryptAddress: (ciphertext: string) => {
      let hex = FheUint160.safe_deserialize(
        fromHexString(ciphertext),
        SERIALIZED_SIZE_LIMIT_CIPHERTEXT,
      )
        .decrypt(clientKey)
        .toString(16);
      while (hex.length < 40) {
        hex = '0' + hex;
      }
      return '0x' + hex;
    },
    decrypt256: (ciphertext: string) =>
      FheUint256.safe_deserialize(
        fromHexString(ciphertext),
        SERIALIZED_SIZE_LIMIT_CIPHERTEXT,
      ).decrypt(clientKey),
    decryptEbytes64: (ciphertext: string) =>
      FheUint512.safe_deserialize(
        fromHexString(ciphertext),
        SERIALIZED_SIZE_LIMIT_CIPHERTEXT,
      ).decrypt(clientKey),
    decryptEbytes128: (ciphertext: string) =>
      FheUint1024.safe_deserialize(
        fromHexString(ciphertext),
        SERIALIZED_SIZE_LIMIT_CIPHERTEXT,
      ).decrypt(clientKey),
    decryptEbytes256: (ciphertext: string) =>
      FheUint2048.safe_deserialize(
        fromHexString(ciphertext),
        SERIALIZED_SIZE_LIMIT_CIPHERTEXT,
      ).decrypt(clientKey),
  };
};

export const getCiphertextCallParams = (handle: bigint) => {
  let hex = handle.toString(16);
  hex = hex.padStart(64, '0');
  return {
    to: '0x000000000000000000000000000000000000005d',
    data: '0xff627e77' + hex,
  };
};
