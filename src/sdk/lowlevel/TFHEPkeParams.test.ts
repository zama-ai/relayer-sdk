import fetchMock from 'fetch-mock';
import { TFHEPkeParams } from './TFHEPkeParams';
import { TFHEPublicKey } from './TFHEPublicKey';
import { TFHEPkeCrs } from './TFHEPkeCrs';
import {
  fhevmPkeConfig,
  fhevmPublicKey,
  fhevmPkeCrsByCapacity,
  publicKeyId,
  publicParamsId,
  tfheCompactPublicKeyBytes,
  tfheCompactPkeCrsBytes,
} from '../../test';
import { TEST_CONFIG } from '../../test/config';
import { TFHEError } from '../../errors/TFHEError';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/sdk/lowlevel/TFHEPkeParams.test.ts
// npx jest --colors --passWithNoTests ./src/sdk/lowlevel/TFHEPkeParams.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/sdk/lowlevel/TFHEPkeParams.test.ts --collectCoverageFrom=./src/sdk/lowlevel/TFHEPkeParams.ts
//
////////////////////////////////////////////////////////////////////////////////

const describeIfFetchMock =
  TEST_CONFIG.type === 'fetch-mock' ? describe : describe.skip;

////////////////////////////////////////////////////////////////////////////////
// Tests
////////////////////////////////////////////////////////////////////////////////

describe('TFHEPkeParams', () => {
  //////////////////////////////////////////////////////////////////////////////
  // fromFhevmPkeConfig
  //////////////////////////////////////////////////////////////////////////////

  describe('fromFhevmPkeConfig', () => {
    it('creates TFHEPkeParams from valid config', () => {
      const params = TFHEPkeParams.fromFhevmPkeConfig(fhevmPkeConfig);

      expect(params).toBeInstanceOf(TFHEPkeParams);
    });

    it('returns correct TFHEPublicKey', () => {
      const params = TFHEPkeParams.fromFhevmPkeConfig(fhevmPkeConfig);
      const publicKey = params.getTFHEPublicKey();

      expect(publicKey).toBeInstanceOf(TFHEPublicKey);
      expect(publicKey.id).toBe(publicKeyId);
    });

    it('returns correct TFHEPkeCrs', () => {
      const params = TFHEPkeParams.fromFhevmPkeConfig(fhevmPkeConfig);
      const pkeCrs = params.getTFHEPkeCrs();

      expect(pkeCrs).toBeInstanceOf(TFHEPkeCrs);
      expect(pkeCrs.supportsCapacity(2048)).toBe(true);
    });

    it('throws on invalid publicParams', () => {
      expect(() =>
        TFHEPkeParams.fromFhevmPkeConfig({
          publicKey: fhevmPublicKey,
          publicParams: {} as any,
        }),
      ).toThrow();
    });

    it('throws on invalid publicKey', () => {
      expect(() =>
        TFHEPkeParams.fromFhevmPkeConfig({
          publicKey: {} as any,
          publicParams: fhevmPkeCrsByCapacity,
        }),
      ).toThrow();
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // tryFromFhevmPkeConfig
  //////////////////////////////////////////////////////////////////////////////

  describe('tryFromFhevmPkeConfig', () => {
    it('creates TFHEPkeParams from valid config', () => {
      const params = TFHEPkeParams.tryFromFhevmPkeConfig(fhevmPkeConfig);

      expect(params).toBeInstanceOf(TFHEPkeParams);
    });

    it('returns undefined for missing publicParams', () => {
      const result = TFHEPkeParams.tryFromFhevmPkeConfig({
        publicKey: fhevmPublicKey,
      });

      expect(result).toBeUndefined();
    });

    it('returns undefined for invalid publicParams', () => {
      const result = TFHEPkeParams.tryFromFhevmPkeConfig({
        publicKey: fhevmPublicKey,
        publicParams: { invalid: 'data' } as any,
      });

      expect(result).toBeUndefined();
    });

    it('returns undefined for missing publicKey', () => {
      const result = TFHEPkeParams.tryFromFhevmPkeConfig({
        publicParams: fhevmPkeCrsByCapacity,
      });

      expect(result).toBeUndefined();
    });

    it('returns undefined for invalid publicKey', () => {
      const result = TFHEPkeParams.tryFromFhevmPkeConfig({
        publicKey: { invalid: 'data' } as any,
        publicParams: fhevmPkeCrsByCapacity,
      });

      expect(result).toBeUndefined();
    });

    it('returns undefined for empty config', () => {
      const result = TFHEPkeParams.tryFromFhevmPkeConfig({});

      expect(result).toBeUndefined();
    });

    it('returns undefined for null publicParams', () => {
      const result = TFHEPkeParams.tryFromFhevmPkeConfig({
        publicKey: fhevmPublicKey,
        publicParams: null as any,
      });

      expect(result).toBeUndefined();
    });

    it('returns undefined for null publicKey', () => {
      const result = TFHEPkeParams.tryFromFhevmPkeConfig({
        publicKey: null as any,
        publicParams: fhevmPkeCrsByCapacity,
      });

      expect(result).toBeUndefined();
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // getters
  //////////////////////////////////////////////////////////////////////////////

  describe('getters', () => {
    it('getTFHEPublicKey returns TFHEPublicKey instance', () => {
      const params = TFHEPkeParams.fromFhevmPkeConfig(fhevmPkeConfig);
      const publicKey = params.getTFHEPublicKey();

      expect(publicKey).toBeInstanceOf(TFHEPublicKey);
      expect(publicKey.id).toBe(publicKeyId);
      expect(publicKey.toBytes().bytes).toStrictEqual(
        tfheCompactPublicKeyBytes,
      );
    });

    it('getTFHEPkeCrs returns TFHEPkeCrs instance', () => {
      const params = TFHEPkeParams.fromFhevmPkeConfig(fhevmPkeConfig);
      const pkeCrs = params.getTFHEPkeCrs();

      expect(pkeCrs).toBeInstanceOf(TFHEPkeCrs);
      expect(pkeCrs.supportsCapacity(2048)).toBe(true);
      expect(pkeCrs.toBytes().bytes).toStrictEqual(tfheCompactPkeCrsBytes);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // fetch
  //////////////////////////////////////////////////////////////////////////////

  describeIfFetchMock('fetch', () => {
    const publicKeyUrl = 'https://example.com/publicKey.bin';
    const crsUrl = 'https://example.com/crs2048.bin';

    afterEach(() => {
      fetchMock.removeRoutes();
    });

    it('fetches TFHEPkeParams from URLs', async () => {
      fetchMock.get(publicKeyUrl, {
        status: 200,
        body: tfheCompactPublicKeyBytes,
      });
      fetchMock.get(crsUrl, {
        status: 200,
        body: tfheCompactPkeCrsBytes,
      });

      const params = await TFHEPkeParams.fetch({
        publicKeyUrl: {
          id: publicKeyId,
          srcUrl: publicKeyUrl,
        },
        pkeCrsUrl: {
          id: publicParamsId,
          srcUrl: crsUrl,
          capacity: 2048,
        },
      });

      expect(params).toBeInstanceOf(TFHEPkeParams);
      expect(params.getTFHEPublicKey()).toBeInstanceOf(TFHEPublicKey);
      expect(params.getTFHEPkeCrs()).toBeInstanceOf(TFHEPkeCrs);
      expect(params.getTFHEPublicKey().id).toBe(publicKeyId);
      expect(params.getTFHEPublicKey().srcUrl).toBe(publicKeyUrl);
      expect(params.getTFHEPkeCrs().srcUrl).toBe(crsUrl);
    });

    it('throws on invalid pkeCrs capacity', async () => {
      await expect(
        TFHEPkeParams.fetch({
          publicKeyUrl: {
            id: publicKeyId,
            srcUrl: publicKeyUrl,
          },
          pkeCrsUrl: {
            id: publicParamsId,
            srcUrl: crsUrl,
            capacity: 1024 as any,
          },
        }),
      ).rejects.toThrow(TFHEError);

      await expect(
        TFHEPkeParams.fetch({
          publicKeyUrl: {
            id: publicKeyId,
            srcUrl: publicKeyUrl,
          },
          pkeCrsUrl: {
            id: publicParamsId,
            srcUrl: crsUrl,
            capacity: 1024 as any,
          },
        }),
      ).rejects.toThrow('Invalid pke crs capacity 1024. Expecting 2048.');
    });

    it('throws on fetch error for publicKey', async () => {
      fetchMock.get(publicKeyUrl, {
        status: 404,
      });

      await expect(
        TFHEPkeParams.fetch({
          publicKeyUrl: {
            id: publicKeyId,
            srcUrl: publicKeyUrl,
          },
          pkeCrsUrl: {
            id: publicParamsId,
            srcUrl: crsUrl,
            capacity: 2048,
          },
        }),
      ).rejects.toThrow(TFHEError);
    });

    it('throws on fetch error for pkeCrs', async () => {
      fetchMock.get(publicKeyUrl, {
        status: 200,
        body: tfheCompactPublicKeyBytes,
      });
      fetchMock.get(crsUrl, {
        status: 404,
      });

      await expect(
        TFHEPkeParams.fetch({
          publicKeyUrl: {
            id: publicKeyId,
            srcUrl: publicKeyUrl,
          },
          pkeCrsUrl: {
            id: publicParamsId,
            srcUrl: crsUrl,
            capacity: 2048,
          },
        }),
      ).rejects.toThrow(TFHEError);
    });

    it('throws on invalid publicKey bytes', async () => {
      fetchMock.get(publicKeyUrl, {
        status: 200,
        body: new Uint8Array([1, 2, 3]),
      });

      await expect(
        TFHEPkeParams.fetch({
          publicKeyUrl: {
            id: publicKeyId,
            srcUrl: publicKeyUrl,
          },
          pkeCrsUrl: {
            id: publicParamsId,
            srcUrl: crsUrl,
            capacity: 2048,
          },
        }),
      ).rejects.toThrow('Impossible to fetch public key: wrong relayer url.');
    });

    it('throws on invalid pkeCrs bytes', async () => {
      fetchMock.get(publicKeyUrl, {
        status: 200,
        body: tfheCompactPublicKeyBytes,
      });
      fetchMock.get(crsUrl, {
        status: 200,
        body: new Uint8Array([1, 2, 3]),
      });

      await expect(
        TFHEPkeParams.fetch({
          publicKeyUrl: {
            id: publicKeyId,
            srcUrl: publicKeyUrl,
          },
          pkeCrsUrl: {
            id: publicParamsId,
            srcUrl: crsUrl,
            capacity: 2048,
          },
        }),
      ).rejects.toThrow('Impossible to fetch public key: wrong relayer url.');
    });
  });
});
