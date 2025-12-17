import fetchMock, { type CallLog } from 'fetch-mock';
import { fetchMockInputProof, TEST_CONFIG } from '../config';
import {
  publicKey as assetPublicKey,
  publicParams as assetPublicParams,
} from '..';
import {
  SERIALIZED_SIZE_LIMIT_CRS,
  SERIALIZED_SIZE_LIMIT_PK,
} from '../../constants';
import { ENCRYPTION_TYPES } from '../../sdk/encryptionTypes';

// curl https://relayer.dev.zama.cloud/v1/keyurl
export const relayerV1ResponseGetKeyUrl = {
  response: {
    fhe_key_info: [
      {
        fhe_public_key: {
          data_id: 'fhe-public-key-data-id',
          urls: [
            'https://zama-zws-dev-tkms-b6q87.s3.eu-west-1.amazonaws.com/PUB-p1/PublicKey/0400000000000000000000000000000000000000000000000000000000000001',
          ],
        },
      },
    ],
    crs: {
      '2048': {
        data_id: 'crs-data-id',
        urls: [
          'https://zama-zws-dev-tkms-b6q87.s3.eu-west-1.amazonaws.com/PUB-p1/CRS/0500000000000000000000000000000000000000000000000000000000000001',
        ],
      },
    },
  },
} as const;

export function setupV1RoutesKeyUrl() {
  if (TEST_CONFIG.type !== 'fetch-mock') {
    throw new Error('Test is not running using fetch-mock');
  }

  const assetPublicKeyBytes = assetPublicKey.safe_serialize(
    SERIALIZED_SIZE_LIMIT_PK,
  );
  const assetPublicParams2048Bytes =
    assetPublicParams[2048].publicParams.safe_serialize(
      SERIALIZED_SIZE_LIMIT_CRS,
    );

  fetchMock.get(TEST_CONFIG.v1.urls.keyUrl, relayerV1ResponseGetKeyUrl);
  fetchMock.get(
    relayerV1ResponseGetKeyUrl.response.fhe_key_info[0].fhe_public_key.urls[0],
    assetPublicKeyBytes,
  );

  fetchMock.get(
    relayerV1ResponseGetKeyUrl.response.crs[2048].urls[0],
    assetPublicParams2048Bytes,
  );
}

export function setupV1RoutesInputProof(
  bitwidths: (keyof typeof ENCRYPTION_TYPES)[],
) {
  if (TEST_CONFIG.type !== 'fetch-mock') {
    throw new Error('Test is not running using fetch-mock');
  }

  fetchMock.post(TEST_CONFIG.v1.urls.inputProof, async (args: CallLog) => {
    const body = args.options.body as string;

    const json = JSON.parse(body);

    const result = await fetchMockInputProof(json, bitwidths);
    return {
      status: 200,
      body: {
        response: result,
      },
      headers: { 'Content-Type': 'application/json' },
    };
  });
}
