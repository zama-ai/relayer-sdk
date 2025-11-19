import { Auth, setAuth } from '../auth';
import {
  throwRelayerUnexpectedJSONError,
  throwRelayerJSONError,
  throwRelayerResponseError,
  throwRelayerUnknownError,
} from './error';

export type RelayerOperation =
  | 'INPUT_PROOF'
  | 'PUBLIC_DECRYPT'
  | 'USER_DECRYPT'
  | 'KEY_URL';

// https://github.com/zama-ai/fhevm-relayer/blob/96151ef300f787658c5fbaf1b4471263160032d5/src/http/input_http_listener.rs#L17
export type RelayerInputProofPayload = {
  // Hex encoded uint256 string without prefix
  contractChainId: `0x${string}`;
  // Hex encoded address with 0x prefix.
  contractAddress: `0x${string}`;
  // Hex encoded address with 0x prefix.
  userAddress: `0x${string}`;
  // List of hex encoded binary proof without 0x prefix
  ciphertextWithInputVerification: string;
  // Hex encoded bytes with 0x prefix. Default: 0x00
  extraData: `0x${string}`;
};

// https://github.com/zama-ai/fhevm-relayer/blob/96151ef300f787658c5fbaf1b4471263160032d5/src/http/userdecrypt_http_listener.rs#L33
export type HandleContractPairRelayer = {
  // Hex encoded bytes32 with 0x prefix.
  handle: `0x${string}`;
  // Hex encoded address with 0x prefix.
  contractAddress: `0x${string}`;
};

// https://github.com/zama-ai/fhevm-relayer/blob/96151ef300f787658c5fbaf1b4471263160032d5/src/http/userdecrypt_http_listener.rs#L20
export type RelayerUserDecryptPayload = {
  handleContractPairs: HandleContractPairRelayer[];
  requestValidity: {
    // Number as a string
    startTimestamp: string;
    // Number as a string
    durationDays: string;
  };
  // Number as a string
  contractsChainId: string;
  // List of hex encoded addresses with 0x prefix
  contractAddresses: `0x${string}`[];
  // Hex encoded address with 0x prefix.
  userAddress: `0x${string}`;
  // Hex encoded signature without 0x prefix.
  signature: string;
  // Hex encoded key without 0x prefix.
  publicKey: string;
  // Hex encoded bytes with 0x prefix. Default: 0x00
  extraData: `0x${string}`;
};

// https://github.com/zama-ai/fhevm-relayer/blob/96151ef300f787658c5fbaf1b4471263160032d5/src/http/public_decrypt_http_listener.rs#L19
export type RelayerPublicDecryptPayload = {
  ciphertextHandles: `0x${string}`[];
  // Hex encoded bytes with 0x prefix. Default: 0x00
  extraData: `0x${string}`;
};

// https://github.com/zama-ai/console/blob/1d74c413760690d9ad4350e283f609242159331e/apps/relayer/src/http/keyurl_http_listener.rs#L6
type RelayerKeyData = { data_id: string; urls: Array<string> };
type RelayerKeyInfo = { fhe_public_key: RelayerKeyData };
export type RelayerKeyUrlResponse = {
  response: {
    fhe_key_info: Array<RelayerKeyInfo>;
    crs: Record<string, RelayerKeyData>;
  };
};

// https://github.com/zama-ai/fhevm-relayer/blob/96151ef300f787658c5fbaf1b4471263160032d5/src/http/userdecrypt_http_listener.rs#L64
export type RelayerUserDecryptJsonResponse = {
  response: Array<{
    // Hex encoded key without 0x prefix.
    payload: string;
    // Hex encoded key without 0x prefix. (len=130)
    signature: string;
  }>;
};

// https://github.com/zama-ai/fhevm-relayer/blob/96151ef300f787658c5fbaf1b4471263160032d5/src/http/public_decrypt_http_listener.rs#L32
export type RelayerPublicDecryptJsonResponse = {
  response: Array<{
    // Hex encoded value without 0x prefix.
    decrypted_value: string;
    // Hex encoded value without 0x prefix.
    signatures: string[];

    // ?? Hex encoded for extra data with or without 0x prefix. ??
    // TODO: precisely determine the prefix
    extra_data: `0x${string}` | string;
  }>;
};

// https://github.com/zama-ai/fhevm-relayer/blob/96151ef300f787658c5fbaf1b4471263160032d5/src/http/input_http_listener.rs#L38
export type RelayerInputProofJsonResponse = {
  response: {
    // Ordered List of hex encoded handles with 0x prefix.
    handles: `0x${string}`[];
    // Attestation signatures for Input verification for the ordered list of handles with 0x prefix.
    signatures: `0x${string}`[];
  };
};

export type RelayerFetchResponseJson = { response: any };

////////////////////////////////////////////////////////////////////////////////
// V2
////////////////////////////////////////////////////////////////////////////////

// RelayerV2<Response|GetResponse|PostResponse><QueuedOrFailed|Succeeded>

// GET:  200 | 202 | 404 | 422 | 500
// POST: 202 | 400 | 429 | 500

// Readiness (400)
// 1. ACL check not propagated
// 2. S3 upload not completed
// 3. 1 & 2
// 4. Ciphertext is garbage

export type HexNo0xPrefix = string;
// <GMT time stamp RFC 7231 timestamp indicating when client should retry (e.g. "Wed, 21 Oct 2015 07:28:00 GMT")>
export type Timestamp = string;

// GET:  202 (queued) | 400 | 429 | 500
// POST: 202 (queued) | 400 | 429 | 500
export type RelayerV2ResponseQueuedOrFailed =
  | RelayerV2ResponseFailed
  | RelayerV2ResponseQueued;

// POST : 202 (queued) | 400 | 429 | 500
export type RelayerV2PostResponse = RelayerV2ResponseQueuedOrFailed;

// GET:  200 | 202 | 404 | 422 | 500
export type RelayerV2GetResponse =
  | RelayerV2ResponseQueuedOrFailed
  | RelayerV2GetResponseSucceeded;

// GET : 404 | 422 | 500
// POST: 400 | 429 | 500
export type RelayerV2ResponseFailed = {
  status: 'failed';
  error: RelayerV2ApiError;
};

// https://github.com/zama-ai/console/blob/1d74c413760690d9ad4350e283f609242159331e/apps/relayer/src/http/utils.rs#L626
export type RelayerV2ApiError =
  | RelayerV2ApiPostError400
  | RelayerV2ApiPostError400WithDetails
  | RelayerV2ApiPostError429
  | RelayerV2ApiError500;

// GET:  500
// POST: 500
export type RelayerV2ApiError500 = {
  code: 'internal_server_error';
  message: string;
  request_id: string;
};

// POST: 429
export type RelayerV2ApiPostError429 = {
  code: 'rate_limited';
  message: string;
  // RFC 7231 timestamp indicating when client should retry (e.g. "Wed, 21 Oct 2015 07:28:00 GMT").
  // Uses absolute timestamp instead of relative seconds for cache-safety.
  // retry_after is only used in the case of Rate limit errors.
  // example = "Thu, 14 Nov 2024 15:30:00 GMT"
  retry_after: Timestamp;
  request_id?: string;
};

// POST: 400
export type RelayerV2ApiPostError400 = {
  code: 'malformed_json' | 'request_error' | 'not_ready_for_decryption';
  message: string;
  request_id: string;
};

// POST: 400
export type RelayerV2ApiPostError400WithDetails = {
  code: 'missing_fields' | 'validation_failed';
  message: string;
  request_id: string;
  details: Array<RelayerV2PostErrorDetail>;
};

// POST: 400
export type RelayerV2PostErrorDetail = {
  field: string;
  issue: string;
};

// GET:  202
// POST: 202
export type RelayerV2ResponseQueued = {
  status: 'queued';
  result: RelayerV2ResultQueued;
};

// GET: 200
export type RelayerV2GetResponseSucceeded = {
  status: 'succeeded';
  result:
    | RelayerV2ResultPublicDecrypt
    | RelayerV2ResultUserDecrypt
    | RelayerV2ResultInputProof;
};

// GET:  202
// POST: 202
export type RelayerV2ResultQueued = {
  id: string;
  retry_after: Timestamp; // Timestamp
};

// GET: 200
export type RelayerV2ResultPublicDecrypt = {
  // Hex encoded value without 0x prefix.
  decrypted_value: HexNo0xPrefix;
  // Hex encoded value without 0x prefix.
  signatures: HexNo0xPrefix[];

  // ?? Hex encoded for extra data with or without 0x prefix. ??
  // TODO: precisely determine the prefix
  extra_data: `0x${string}`;
};

// GET: 200
export type RelayerV2ResultUserDecrypt = {
  // Hex encoded key without 0x prefix.
  payloads: HexNo0xPrefix[];
  // Hex encoded key without 0x prefix. (len=130)
  signatures: HexNo0xPrefix[];
};

// GET: 200
export type RelayerV2ResultInputProof =
  | RelayerV2ResultInputProofAcceped
  | RelayerV2ResultInputProofRejected;

// GET: 200
export type RelayerV2ResultInputProofAcceped = {
  accepted: true;
  extra_data: `0x${string}`;
  // Ordered List of hex encoded handles with 0x prefix.
  handles: `0x${string}`[];
  // Attestation signatures for Input verification for the ordered list of handles with 0x prefix.
  signatures: `0x${string}`[];
};

// GET: 200
export type RelayerV2ResultInputProofRejected = {
  accepted: false;
  extra_data: `0x${string}`;
};

////////////////////////////////////////////////////////////////////////////////

function assertIsRelayerFetchResponseJson(
  json: any,
): asserts json is RelayerFetchResponseJson {
  if (!json || typeof json !== 'object') {
    throw new Error('Unexpected response JSON.');
  }
  if (
    !(
      'response' in json &&
      json.response !== null &&
      json.response !== undefined
    )
  ) {
    throw new Error(
      "Unexpected response JSON format: missing 'response' property.",
    );
  }
}

export async function fetchRelayerJsonRpcPost(
  relayerOperation: RelayerOperation,
  url: string,
  payload: any,
  options?: { auth?: Auth },
): Promise<RelayerFetchResponseJson> {
  const init = setAuth(
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    } satisfies RequestInit,
    options?.auth,
  );

  let response: Response;
  let json: RelayerFetchResponseJson;
  try {
    response = await fetch(url, init);
  } catch (e) {
    throwRelayerUnknownError(relayerOperation, e);
  }
  if (!response.ok) {
    await throwRelayerResponseError(relayerOperation, response);
  }

  let parsed;
  try {
    parsed = await response.json();
  } catch (e) {
    throwRelayerJSONError(relayerOperation, e);
  }

  try {
    assertIsRelayerFetchResponseJson(parsed);
    json = parsed;
  } catch (e) {
    throwRelayerUnexpectedJSONError(relayerOperation, e);
  }

  return json;
}

export async function fetchRelayerGet(
  relayerOperation: RelayerOperation,
  url: string,
): Promise<RelayerFetchResponseJson> {
  let response: Response;
  let json: RelayerFetchResponseJson;
  try {
    response = await fetch(url);
  } catch (e) {
    throwRelayerUnknownError(relayerOperation, e);
  }
  if (!response.ok) {
    await throwRelayerResponseError(relayerOperation, response);
  }

  let parsed;
  try {
    parsed = await response.json();
  } catch (e) {
    throwRelayerJSONError(relayerOperation, e);
  }

  try {
    assertIsRelayerFetchResponseJson(parsed);
    json = parsed;
  } catch (e) {
    throwRelayerUnexpectedJSONError(relayerOperation, e);
  }

  return json;
}
