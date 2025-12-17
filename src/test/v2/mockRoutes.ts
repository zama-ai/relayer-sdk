import fetchMock, { CallLog } from 'fetch-mock';
import type { RelayerV2AsyncRequestState } from '../../relayer-provider/v2/RelayerV2AsyncRequest';
import { fetchMockInputProof, TEST_CONFIG } from '../config';
import {
  publicKey as assetPublicKey,
  publicParams as assetPublicParams,
} from '..';
import {
  SERIALIZED_SIZE_LIMIT_CRS,
  SERIALIZED_SIZE_LIMIT_PK,
} from '../../constants';
import { RelayerV2ResponseInvalidBodyError } from '../../relayer-provider/v2/errors/RelayerV2ResponseInvalidBodyError';
import { InvalidPropertyError } from '../../errors/InvalidPropertyError';
import { ENCRYPTION_TYPES } from '../../sdk/encryptionTypes';

export const RUNNING_REQ_STATE: RelayerV2AsyncRequestState = {
  aborted: false,
  canceled: false,
  failed: false,
  fetching: false,
  running: true,
  succeeded: false,
  terminated: false,
} as const;

// curl https://relayer.dev.zama.cloud/v2/keyurl
export const relayerV2ResponseGetKeyUrl = {
  status: 'succeeded',
  response: {
    fheKeyInfo: [
      {
        fhePublicKey: {
          dataId: 'fhe-public-key-data-id',
          urls: [
            'https://zama-zws-dev-tkms-b6q87.s3.eu-west-1.amazonaws.com/PUB-p1/PublicKey/0400000000000000000000000000000000000000000000000000000000000001',
          ],
        },
      },
    ],
    crs: {
      '2048': {
        dataId: 'crs-data-id',
        urls: [
          'https://zama-zws-dev-tkms-b6q87.s3.eu-west-1.amazonaws.com/PUB-p1/CRS/0500000000000000000000000000000000000000000000000000000000000001',
        ],
      },
    },
  },
};

export function mockV2Post202(
  operation: 'input-proof' | 'user-decrypt' | 'public-decrypt',
  body: any,
) {
  if (TEST_CONFIG.type !== 'fetch-mock') {
    throw new Error('Test is not running using fetch-mock');
  }

  fetchMock.post(`${TEST_CONFIG.v2.urls.base}/${operation}`, {
    status: 202,
    body,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function post202InvalidBodyError(
  cause: InvalidPropertyError,
): RelayerV2ResponseInvalidBodyError {
  return new RelayerV2ResponseInvalidBodyError({
    fetchMethod: 'POST',
    status: 202,
    url: TEST_CONFIG.v2.urls.inputProof,
    operation: 'INPUT_PROOF',
    elapsed: 0,
    retryCount: 0,
    state: RUNNING_REQ_STATE,
    cause,
  });
}

export function setupV2RoutesKeyUrl() {
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

  fetchMock.get(TEST_CONFIG.v2.urls.keyUrl, relayerV2ResponseGetKeyUrl);
  fetchMock.get(
    relayerV2ResponseGetKeyUrl.response.fheKeyInfo[0].fhePublicKey.urls[0],
    assetPublicKeyBytes,
  );

  fetchMock.get(
    relayerV2ResponseGetKeyUrl.response.crs[2048].urls[0],
    assetPublicParams2048Bytes,
  );
}

export function setupV2RoutesInputProof(
  bitwidths: (keyof typeof ENCRYPTION_TYPES)[],
) {
  if (TEST_CONFIG.type !== 'fetch-mock') {
    throw new Error('Test is not running using fetch-mock');
  }

  const receivedArgs = {
    contractAddress: '',
    userAddress: '',
    ciphertextWithInputVerification: '',
  };

  const jobId = '123';

  fetchMock.post(TEST_CONFIG.v2.urls.inputProof, async (args: CallLog) => {
    const body = args.options.body as string;

    const json = JSON.parse(body);

    receivedArgs.contractAddress = json.contractAddress;
    receivedArgs.userAddress = json.userAddress;
    receivedArgs.ciphertextWithInputVerification =
      json.ciphertextWithInputVerification;

    return {
      status: 202,
      body: {
        status: 'queued',
        result: { jobId, retryAfterSeconds: 3 },
      },
      headers: { 'Content-Type': 'application/json' },
    };
  });

  fetchMock.get(
    `${TEST_CONFIG.v2.urls.inputProof}/${jobId}`,
    async (args: CallLog) => {
      const res = await fetchMockInputProof(receivedArgs, bitwidths);
      return {
        status: 200,
        body: {
          status: 'succeeded',
          requestId: 'hello',
          result: { accepted: true, extraData: `0x00`, ...res },
        },
        headers: { 'Content-Type': 'application/json' },
      };
    },
  );
}
