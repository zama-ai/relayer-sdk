import fetchMock from 'fetch-mock';
import { CompactPkeCrs } from 'node-tfhe';
import { TFHEPkeCrs } from './TFHEPkeCrs';
import {
  publicParamsId as assetPublicParamsId,
  tfhePksCrsBytes as assetTFHEPksCrsBytes,
  tfhePksCrsBytesWithSrcUrl as assetTFHEPksCrsBytesWitSrcUrl,
} from '../../test';
import { TEST_CONFIG } from '../../test/config';
import { TFHEError } from '../../errors/TFHEError';
import { SERIALIZED_SIZE_LIMIT_CRS } from './constants';
import { bytesToHexLarge } from '../../base/bytes';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/sdk/lowlevel/TFHEPkeCrs.test.ts
// npx jest --colors --passWithNoTests ./src/sdk/lowlevel/TFHEPkeCrs.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/sdk/lowlevel/TFHEPkeCrs.test.ts --collectCoverageFrom=./src/sdk/lowlevel/TFHEPkeCrs.ts
//
////////////////////////////////////////////////////////////////////////////////

const describeIfFetchMock =
  TEST_CONFIG.type === 'fetch-mock' ? describe : describe.skip;

////////////////////////////////////////////////////////////////////////////////
// Tests
////////////////////////////////////////////////////////////////////////////////

describeIfFetchMock('TFHEPkeCrs', () => {
  //////////////////////////////////////////////////////////////////////////////
  // fromBytes
  //////////////////////////////////////////////////////////////////////////////

  describe('fromBytes', () => {
    it('creates TFHEPkeCrs from valid bytes', () => {
      const crs = TFHEPkeCrs.fromBytes(assetTFHEPksCrsBytes);

      expect(crs).toBeInstanceOf(TFHEPkeCrs);
      expect(crs.srcUrl).toBeUndefined();
    });

    it('creates TFHEPkeCrs from valid bytes with srcUrl', () => {
      const crs = TFHEPkeCrs.fromBytes(assetTFHEPksCrsBytesWitSrcUrl);

      expect(crs).toBeInstanceOf(TFHEPkeCrs);
      expect(crs.srcUrl).toBe('https://example.com/crs2048.bin');
    });

    it('throws on invalid params (missing id)', () => {
      expect(() =>
        TFHEPkeCrs.fromBytes({
          bytes: assetTFHEPksCrsBytes.bytes,
          capacity: assetTFHEPksCrsBytes.capacity,
        } as any),
      ).toThrow(TFHEError);
    });

    it('throws on invalid params (missing bytes)', () => {
      expect(() =>
        TFHEPkeCrs.fromBytes({
          id: assetTFHEPksCrsBytes.id,
          capacity: assetTFHEPksCrsBytes.capacity,
        } as any),
      ).toThrow(TFHEError);
    });

    it('throws on invalid params (missing capacity)', () => {
      expect(() =>
        TFHEPkeCrs.fromBytes({
          id: assetTFHEPksCrsBytes.id,
          bytes: assetTFHEPksCrsBytes.bytes,
        } as any),
      ).toThrow(TFHEError);
    });

    it('throws on invalid bytes data', () => {
      expect(() =>
        TFHEPkeCrs.fromBytes({
          id: assetTFHEPksCrsBytes.id,
          bytes: new Uint8Array([1, 2, 3]),
          capacity: assetTFHEPksCrsBytes.capacity,
        }),
      ).toThrow(TFHEError);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // toBytes
  //////////////////////////////////////////////////////////////////////////////

  describe('toBytes', () => {
    it('asset deserialize/serialize integrity', () => {
      const wasm = CompactPkeCrs.safe_deserialize(
        assetTFHEPksCrsBytes.bytes,
        SERIALIZED_SIZE_LIMIT_CRS,
      );
      expect(wasm).not.toBeInstanceOf(Uint8Array);
      expect(typeof wasm).toBe('object');
      expect((wasm as any)?.constructor?.name).toBe('CompactPkeCrs');

      const wasmSerializedBytes = wasm.safe_serialize(
        SERIALIZED_SIZE_LIMIT_CRS,
      );

      const assetPkeCrs2048BytesHex = bytesToHexLarge(
        assetTFHEPksCrsBytes.bytes,
      );
      const wasmSerializedBytesHex = bytesToHexLarge(wasmSerializedBytes);

      expect(assetPkeCrs2048BytesHex === wasmSerializedBytesHex).toBe(true);
      expect(assetTFHEPksCrsBytes.bytes).toStrictEqual(wasmSerializedBytes);
    });

    it('TFHEPkeCrs.fromBytes/toBytes integrity', () => {
      const crs = TFHEPkeCrs.fromBytes(assetTFHEPksCrsBytes);
      const serialized = crs.toBytes();
      const b1 = bytesToHexLarge(serialized.bytes);
      const b2 = bytesToHexLarge(assetTFHEPksCrsBytes.bytes);
      expect(b1).toStrictEqual(b2);

      expect(serialized.id).toBe(assetPublicParamsId);
      expect(serialized.bytes).toBeInstanceOf(Uint8Array);
      expect(serialized.bytes.length).toBeGreaterThan(0);
      expect(serialized.bytes).toStrictEqual(assetTFHEPksCrsBytes.bytes);
      expect(serialized.capacity).toBe(2048);
      expect(serialized.srcUrl).toBeUndefined();
    });

    it('serializes CRS to bytes', () => {
      const crs = TFHEPkeCrs.fromBytes(assetTFHEPksCrsBytes);
      const serialized = crs.toBytes();

      expect(serialized.id).toBe(assetPublicParamsId);
      expect(serialized.bytes).toBeInstanceOf(Uint8Array);
      expect(serialized.bytes.length).toBeGreaterThan(0);
      expect(serialized.bytes).toStrictEqual(assetTFHEPksCrsBytes.bytes);
      expect(serialized.capacity).toBe(2048);
      expect(serialized.srcUrl).toBeUndefined();
    });

    it('serializes CRS to bytes with srcUrl', () => {
      const crs = TFHEPkeCrs.fromBytes(assetTFHEPksCrsBytesWitSrcUrl);
      const serialized = crs.toBytes();

      expect(serialized.bytes).toBeInstanceOf(Uint8Array);
      expect(serialized.bytes.length).toBeGreaterThan(0);
      expect(serialized.bytes).toStrictEqual(
        assetTFHEPksCrsBytesWitSrcUrl.bytes,
      );
      expect(serialized.id).toBe(assetPublicParamsId);
      expect(serialized.capacity).toBe(2048);
      expect(serialized.srcUrl).toBe('https://example.com/crs2048.bin');
    });

    it('roundtrip: fromBytes -> toBytes -> fromBytes', () => {
      const crs1 = TFHEPkeCrs.fromBytes(assetTFHEPksCrsBytes);
      const crs1Serialized = crs1.toBytes();
      const crs2 = TFHEPkeCrs.fromBytes(crs1Serialized);
      const crs2Serialized = crs2.toBytes();

      expect(crs1Serialized).toStrictEqual(crs2Serialized);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // toJSON and fromJSON
  //////////////////////////////////////////////////////////////////////////////

  describe('toJSON and fromJSON', () => {
    it('serializes to JSON format', () => {
      const crs = TFHEPkeCrs.fromBytes(assetTFHEPksCrsBytes);
      const json = crs.toJSON();

      expect(json.__type).toBe('TFHEPkeCrs');
      expect(json.id).toBe(assetPublicParamsId);
      expect(json.capacity).toBe(2048);
      expect(typeof json.bytesHex).toBe('string');
      expect(json.bytesHex.startsWith('0x')).toBe(true);
    });

    it('serializes to JSON format with srcUrl', () => {
      const crs = TFHEPkeCrs.fromBytes(assetTFHEPksCrsBytesWitSrcUrl);
      const json = crs.toJSON();

      expect(json.__type).toBe('TFHEPkeCrs');
      expect(json.srcUrl).toBe('https://example.com/crs2048.bin');
    });

    it('deserializes from JSON', () => {
      const crs1 = TFHEPkeCrs.fromBytes(assetTFHEPksCrsBytes);
      const json = crs1.toJSON();
      const crs2 = TFHEPkeCrs.fromJSON(json);

      expect(crs2).toBeInstanceOf(TFHEPkeCrs);
    });

    it('roundtrip: toJSON -> fromJSON', () => {
      const crs1 = TFHEPkeCrs.fromBytes(assetTFHEPksCrsBytesWitSrcUrl);
      const crs1Serialized = crs1.toBytes();
      const json = crs1.toJSON();
      const crs2 = TFHEPkeCrs.fromJSON(json);
      const crs2Serialized = crs2.toBytes();

      expect(crs2.srcUrl).toBe(crs1.srcUrl);
      expect(crs1Serialized).toStrictEqual(crs2Serialized);
    });

    it('throws on invalid JSON (__type missing)', () => {
      expect(() =>
        TFHEPkeCrs.fromJSON({ id: 'test', bytesHex: '0x00', capacity: 2048 }),
      ).toThrow(TFHEError);
    });

    it('throws on invalid JSON (__type wrong)', () => {
      expect(() =>
        TFHEPkeCrs.fromJSON({
          __type: 'WrongType',
          id: 'test',
          bytesHex: '0x00',
          capacity: 2048,
        }),
      ).toThrow(TFHEError);
    });

    it('throws on invalid bytesHex', () => {
      expect(() =>
        TFHEPkeCrs.fromJSON({
          __type: 'TFHEPkeCrs',
          id: 'test',
          bytesHex: 'not-hex',
          capacity: 2048,
        }),
      ).toThrow();
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // fetch
  //////////////////////////////////////////////////////////////////////////////

  describe('fetch', () => {
    const testUrl = 'https://example.com/crs2048.bin';

    afterEach(() => {
      fetchMock.removeRoutes();
    });

    it('fetches CRS from URL', async () => {
      fetchMock.get(testUrl, {
        status: 200,
        body: assetTFHEPksCrsBytes.bytes,
      });

      const crs = await TFHEPkeCrs.fetch({
        id: assetPublicParamsId,
        srcUrl: testUrl,
        capacity: 2048,
      });

      expect(crs).toBeInstanceOf(TFHEPkeCrs);
      expect(crs.srcUrl).toBe(testUrl);
      expect(crs.toBytes().bytes).toStrictEqual(assetTFHEPksCrsBytes.bytes);
      expect(crs.toBytes().id).toBe(assetPublicParamsId);
      expect(crs.toBytes().capacity).toBe(2048);
    });

    it('throws on invalid params (missing id)', async () => {
      await expect(
        TFHEPkeCrs.fetch({ srcUrl: testUrl, capacity: 2048 } as any),
      ).rejects.toThrow('Impossible to fetch public key: wrong relayer url.');
    });

    it('throws on invalid params (missing srcUrl)', async () => {
      await expect(
        TFHEPkeCrs.fetch({ id: assetPublicParamsId, capacity: 2048 } as any),
      ).rejects.toThrow('Impossible to fetch public key: wrong relayer url.');
    });

    it('throws on invalid params (missing capacity)', async () => {
      await expect(
        TFHEPkeCrs.fetch({ id: assetPublicParamsId, srcUrl: testUrl } as any),
      ).rejects.toThrow('Impossible to fetch public key: wrong relayer url.');
    });

    it('throws on fetch error', async () => {
      fetchMock.get(testUrl, {
        status: 404,
      });

      await expect(
        TFHEPkeCrs.fetch({
          id: assetPublicParamsId,
          srcUrl: testUrl,
          capacity: 2048,
        }),
      ).rejects.toThrow();
    });

    it('throws on invalid CRS bytes from fetch', async () => {
      fetchMock.get(testUrl, {
        status: 200,
        body: new Uint8Array([1, 2, 3]),
      });

      await expect(
        TFHEPkeCrs.fetch({
          id: assetPublicParamsId,
          srcUrl: testUrl,
          capacity: 2048,
        }),
      ).rejects.toThrow(TFHEError);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // supportsCapacity
  //////////////////////////////////////////////////////////////////////////////

  describe('supportsCapacity', () => {
    it('returns true for matching capacity', () => {
      const crs = TFHEPkeCrs.fromBytes(assetTFHEPksCrsBytes);
      expect(crs.supportsCapacity(2048)).toBe(true);
    });

    it('returns false for non-matching capacity', () => {
      const crs = TFHEPkeCrs.fromBytes(assetTFHEPksCrsBytes);
      expect(crs.supportsCapacity(1024)).toBe(false);
      expect(crs.supportsCapacity(4096)).toBe(false);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // getWasmForCapacity
  //////////////////////////////////////////////////////////////////////////////

  describe('getWasmForCapacity', () => {
    it('returns wasm object for matching capacity', () => {
      const crs = TFHEPkeCrs.fromBytes(assetTFHEPksCrsBytes);
      const result = crs.getWasmForCapacity(2048);

      expect(result.capacity).toBe(2048);
      expect(result.id).toBe(assetPublicParamsId);
      expect(result.wasm).toBeDefined();
      expect(typeof result.wasm).toBe('object');
    });

    it('throws for non-matching capacity', () => {
      const crs = TFHEPkeCrs.fromBytes(assetTFHEPksCrsBytes);

      expect(() => crs.getWasmForCapacity(1024)).toThrow(TFHEError);
      expect(() => crs.getWasmForCapacity(1024)).toThrow(
        'Unsupported FHEVM PkeCrs capacity: 1024',
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // getBytesForCapacity
  //////////////////////////////////////////////////////////////////////////////

  describe('getBytesForCapacity', () => {
    it('returns bytes for matching capacity', () => {
      const crs = TFHEPkeCrs.fromBytes(assetTFHEPksCrsBytes);
      const result = crs.getBytesForCapacity(2048);

      expect(result.capacity).toBe(2048);
      expect(result.id).toBe(assetPublicParamsId);
      expect(result.bytes).toBeInstanceOf(Uint8Array);
      expect(result.bytes).toStrictEqual(assetTFHEPksCrsBytes.bytes);
    });

    it('throws for non-matching capacity', () => {
      const crs = TFHEPkeCrs.fromBytes(assetTFHEPksCrsBytes);

      expect(() => crs.getBytesForCapacity(1024)).toThrow(TFHEError);
      expect(() => crs.getBytesForCapacity(1024)).toThrow(
        'Unsupported FHEVM PkeCrs capacity: 1024',
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // srcUrl getter
  //////////////////////////////////////////////////////////////////////////////

  describe('srcUrl getter', () => {
    it('returns undefined when not set', () => {
      const crs = TFHEPkeCrs.fromBytes(assetTFHEPksCrsBytes);
      expect(crs.srcUrl).toBeUndefined();
    });

    it('returns value when set', () => {
      const crs = TFHEPkeCrs.fromBytes(assetTFHEPksCrsBytesWitSrcUrl);
      expect(crs.srcUrl).toBe('https://example.com/crs2048.bin');
    });
  });
});
