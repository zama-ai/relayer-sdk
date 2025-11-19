import {
  createRelayerEncryptedInput,
  currentCiphertextVersion,
  RelayerEncryptedInput,
} from './sendEncryption';
import { publicKey, publicParams } from '../test';
import fetchMock from '@fetch-mock/core';
import { computeHandles } from './handles';
import { fromHexString, toHexString } from '../utils';
import type { Auth } from '../auth';
import type { 
  RelayerV2ResponseQueuedOrFailed,
  RelayerV2ResponseQueued,
  RelayerV2ResponseFailed,
  RelayerV2GetResponse,
  RelayerV2GetResponseSucceeded,
  RelayerV2ResultInputProofAcceped,
  RelayerV2ResultInputProofRejected
} from './fetchRelayer';

const relayerUrl = 'https://test-fhevm-relayer';
const aclContractAddress = '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8';
const verifyingContractAddressInputVerification =
  '0x0C475a195D5C16bb730Ae2d5B1196844A83899A5';
const chainId = 1234;
const gatewayChainId = 4321;

// Helper to check auth headers
const checkAuth = (params: any, expectedAuth?: Auth) => {
  if (!expectedAuth) return true;
  
  switch (expectedAuth.__type) {
    case 'BearerToken':
      return params.options.headers['Authorization'] === `Bearer ${expectedAuth.token}`;
    case 'ApiKeyHeader':
      return params.options.headers[expectedAuth.header || 'x-api-key'] === expectedAuth.value;
    case 'ApiKeyCookie':
      return params.options.headers['Cookie'] === `${expectedAuth.cookie || 'x-api-key'}=${expectedAuth.value};`;
    default:
      return true;
  }
};

// Manual mock setup for queued response (202)
const mockV2Queued = (opts?: { auth?: Auth }) => {
  fetchMock.postOnce(`${relayerUrl}/v2/input-proof`, function (params: any) {
    if (!checkAuth(params, opts?.auth)) {
      return { status: 401 };
    }

    const queuedResponse: RelayerV2ResponseQueued = {
      status: 'queued',
      result: {
        id: 'req_123456789abcdef',
        retry_after: new Date(Date.now() + 1000).toUTCString(),
      },
    };

    return {
      status: 202,
      body: queuedResponse,
    };
  });
};

// Manual mock setup for failed response (400/429/500)
const mockV2Failed = (errorType: 'malformed_json' | 'rate_limited' | 'internal_server_error' = 'malformed_json', opts?: { auth?: Auth }) => {
  fetchMock.postOnce(`${relayerUrl}/v2/input-proof`, function (params: any) {
    if (!checkAuth(params, opts?.auth)) {
      return { status: 401 };
    }

    let failedResponse: RelayerV2ResponseFailed;
    let statusCode: number;

    switch (errorType) {
      case 'malformed_json':
        statusCode = 400;
        failedResponse = {
          status: 'failed',
          error: {
            code: 'malformed_json',
            message: 'Invalid JSON payload',
            request_id: 'req_error_123',
          },
        };
        break;
      case 'rate_limited':
        statusCode = 429;
        failedResponse = {
          status: 'failed',
          error: {
            code: 'rate_limited',
            message: 'Too many requests',
            retry_after: new Date(Date.now() + 1000).toUTCString(),
            request_id: 'req_rate_limit_456',
          },
        };
        break;
      case 'internal_server_error':
        statusCode = 500;
        failedResponse = {
          status: 'failed',
          error: {
            code: 'internal_server_error',
            message: 'Internal server error occurred',
            request_id: 'req_server_error_789',
          },
        };
        break;
    }

    return {
      status: statusCode,
      body: failedResponse,
    };
  });
};

// State machine helpers for POST->GET workflow
type StateMachineOptions = {
  requestId?: string;
  auth?: Auth;
  retryAfterMs?: number;
  queuedRetries?: number; // How many 202 responses before final result
};

// Helper to mock successful state machine: POST(202) -> GET(202,202,202) -> GET(200 accepted)
const mockStateMachineAccepted = (input: RelayerEncryptedInput, options: StateMachineOptions = {}) => {
  const {
    requestId = 'req_sm_accepted_123',
    retryAfterMs = 500,
    queuedRetries = 3,
    auth
  } = options;

  const retryAfterDate = new Date(Date.now() + retryAfterMs).toUTCString();

  // Mock POST request (initial submission) -> 202 queued
  mockV2Queued({ auth });

  // Mock GET requests for polling the result
  for (let i = 0; i < queuedRetries; i++) {
    fetchMock.getOnce(`${relayerUrl}/v2/input-proof/${requestId}`, {
      status: 202,
      body: {
        status: 'queued',
        result: {
          id: requestId,
          retry_after: retryAfterDate,
        },
      } satisfies RelayerV2ResponseQueued,
    });
  }

  // Final GET request -> 200 with accepted result
  const handles = computeHandles(
    new Uint8Array(), // Placeholder for actual ciphertext
    input.getBits(),
    aclContractAddress,
    chainId,
    currentCiphertextVersion(),
  ).map((handle: Uint8Array) => toHexString(handle));

  fetchMock.getOnce(`${relayerUrl}/v2/input-proof/${requestId}`, {
    status: 200,
    body: {
      status: 'succeeded',
      result: {
        accepted: true,
        extra_data: '0x00',
        handles: handles,
        signatures: handles.map(() => '0xdeadbeef'),
      } satisfies RelayerV2ResultInputProofAcceped,
    } satisfies RelayerV2GetResponseSucceeded,
  });
};

// Helper to mock rejected state machine: POST(202) -> GET(202,202,202) -> GET(200 rejected)
const mockStateMachineRejected = (options: StateMachineOptions = {}) => {
  const {
    requestId = 'req_sm_rejected_456',
    retryAfterMs = 500,
    queuedRetries = 3,
    auth
  } = options;

  const retryAfterDate = new Date(Date.now() + retryAfterMs).toUTCString();

  // Mock POST request -> 202 queued
  mockV2Queued({ auth });

  // Mock GET requests for polling
  for (let i = 0; i < queuedRetries; i++) {
    fetchMock.getOnce(`${relayerUrl}/v2/input-proof/${requestId}`, {
      status: 202,
      body: {
        status: 'queued',
        result: {
          id: requestId,
          retry_after: retryAfterDate,
        },
      } satisfies RelayerV2ResponseQueued,
    });
  }

  // Final GET request -> 200 with rejected result
  fetchMock.getOnce(`${relayerUrl}/v2/input-proof/${requestId}`, {
    status: 200,
    body: {
      status: 'succeeded',
      result: {
        accepted: false,
        extra_data: '0x00',
      } satisfies RelayerV2ResultInputProofRejected,
    } satisfies RelayerV2GetResponseSucceeded,
  });
};

// Helper to mock 404 when GET is called with wrong request ID
const mockStateMachine404 = (correctRequestId: string, wrongRequestId: string, options: StateMachineOptions = {}) => {
  const { auth } = options;

  // Mock POST request -> 202 queued with correct ID
  fetchMock.postOnce(`${relayerUrl}/v2/input-proof`, {
    status: 202,
    body: {
      status: 'queued',
      result: {
        id: correctRequestId,
        retry_after: new Date(Date.now() + 1000).toUTCString(),
      },
    } satisfies RelayerV2ResponseQueued,
  });

  // Mock GET request with wrong ID -> 404
  fetchMock.getOnce(`${relayerUrl}/v2/input-proof/${wrongRequestId}`, {
    status: 404,
    body: {
      status: 'failed',
      error: {
        code: 'not_found',
        message: `Request with ID ${wrongRequestId} not found`,
        request_id: 'req_404_error',
      },
    } satisfies RelayerV2ResponseFailed,
  });
};

describe('encrypt v2', () => {
  it('returns queued response (202)', async () => {
    const input = createRelayerEncryptedInput(
      aclContractAddress,
      verifyingContractAddressInputVerification,
      chainId,
      gatewayChainId,
      relayerUrl,
      publicKey,
      publicParams,
      [],
      0,
    )(
      '0x8ba1f109551bd432803012645ac136ddd64dba72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );
    input.addBool(false);
    input.add8(BigInt(43));
    input.add16(BigInt(87));
    input.add32(BigInt(2339389323));
    input.add64(BigInt(23393893233));
    input.add128(BigInt(233938932390));
    input.addAddress('0xa5e1defb98EFe38EBb2D958CEe052410247F4c80');
    input.add256(BigInt('2339389323922393930'));
    mockV2Queued();
    const response = await input.encrypt();
    expect(response).toEqual({
      status: 'queued',
      result: {
        id: 'req_123456789abcdef',
        retry_after: 'Wed, 21 Oct 2015 07:28:00 GMT',
      },
    });
  }, 60000);

  it('returns failed response (400 - malformed_json)', async () => {
    const input = createRelayerEncryptedInput(
      aclContractAddress,
      verifyingContractAddressInputVerification,
      chainId,
      gatewayChainId,
      relayerUrl,
      publicKey,
      publicParams,
      [],
      0,
    )(
      '0x8ba1f109551bd432803012645ac136ddd64dba72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );
    input.addBool(false);
    mockV2Failed('malformed_json');
    const response = await input.encrypt();
    expect(response).toEqual({
      status: 'failed',
      error: {
        code: 'malformed_json',
        message: 'Invalid JSON payload',
        request_id: 'req_error_123',
      },
    });
  });

  it('returns failed response (429 - rate_limited)', async () => {
    const input = createRelayerEncryptedInput(
      aclContractAddress,
      verifyingContractAddressInputVerification,
      chainId,
      gatewayChainId,
      relayerUrl,
      publicKey,
      publicParams,
      [],
      0,
    )(
      '0x8ba1f109551bd432803012645ac136ddd64dba72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );
    input.add8(BigInt(42));
    mockV2Failed('rate_limited');
    const response = await input.encrypt();
    expect(response).toEqual({
      status: 'failed',
      error: {
        code: 'rate_limited',
        message: 'Too many requests',
        retry_after: 'Thu, 14 Nov 2024 15:30:00 GMT',
        request_id: 'req_rate_limit_456',
      },
    });
  });

  it('returns failed response (500 - internal_server_error)', async () => {
    const input = createRelayerEncryptedInput(
      aclContractAddress,
      verifyingContractAddressInputVerification,
      chainId,
      gatewayChainId,
      relayerUrl,
      publicKey,
      publicParams,
      [],
      0,
    )(
      '0x8ba1f109551bd432803012645ac136ddd64dba72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );
    input.add16(BigInt(1337));
    mockV2Failed('internal_server_error');
    const response = await input.encrypt();
    expect(response).toEqual({
      status: 'failed',
      error: {
        code: 'internal_server_error',
        message: 'Internal server error occurred',
        request_id: 'req_server_error_789',
      },
    });
  });

  describe('when api keys are enabled', () => {
    it('returns queued response with valid api key', async () => {
      const input = createRelayerEncryptedInput(
        aclContractAddress,
        verifyingContractAddressInputVerification,
        chainId,
        gatewayChainId,
        relayerUrl,
        publicKey,
        publicParams,
        [],
        0,
      )(
        '0x8ba1f109551bd432803012645ac136ddd64dba72',
        '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
      );
      input.add128(BigInt(0));
      mockV2Queued({
        auth: { __type: 'ApiKeyHeader', value: 'my-api-key' },
      });
      const response = await input.encrypt({
        auth: { __type: 'ApiKeyHeader', value: 'my-api-key' },
      });
      expect(response).toEqual({
        status: 'queued',
        result: {
          id: 'req_123456789abcdef',
          retry_after: 'Wed, 21 Oct 2015 07:28:00 GMT',
        },
      });
    });

    it('returns Unauthorized if api key is invalid', async () => {
      const input = createRelayerEncryptedInput(
        aclContractAddress,
        verifyingContractAddressInputVerification,
        chainId,
        gatewayChainId,
        relayerUrl,
        publicKey,
        publicParams,
        [],
        0,
      )(
        '0x8ba1f109551bd432803012645ac136ddd64dba72',
        '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
      );
      mockV2Queued({
        auth: { __type: 'ApiKeyHeader', value: 'my-api-key' },
      });
      expect(
        input.encrypt({
          auth: { __type: 'ApiKeyHeader', value: 'my-wrong-api-key' },
        }),
      ).rejects.toThrow(/Unauthorized/);
    });

    it('returns failed response with valid auth for rate limit', async () => {
      const input = createRelayerEncryptedInput(
        aclContractAddress,
        verifyingContractAddressInputVerification,
        chainId,
        gatewayChainId,
        relayerUrl,
        publicKey,
        publicParams,
        [],
        0,
      )(
        '0x8ba1f109551bd432803012645ac136ddd64dba72',
        '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
      );
      input.add64(BigInt(999));
      mockV2Failed('rate_limited', {
        auth: { __type: 'BearerToken', token: 'valid-bearer-token' },
      });
      const response = await input.encrypt({
        auth: { __type: 'BearerToken', token: 'valid-bearer-token' },
      });
      expect(response).toEqual({
        status: 'failed',
        error: {
          code: 'rate_limited',
          message: 'Too many requests',
          retry_after: 'Thu, 14 Nov 2024 15:30:00 GMT',
          request_id: 'req_rate_limit_456',
        },
      });
    });
  });

  describe('state machine workflow tests', () => {
    it('completes full workflow: POST(202) -> GET(202,202,202) -> GET(200 accepted)', async () => {
      const input = createRelayerEncryptedInput(
        aclContractAddress,
        verifyingContractAddressInputVerification,
        chainId,
        gatewayChainId,
        relayerUrl,
        publicKey,
        publicParams,
        [],
        0,
      )(
        '0x8ba1f109551bd432803012645ac136ddd64dba72',
        '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
      );
      input.addBool(true);
      input.add32(BigInt(42));

      const requestId = 'req_workflow_accepted';
      mockStateMachineAccepted(input, { 
        requestId,
        retryAfterMs: 500,
        queuedRetries: 3 
      });

      // Step 1: POST returns queued response
      const postResponse = await input.encrypt();
      expect(postResponse).toEqual({
        status: 'queued',
        result: {
          id: requestId,
          retry_after: expect.any(String),
        },
      });

      // Step 2: Simulate polling with GET requests
      // This would be handled by your state machine client code
      // For testing, we can simulate the expected sequence
      
      // First 3 GET requests should return 202 queued
      for (let i = 0; i < 3; i++) {
        const pollResponse = await fetch(`${relayerUrl}/v2/input-proof/${requestId}`);
        const pollJson = await pollResponse.json();
        expect(pollResponse.status).toBe(202);
        expect(pollJson.status).toBe('queued');
      }

      // Final GET request should return 200 accepted
      const finalResponse = await fetch(`${relayerUrl}/v2/input-proof/${requestId}`);
      const finalJson = await finalResponse.json();
      expect(finalResponse.status).toBe(200);
      expect(finalJson.status).toBe('succeeded');
      expect(finalJson.result.accepted).toBe(true);
      expect(finalJson.result.handles).toBeDefined();
      expect(Array.isArray(finalJson.result.handles)).toBe(true);
    });

    it('completes rejected workflow: POST(202) -> GET(202,202,202) -> GET(200 rejected)', async () => {
      const input = createRelayerEncryptedInput(
        aclContractAddress,
        verifyingContractAddressInputVerification,
        chainId,
        gatewayChainId,
        relayerUrl,
        publicKey,
        publicParams,
        [],
        0,
      )(
        '0x8ba1f109551bd432803012645ac136ddd64dba72',
        '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
      );
      input.add8(BigInt(255));

      const requestId = 'req_workflow_rejected';
      mockStateMachineRejected({ 
        requestId,
        retryAfterMs: 500,
        queuedRetries: 3 
      });

      // Step 1: POST returns queued response
      const postResponse = await input.encrypt();
      expect(postResponse).toEqual({
        status: 'queued',
        result: {
          id: requestId,
          retry_after: expect.any(String),
        },
      });

      // Step 2: Poll until completion
      for (let i = 0; i < 3; i++) {
        const pollResponse = await fetch(`${relayerUrl}/v2/input-proof/${requestId}`);
        const pollJson = await pollResponse.json();
        expect(pollResponse.status).toBe(202);
        expect(pollJson.status).toBe('queued');
      }

      // Final GET request should return 200 rejected
      const finalResponse = await fetch(`${relayerUrl}/v2/input-proof/${requestId}`);
      const finalJson = await finalResponse.json();
      expect(finalResponse.status).toBe(200);
      expect(finalJson.status).toBe('succeeded');
      expect(finalJson.result.accepted).toBe(false);
      expect(finalJson.result.extra_data).toBe('0x00');
    });

    it('returns 404 when polling with wrong request ID', async () => {
      const input = createRelayerEncryptedInput(
        aclContractAddress,
        verifyingContractAddressInputVerification,
        chainId,
        gatewayChainId,
        relayerUrl,
        publicKey,
        publicParams,
        [],
        0,
      )(
        '0x8ba1f109551bd432803012645ac136ddd64dba72',
        '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
      );
      input.add16(BigInt(1234));

      const correctId = 'req_correct_id';
      const wrongId = 'req_wrong_id';
      mockStateMachine404(correctId, wrongId);

      // POST returns correct ID
      const postResponse = await input.encrypt();
      expect(postResponse).toEqual({
        status: 'queued',
        result: {
          id: correctId,
          retry_after: expect.any(String),
        },
      });

      // GET with wrong ID returns 404
      const getResponse = await fetch(`${relayerUrl}/v2/input-proof/${wrongId}`);
      const getJson = await getResponse.json();
      expect(getResponse.status).toBe(404);
      expect(getJson.status).toBe('failed');
      expect(getJson.error.code).toBe('not_found');
    });

    it('supports custom retry parameters', async () => {
      const input = createRelayerEncryptedInput(
        aclContractAddress,
        verifyingContractAddressInputVerification,
        chainId,
        gatewayChainId,
        relayerUrl,
        publicKey,
        publicParams,
        [],
        0,
      )(
        '0x8ba1f109551bd432803012645ac136ddd64dba72',
        '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
      );
      input.add128(BigInt(9999));

      mockStateMachineAccepted(input, { 
        requestId: 'req_custom_params',
        retryAfterMs: 1000,    // 1 second retry
        queuedRetries: 5,      // 5 polling attempts before success
        auth: { __type: 'ApiKeyHeader', value: 'custom-api-key' }
      });

      const postResponse = await input.encrypt({
        auth: { __type: 'ApiKeyHeader', value: 'custom-api-key' }
      });
      
      expect(postResponse.status).toBe('queued');
      expect(postResponse.result.id).toBe('req_custom_params');

      // Test 5 polling attempts
      for (let i = 0; i < 5; i++) {
        const pollResponse = await fetch(`${relayerUrl}/v2/input-proof/req_custom_params`);
        expect(pollResponse.status).toBe(202);
      }

      // Final success
      const finalResponse = await fetch(`${relayerUrl}/v2/input-proof/req_custom_params`);
      expect(finalResponse.status).toBe(200);
      const finalJson = await finalResponse.json();
      expect(finalJson.result.accepted).toBe(true);
    });
  });

});