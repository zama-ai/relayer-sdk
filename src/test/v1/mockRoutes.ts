import type { EncryptionBits } from '../../types/primitives';
import fetchMock, { type CallLog } from 'fetch-mock';
import { fetchMockInputProof, TEST_CONFIG } from '../config';
import { tfheCompactPublicKeyBytes, tfheCompactPkeCrsBytes } from '..';

////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////

export function setupV1RoutesKeyUrl() {
  if (TEST_CONFIG.type !== 'fetch-mock') {
    throw new Error('Test is not running using fetch-mock');
  }

  fetchMock.get(TEST_CONFIG.v1.urls.keyUrl, relayerV1ResponseGetKeyUrl);
  fetchMock.get(
    relayerV1ResponseGetKeyUrl.response.fhe_key_info[0].fhe_public_key.urls[0],
    tfheCompactPublicKeyBytes,
  );

  fetchMock.get(
    relayerV1ResponseGetKeyUrl.response.crs[2048].urls[0],
    tfheCompactPkeCrsBytes,
  );
}

////////////////////////////////////////////////////////////////////////////////

export function setupV1RoutesInputProof(bitwidths: EncryptionBits[]) {
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
