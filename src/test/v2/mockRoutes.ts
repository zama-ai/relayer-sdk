import type { RelayerV2AsyncRequestState } from '../../relayer-provider/v2/RelayerV2AsyncRequest';
import fetchMock, { CallLog } from 'fetch-mock';
import { fetchMockInputProof, TEST_CONFIG } from '../config';
import { tfheCompactPublicKeyBytes, tfheCompactPkeCrsBytes } from '..';
import { RelayerV2ResponseInvalidBodyError } from '../../relayer-provider/v2/errors/RelayerV2ResponseInvalidBodyError';
import { InvalidPropertyError } from '../../errors/InvalidPropertyError';
import { FhevmInstanceOptions } from '../../types/relayer';

////////////////////////////////////////////////////////////////////////////////

export const RUNNING_REQ_STATE: RelayerV2AsyncRequestState = {
  aborted: false,
  canceled: false,
  failed: false,
  fetching: false,
  running: true,
  succeeded: false,
  terminated: false,
  timeout: false,
} as const;

////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////

export function post202InvalidBodyError(params: {
  cause: InvalidPropertyError;
  bodyJson: string;
}): RelayerV2ResponseInvalidBodyError {
  return new RelayerV2ResponseInvalidBodyError({
    fetchMethod: 'POST',
    status: 202,
    url: TEST_CONFIG.v2.urls.inputProof,
    operation: 'INPUT_PROOF',
    elapsed: 0,
    retryCount: 0,
    state: RUNNING_REQ_STATE,
    ...params,
  });
}

////////////////////////////////////////////////////////////////////////////////

export function setupV2RoutesKeyUrl() {
  if (TEST_CONFIG.type !== 'fetch-mock') {
    throw new Error('Test is not running using fetch-mock');
  }

  fetchMock.get(TEST_CONFIG.v2.urls.keyUrl, relayerV2ResponseGetKeyUrl);
  fetchMock.get(
    relayerV2ResponseGetKeyUrl.response.fheKeyInfo[0].fhePublicKey.urls[0],
    tfheCompactPublicKeyBytes,
  );

  fetchMock.get(
    relayerV2ResponseGetKeyUrl.response.crs[2048].urls[0],
    tfheCompactPkeCrsBytes,
  );
}

////////////////////////////////////////////////////////////////////////////////

export function setupV2RoutesInputProof(params?: {
  jobId?: string;
  instanceOptions?: FhevmInstanceOptions;
  retry?: number;
  inputProofResult?: {
    readonly handles: readonly string[];
    readonly signatures: readonly string[];
  };
}) {
  if (TEST_CONFIG.type !== 'fetch-mock') {
    throw new Error('Test is not running using fetch-mock');
  }

  const receivedArgs = {
    contractAddress: '',
    userAddress: '',
    ciphertextWithInputVerification: '',
  };

  const jobId = params?.jobId ?? '123';
  const auth = params?.instanceOptions?.auth;

  fetchMock.post(TEST_CONFIG.v2.urls.inputProof, async (args: CallLog) => {
    if (auth) {
      const headers = args.options.headers as
        | Record<string, string>
        | undefined;

      switch (auth.__type) {
        case 'BearerToken': {
          const hAuthorization = headers?.['Authorization'];
          if (hAuthorization !== `Bearer ${auth.token}`) {
            return { status: 401 };
          }
          break;
        }

        case 'ApiKeyHeader': {
          if (headers?.[auth.header || 'x-api-key'] !== auth.value) {
            return { status: 401 };
          }
          break;
        }

        case 'ApiKeyCookie':
          if (
            headers?.['Cookie'] !==
            `${auth.cookie || 'x-api-key'}=${auth.value};`
          ) {
            return { status: 401 };
          }
          break;
      }
    }

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
        requestId: 'hello',
        result: { jobId },
      },
      headers: { 'Content-Type': 'application/json' },
    };
  });

  const retryCounter = { count: 0 };

  fetchMock.get(
    `${TEST_CONFIG.v2.urls.inputProof}/${jobId}`,
    async (args: CallLog) => {
      if (retryCounter.count === 0) {
        retryCounter.count = 1;
        return {
          status: 202,
          body: {
            status: 'queued',
            requestId: 'hello',
          },
          headers: { 'Content-Type': 'application/json' },
        };
      } else if (retryCounter.count === 1) {
        retryCounter.count = 2;
        const res =
          params?.inputProofResult ?? (await fetchMockInputProof(receivedArgs));
        return {
          status: 200,
          body: {
            status: 'succeeded',
            requestId: 'hello',
            result: { accepted: true, extraData: `0x00`, ...res },
          },
          headers: { 'Content-Type': 'application/json' },
        };
      } else {
        throw new Error(`retryCounter.count = ${retryCounter.count}`);
      }
    },
  );
}
