import fetchMock from 'fetch-mock';
import {
  fhevmPkeConfig,
  publicKeyId,
  publicParamsId,
  tfheCompactPublicKeyBytes,
  tfheCompactPkeCrsBytes,
} from '../../../test';
import { TEST_CONFIG } from '../../../test/config';
import { TFHEError } from '../../errors/TFHEError';
import { createTFHEPkeParams, fetchTFHEPkeParams } from './TFHEPkeParams';
import { TFHEPkeCrsBytes, TFHEPublicKeyBytes } from '../public-api';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/sdk/lowlevel/keys/TFHEPkeParams.test.ts
// npx jest --colors --passWithNoTests ./src/sdk/lowlevel/keys/TFHEPkeParams.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/sdk/lowlevel/keys/TFHEPkeParams.test.ts --collectCoverageFrom=./src/sdk/lowlevel/keys/TFHEPkeParams.ts
//
////////////////////////////////////////////////////////////////////////////////

const describeIfFetchMock =
  TEST_CONFIG.type === 'fetch-mock' ? describe : describe.skip;

const VALID_TFHE_PKE_PARAMS_ARGS: {
  publicKey: TFHEPublicKeyBytes;
  pkeCrs: Omit<TFHEPkeCrsBytes, 'capacity'> & {
    capacity: 2048;
  };
} = {
  publicKey: {
    id: fhevmPkeConfig.publicKey.id,
    bytes: fhevmPkeConfig.publicKey.data,
  },
  pkeCrs: {
    id: fhevmPkeConfig.publicParams[2048].publicParamsId,
    bytes: fhevmPkeConfig.publicParams[2048].publicParams,
    capacity: 2048,
  },
};

Object.freeze(VALID_TFHE_PKE_PARAMS_ARGS);
Object.freeze(VALID_TFHE_PKE_PARAMS_ARGS.publicKey);
Object.freeze(VALID_TFHE_PKE_PARAMS_ARGS.pkeCrs);

////////////////////////////////////////////////////////////////////////////////
// Tests
////////////////////////////////////////////////////////////////////////////////

describe('TFHEPkeParams', () => {
  //////////////////////////////////////////////////////////////////////////////
  // fromFhevmPkeConfig
  //////////////////////////////////////////////////////////////////////////////

  describe('fromFhevmPkeConfig', () => {
    it('creates TFHEPkeParams from valid config', () => {
      const params = createTFHEPkeParams(VALID_TFHE_PKE_PARAMS_ARGS);
      expect(params.tfhePkeCrs.id).toBe(VALID_TFHE_PKE_PARAMS_ARGS.pkeCrs.id);
      expect(params.tfhePublicKey.id).toBe(
        VALID_TFHE_PKE_PARAMS_ARGS.publicKey.id,
      );
    });

    it('returns correct TFHEPublicKey', () => {
      const params = createTFHEPkeParams(VALID_TFHE_PKE_PARAMS_ARGS);
      const publicKey = params.tfhePublicKey;
      expect(publicKey.id).toBe(publicKeyId);
    });

    it('returns correct TFHEPkeCrs', () => {
      const params = createTFHEPkeParams(VALID_TFHE_PKE_PARAMS_ARGS);
      const pkeCrs = params.tfhePkeCrs;
      expect(pkeCrs.supportsCapacity(2048)).toBe(true);
    });

    it('throws on invalid publicParams', () => {
      expect(() =>
        createTFHEPkeParams({
          publicKey: VALID_TFHE_PKE_PARAMS_ARGS.publicKey,
          pkeCrs: {} as any,
        }),
      ).toThrow();
    });

    it('throws on invalid publicKey', () => {
      expect(() =>
        createTFHEPkeParams({
          publicKey: {} as any,
          pkeCrs: VALID_TFHE_PKE_PARAMS_ARGS.pkeCrs,
        }),
      ).toThrow();
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // getters
  //////////////////////////////////////////////////////////////////////////////

  describe('getters', () => {
    it('getTFHEPublicKey returns TFHEPublicKey instance', () => {
      const params = createTFHEPkeParams(VALID_TFHE_PKE_PARAMS_ARGS);
      const publicKey = params.tfhePublicKey;

      expect(publicKey.id).toBe(publicKeyId);
      expect(publicKey.toBytes().bytes).toStrictEqual(
        tfheCompactPublicKeyBytes,
      );
    });

    it('getTFHEPkeCrs returns TFHEPkeCrs instance', () => {
      const params = createTFHEPkeParams(VALID_TFHE_PKE_PARAMS_ARGS);
      const pkeCrs = params.tfhePkeCrs;

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

      const params = await fetchTFHEPkeParams({
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

      expect(params.tfhePublicKey.id).toBe(publicKeyId);
      expect(params.tfhePublicKey.srcUrl).toBe(publicKeyUrl);
      expect(params.tfhePkeCrs.srcUrl).toBe(crsUrl);
    });

    it('throws on invalid pkeCrs capacity', async () => {
      await expect(
        fetchTFHEPkeParams({
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
        fetchTFHEPkeParams({
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
        fetchTFHEPkeParams({
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
        fetchTFHEPkeParams({
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
        fetchTFHEPkeParams({
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
        fetchTFHEPkeParams({
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
