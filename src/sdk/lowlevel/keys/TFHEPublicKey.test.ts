import fetchMock from 'fetch-mock';
import {
  tfhePublicKeyBytes,
  tfhePublicKeyBytesWithSrcUrl,
} from '../../../test';
import { TEST_CONFIG } from '../../../test/config';
import { TFHEError } from '../../errors/TFHEError';
import {
  assertIsTFHEPublicKeyBytes,
  bytesToTFHEPublicKey,
  fetchTFHEPublicKey,
  jsonToTFHEPublicKey,
} from './TFHEPublicKey';
import { InvalidPropertyError } from '@base/errors/InvalidPropertyError';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/sdk/lowlevel/keys/TFHEPublicKey.test.ts
// npx jest --colors --passWithNoTests ./src/sdk/lowlevel/keys/TFHEPublicKey.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/sdk/lowlevel/keys/TFHEPublicKey.test.ts --collectCoverageFrom=./src/sdk/lowlevel/keys/TFHEPublicKey.ts
//
////////////////////////////////////////////////////////////////////////////////

const describeIfFetchMock =
  TEST_CONFIG.type === 'fetch-mock' ? describe : describe.skip;

////////////////////////////////////////////////////////////////////////////////
// Tests
////////////////////////////////////////////////////////////////////////////////

describe('TFHEPublicKey', () => {
  //////////////////////////////////////////////////////////////////////////////
  // assertIsTFHEPublicKeyBytesType
  //////////////////////////////////////////////////////////////////////////////

  describe('assertIsTFHEPublicKeyBytesType', () => {
    it('does not throw for valid TFHEPublicKeyBytesType', () => {
      expect(() =>
        assertIsTFHEPublicKeyBytes(tfhePublicKeyBytes, 'arg', {}),
      ).not.toThrow();
    });

    it('does not throw for valid TFHEPublicKeyBytesType with srcUrl', () => {
      expect(() =>
        assertIsTFHEPublicKeyBytes(tfhePublicKeyBytesWithSrcUrl, 'arg', {}),
      ).not.toThrow();
    });

    it('throws for null', () => {
      expect(() => assertIsTFHEPublicKeyBytes(null, 'arg', {})).toThrow();
    });

    it('throws for undefined', () => {
      expect(() => assertIsTFHEPublicKeyBytes(undefined, 'arg', {})).toThrow();
    });

    it('throws for missing id', () => {
      expect(() =>
        assertIsTFHEPublicKeyBytes(
          { bytes: tfhePublicKeyBytes.bytes },
          'arg',
          {},
        ),
      ).toThrow();
    });

    it('throws for missing bytes', () => {
      expect(() =>
        assertIsTFHEPublicKeyBytes({ id: tfhePublicKeyBytes.id }, 'arg', {}),
      ).toThrow();
    });

    it('throws for invalid id type', () => {
      expect(() =>
        assertIsTFHEPublicKeyBytes(
          { id: 123, bytes: tfhePublicKeyBytes.bytes },
          'arg',
          {},
        ),
      ).toThrow();
    });

    it('throws for invalid bytes type', () => {
      expect(() =>
        assertIsTFHEPublicKeyBytes(
          {
            id: tfhePublicKeyBytes.id,
            bytes: 'not-bytes',
          },
          'arg',
          {},
        ),
      ).toThrow();
    });

    it('throws for invalid srcUrl type', () => {
      expect(() =>
        assertIsTFHEPublicKeyBytes(
          {
            id: tfhePublicKeyBytes.id,
            bytes: tfhePublicKeyBytes.bytes,
            srcUrl: 123,
          },
          'arg',
          {},
        ),
      ).toThrow();
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // fromBytes
  //////////////////////////////////////////////////////////////////////////////

  describe('fromBytes', () => {
    it('creates TFHEPublicKey from valid bytes', () => {
      const pk = bytesToTFHEPublicKey(tfhePublicKeyBytes);

      expect(pk.id).toBe(tfhePublicKeyBytes.id);
      expect(pk.srcUrl).toBeUndefined();
      expect(pk.tfheCompactPublicKeyWasm).toBeDefined();
    });

    it('creates TFHEPublicKey from valid bytes with srcUrl', () => {
      const pk = bytesToTFHEPublicKey(tfhePublicKeyBytesWithSrcUrl);

      expect(pk.id).toBe(tfhePublicKeyBytesWithSrcUrl.id);
      expect(pk.srcUrl).toBe(tfhePublicKeyBytesWithSrcUrl.srcUrl!);
    });

    it('throws on invalid params (missing id)', () => {
      expect(() =>
        bytesToTFHEPublicKey({ bytes: tfhePublicKeyBytes.bytes } as any),
      ).toThrow('Invalid public key (deserialization failed)');
    });

    it('throws on invalid params (missing bytes)', () => {
      expect(() =>
        bytesToTFHEPublicKey({ id: tfhePublicKeyBytes.id } as any),
      ).toThrow('Invalid public key (deserialization failed)');
    });

    it('throws on invalid bytes data', () => {
      expect(() =>
        bytesToTFHEPublicKey({
          id: tfhePublicKeyBytes.id,
          bytes: new Uint8Array([1, 2, 3]),
        }),
      ).toThrow('Invalid public key (deserialization failed)');
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // toBytes
  //////////////////////////////////////////////////////////////////////////////

  describe('toBytes', () => {
    it('serializes public key to bytes', () => {
      const pk = bytesToTFHEPublicKey(tfhePublicKeyBytes);
      const serialized = pk.toBytes();

      expect(serialized.id).toBe(tfhePublicKeyBytes.id);
      expect(serialized.bytes).toBeInstanceOf(Uint8Array);
      expect(serialized.bytes.length).toBeGreaterThan(0);
      expect(serialized.bytes).toStrictEqual(tfhePublicKeyBytes.bytes);
      expect(serialized.srcUrl).toBeUndefined();
    });

    it('serializes public key to bytes with srcUrl', () => {
      const pk = bytesToTFHEPublicKey(tfhePublicKeyBytesWithSrcUrl);
      const serialized = pk.toBytes();

      expect(serialized.bytes).toBeInstanceOf(Uint8Array);
      expect(serialized.bytes.length).toBeGreaterThan(0);
      expect(serialized.bytes).toStrictEqual(
        tfhePublicKeyBytesWithSrcUrl.bytes,
      );
      expect(serialized.id).toBe(tfhePublicKeyBytes.id);
      expect(serialized.srcUrl).toBe('https://example.com/publicKey.bin');
    });

    it('roundtrip: fromBytes -> toBytes -> fromBytes', () => {
      const pk1 = bytesToTFHEPublicKey(tfhePublicKeyBytes);
      const pk1Serialized = pk1.toBytes();
      const pk2 = bytesToTFHEPublicKey(pk1Serialized);
      const pk2Serialized = pk2.toBytes();

      expect(pk2.id).toBe(pk1.id);
      expect(pk1Serialized).toStrictEqual(pk2Serialized);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // toJSON
  //////////////////////////////////////////////////////////////////////////////

  describe('toJSON and fromJSON', () => {
    it('serializes to JSON format', () => {
      const pk = bytesToTFHEPublicKey(tfhePublicKeyBytes);
      const jsonStr = JSON.stringify(pk);
      const json = JSON.parse(jsonStr);

      expect(json.__type).toBe('TFHEPublicKey');
      expect(json.id).toBe(tfhePublicKeyBytes.id);
      expect(typeof json.bytesHex).toBe('string');
      expect(json.bytesHex.startsWith('0x')).toBe(true);
    });

    it('serializes to JSON format with srcUrl', () => {
      const pk = bytesToTFHEPublicKey(tfhePublicKeyBytesWithSrcUrl);
      const jsonStr = JSON.stringify(pk);
      const json = JSON.parse(jsonStr);

      expect(json.__type).toBe('TFHEPublicKey');
      expect(json.srcUrl).toBe('https://example.com/publicKey.bin');
    });

    it('deserializes from JSON', () => {
      const pk1 = bytesToTFHEPublicKey(tfhePublicKeyBytes);
      const jsonStr1 = JSON.stringify(pk1);
      const json1 = JSON.parse(jsonStr1);
      const pk2 = jsonToTFHEPublicKey(json1);

      expect(pk2.id).toBe(pk1.id);
    });

    it('roundtrip: toJSON -> fromJSON', () => {
      const pk1 = bytesToTFHEPublicKey(tfhePublicKeyBytesWithSrcUrl);
      const pk1Serialized = pk1.toBytes();

      const jsonStr1 = JSON.stringify(pk1);
      const json1 = JSON.parse(jsonStr1);

      const pk2 = jsonToTFHEPublicKey(json1);
      const pk2Serialized = pk2.toBytes();

      expect(pk2.id).toBe(pk1.id);
      expect(pk2.srcUrl).toBe(pk1.srcUrl);
      expect(pk1Serialized).toStrictEqual(pk2Serialized);
    });

    it('throws on invalid JSON (__type missing)', () => {
      expect(() =>
        jsonToTFHEPublicKey({ id: 'test', bytesHex: '0x00' }),
      ).toThrow(TFHEError);
    });

    it('throws on invalid JSON (__type wrong)', () => {
      expect(() =>
        jsonToTFHEPublicKey({
          __type: 'WrongType',
          id: 'test',
          bytesHex: '0x00',
        }),
      ).toThrow(TFHEError);
    });

    it('throws on invalid bytesHex', () => {
      expect(() =>
        jsonToTFHEPublicKey({
          __type: 'TFHEPublicKey',
          id: 'test',
          bytesHex: 'not-hex',
        }),
      ).toThrow();
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // fetch
  //////////////////////////////////////////////////////////////////////////////

  describeIfFetchMock('fetch', () => {
    const testUrl = 'https://example.com/publicKey.bin';

    afterEach(() => {
      fetchMock.removeRoutes();
    });

    it('fetches public key from URL', async () => {
      fetchMock.get(testUrl, {
        status: 200,
        body: tfhePublicKeyBytes.bytes,
      });

      const pk = await fetchTFHEPublicKey({
        id: tfhePublicKeyBytes.id,
        srcUrl: testUrl,
      });

      expect(pk.id).toBe(tfhePublicKeyBytes.id);
      expect(pk.srcUrl).toBe(testUrl);
      expect(pk.toBytes().bytes).toStrictEqual(tfhePublicKeyBytes.bytes);
    });

    it('throws on invalid params (missing id)', async () => {
      await expect(
        fetchTFHEPublicKey({ srcUrl: testUrl } as any),
      ).rejects.toThrow(InvalidPropertyError);
    });

    it('throws on invalid params (missing srcUrl)', async () => {
      await expect(
        fetchTFHEPublicKey({ id: tfhePublicKeyBytes.id } as any),
      ).rejects.toThrow(InvalidPropertyError);
    });

    it('throws on fetch error', async () => {
      fetchMock.get(testUrl, {
        status: 404,
      });

      await expect(
        fetchTFHEPublicKey({
          id: tfhePublicKeyBytes.id,
          srcUrl: testUrl,
        }),
      ).rejects.toThrow();
    });

    it('throws on invalid key bytes from fetch', async () => {
      fetchMock.get(testUrl, {
        status: 200,
        body: new Uint8Array([1, 2, 3]),
      });

      await expect(
        fetchTFHEPublicKey({
          id: tfhePublicKeyBytes.id,
          srcUrl: testUrl,
        }),
      ).rejects.toThrow(TFHEError);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Getters
  //////////////////////////////////////////////////////////////////////////////

  describe('getters', () => {
    it('id getter returns correct value', () => {
      const pk = bytesToTFHEPublicKey(tfhePublicKeyBytes);
      expect(pk.id).toBe(tfhePublicKeyBytes.id);
    });

    it('srcUrl getter returns undefined when not set', () => {
      const pk = bytesToTFHEPublicKey(tfhePublicKeyBytes);
      expect(pk.srcUrl).toBeUndefined();
    });

    it('srcUrl getter returns value when set', () => {
      const pk = bytesToTFHEPublicKey(tfhePublicKeyBytesWithSrcUrl);
      expect(pk.srcUrl).toBe('https://example.com/publicKey.bin');
    });

    it('tfheCompactPublicKeyWasm getter returns wasm object', () => {
      const pk = bytesToTFHEPublicKey(tfhePublicKeyBytes);
      expect(pk.tfheCompactPublicKeyWasm).toBeDefined();
      expect(typeof pk.tfheCompactPublicKeyWasm).toBe('object');
    });
  });
});
