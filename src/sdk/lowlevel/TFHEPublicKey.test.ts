import fetchMock from 'fetch-mock';
import { TFHEPublicKey } from './TFHEPublicKey';
import { tfhePublicKeyBytes, tfhePublicKeyBytesWithSrcUrl } from '../../test';
import { TEST_CONFIG } from '../../test/config';
import { TFHEError } from '../../errors/TFHEError';
import { assertIsTFHEPublicKeyBytesType } from './guards';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/sdk/lowlevel/TFHEPublicKey.test.ts
// npx jest --colors --passWithNoTests ./src/sdk/lowlevel/TFHEPublicKey.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/sdk/lowlevel/TFHEPublicKey.test.ts --collectCoverageFrom=./src/sdk/lowlevel/TFHEPublicKey.ts
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
        assertIsTFHEPublicKeyBytesType(tfhePublicKeyBytes, 'arg'),
      ).not.toThrow();
    });

    it('does not throw for valid TFHEPublicKeyBytesType with srcUrl', () => {
      expect(() =>
        assertIsTFHEPublicKeyBytesType(tfhePublicKeyBytesWithSrcUrl, 'arg'),
      ).not.toThrow();
    });

    it('throws for null', () => {
      expect(() => assertIsTFHEPublicKeyBytesType(null, 'arg')).toThrow();
    });

    it('throws for undefined', () => {
      expect(() => assertIsTFHEPublicKeyBytesType(undefined, 'arg')).toThrow();
    });

    it('throws for missing id', () => {
      expect(() =>
        assertIsTFHEPublicKeyBytesType(
          { bytes: tfhePublicKeyBytes.bytes },
          'arg',
        ),
      ).toThrow();
    });

    it('throws for missing bytes', () => {
      expect(() =>
        assertIsTFHEPublicKeyBytesType({ id: tfhePublicKeyBytes.id }, 'arg'),
      ).toThrow();
    });

    it('throws for invalid id type', () => {
      expect(() =>
        assertIsTFHEPublicKeyBytesType(
          { id: 123, bytes: tfhePublicKeyBytes.bytes },
          'arg',
        ),
      ).toThrow();
    });

    it('throws for invalid bytes type', () => {
      expect(() =>
        assertIsTFHEPublicKeyBytesType(
          {
            id: tfhePublicKeyBytes.id,
            bytes: 'not-bytes',
          },
          'arg',
        ),
      ).toThrow();
    });

    it('throws for invalid srcUrl type', () => {
      expect(() =>
        assertIsTFHEPublicKeyBytesType(
          {
            id: tfhePublicKeyBytes.id,
            bytes: tfhePublicKeyBytes.bytes,
            srcUrl: 123,
          },
          'arg',
        ),
      ).toThrow();
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // fromBytes
  //////////////////////////////////////////////////////////////////////////////

  describe('fromBytes', () => {
    it('creates TFHEPublicKey from valid bytes', () => {
      const pk = TFHEPublicKey.fromBytes(tfhePublicKeyBytes);

      expect(pk).toBeInstanceOf(TFHEPublicKey);
      expect(pk.id).toBe(tfhePublicKeyBytes.id);
      expect(pk.srcUrl).toBeUndefined();
      expect(pk.tfheCompactPublicKeyWasm).toBeDefined();
    });

    it('creates TFHEPublicKey from valid bytes with srcUrl', () => {
      const pk = TFHEPublicKey.fromBytes(tfhePublicKeyBytesWithSrcUrl);

      expect(pk).toBeInstanceOf(TFHEPublicKey);
      expect(pk.id).toBe(tfhePublicKeyBytesWithSrcUrl.id);
      expect(pk.srcUrl).toBe(tfhePublicKeyBytesWithSrcUrl.srcUrl!);
    });

    it('throws on invalid params (missing id)', () => {
      expect(() =>
        TFHEPublicKey.fromBytes({ bytes: tfhePublicKeyBytes.bytes } as any),
      ).toThrow('Invalid public key (deserialization failed)');
    });

    it('throws on invalid params (missing bytes)', () => {
      expect(() =>
        TFHEPublicKey.fromBytes({ id: tfhePublicKeyBytes.id } as any),
      ).toThrow('Invalid public key (deserialization failed)');
    });

    it('throws on invalid bytes data', () => {
      expect(() =>
        TFHEPublicKey.fromBytes({
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
      const pk = TFHEPublicKey.fromBytes(tfhePublicKeyBytes);
      const serialized = pk.toBytes();

      expect(serialized.id).toBe(tfhePublicKeyBytes.id);
      expect(serialized.bytes).toBeInstanceOf(Uint8Array);
      expect(serialized.bytes.length).toBeGreaterThan(0);
      expect(serialized.bytes).toStrictEqual(tfhePublicKeyBytes.bytes);
      expect(serialized.srcUrl).toBeUndefined();
    });

    it('serializes public key to bytes with srcUrl', () => {
      const pk = TFHEPublicKey.fromBytes(tfhePublicKeyBytesWithSrcUrl);
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
      const pk1 = TFHEPublicKey.fromBytes(tfhePublicKeyBytes);
      const pk1Serialized = pk1.toBytes();
      const pk2 = TFHEPublicKey.fromBytes(pk1Serialized);
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
      const pk = TFHEPublicKey.fromBytes(tfhePublicKeyBytes);
      const json = pk.toJSON();

      expect(json.__type).toBe('TFHEPublicKey');
      expect(json.id).toBe(tfhePublicKeyBytes.id);
      expect(typeof json.bytesHex).toBe('string');
      expect(json.bytesHex.startsWith('0x')).toBe(true);
    });

    it('serializes to JSON format with srcUrl', () => {
      const pk = TFHEPublicKey.fromBytes(tfhePublicKeyBytesWithSrcUrl);
      const json = pk.toJSON();

      expect(json.__type).toBe('TFHEPublicKey');
      expect(json.srcUrl).toBe('https://example.com/publicKey.bin');
    });

    it('deserializes from JSON', () => {
      const pk1 = TFHEPublicKey.fromBytes(tfhePublicKeyBytes);
      const json = pk1.toJSON();
      const pk2 = TFHEPublicKey.fromJSON(json);

      expect(pk2).toBeInstanceOf(TFHEPublicKey);
      expect(pk2.id).toBe(pk1.id);
    });

    it('roundtrip: toJSON -> fromJSON', () => {
      const pk1 = TFHEPublicKey.fromBytes(tfhePublicKeyBytesWithSrcUrl);
      const pk1Serialized = pk1.toBytes();
      const json = pk1.toJSON();
      const pk2 = TFHEPublicKey.fromJSON(json);
      const pk2Serialized = pk2.toBytes();

      expect(pk2.id).toBe(pk1.id);
      expect(pk2.srcUrl).toBe(pk1.srcUrl);
      expect(pk1Serialized).toStrictEqual(pk2Serialized);
    });

    it('throws on invalid JSON (__type missing)', () => {
      expect(() =>
        TFHEPublicKey.fromJSON({ id: 'test', bytesHex: '0x00' }),
      ).toThrow(TFHEError);
    });

    it('throws on invalid JSON (__type wrong)', () => {
      expect(() =>
        TFHEPublicKey.fromJSON({
          __type: 'WrongType',
          id: 'test',
          bytesHex: '0x00',
        }),
      ).toThrow(TFHEError);
    });

    it('throws on invalid bytesHex', () => {
      expect(() =>
        TFHEPublicKey.fromJSON({
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

      const pk = await TFHEPublicKey.fetch({
        id: tfhePublicKeyBytes.id,
        srcUrl: testUrl,
      });

      expect(pk).toBeInstanceOf(TFHEPublicKey);
      expect(pk.id).toBe(tfhePublicKeyBytes.id);
      expect(pk.srcUrl).toBe(testUrl);
      expect(pk.toBytes().bytes).toStrictEqual(tfhePublicKeyBytes.bytes);
    });

    it('throws on invalid params (missing id)', async () => {
      await expect(
        TFHEPublicKey.fetch({ srcUrl: testUrl } as any),
      ).rejects.toThrow('Impossible to fetch public key: wrong relayer url.');
    });

    it('throws on invalid params (missing srcUrl)', async () => {
      await expect(
        TFHEPublicKey.fetch({ id: tfhePublicKeyBytes.id } as any),
      ).rejects.toThrow('Impossible to fetch public key: wrong relayer url.');
    });

    it('throws on fetch error', async () => {
      fetchMock.get(testUrl, {
        status: 404,
      });

      await expect(
        TFHEPublicKey.fetch({
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
        TFHEPublicKey.fetch({
          id: tfhePublicKeyBytes.id,
          srcUrl: testUrl,
        }),
      ).rejects.toThrow('Impossible to fetch public key: wrong relayer url.');
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Getters
  //////////////////////////////////////////////////////////////////////////////

  describe('getters', () => {
    it('id getter returns correct value', () => {
      const pk = TFHEPublicKey.fromBytes(tfhePublicKeyBytes);
      expect(pk.id).toBe(tfhePublicKeyBytes.id);
    });

    it('srcUrl getter returns undefined when not set', () => {
      const pk = TFHEPublicKey.fromBytes(tfhePublicKeyBytes);
      expect(pk.srcUrl).toBeUndefined();
    });

    it('srcUrl getter returns value when set', () => {
      const pk = TFHEPublicKey.fromBytes(tfhePublicKeyBytesWithSrcUrl);
      expect(pk.srcUrl).toBe('https://example.com/publicKey.bin');
    });

    it('tfheCompactPublicKeyWasm getter returns wasm object', () => {
      const pk = TFHEPublicKey.fromBytes(tfhePublicKeyBytes);
      expect(pk.tfheCompactPublicKeyWasm).toBeDefined();
      expect(typeof pk.tfheCompactPublicKeyWasm).toBe('object');
    });
  });
});
