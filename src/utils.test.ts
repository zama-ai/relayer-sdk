import { bytesToBigInt } from './utils/bytes';
import { bytesToHex, fromHexString } from './utils/bytes';

// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/utils.test.ts

describe('decrypt-utils', () => {
  it('converts a hex to bytes', async () => {
    const value = '0xff';
    const bytes1 = fromHexString(value);
    expect(bytes1).toEqual(new Uint8Array([255]));

    const bytes2 = fromHexString('0x');
    expect(bytes2).toEqual(new Uint8Array([]));
  });

  it('converts a bytes to hex', async () => {
    const bytes1 = bytesToHex(new Uint8Array([255]));
    expect(bytes1).toEqual('0xff');

    const bytes2 = bytesToHex(new Uint8Array());
    expect(bytes2).toEqual('0x');
  });

  it('converts bytes to number', async () => {
    const value = new Uint8Array([23, 200, 15]);
    const bigint1 = bytesToBigInt(value);
    expect(bigint1.toString()).toBe('1558543');

    const value2 = new Uint8Array([37, 6, 210, 166, 239]);
    const bigint2 = bytesToBigInt(value2);
    expect(bigint2.toString()).toBe('159028258543');

    const value0 = new Uint8Array();
    const bigint0 = bytesToBigInt(value0);
    expect(bigint0.toString()).toBe('0');
  });
});
