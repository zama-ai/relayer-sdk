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
};

// https://github.com/zama-ai/fhevm-relayer/blob/96151ef300f787658c5fbaf1b4471263160032d5/src/http/public_decrypt_http_listener.rs#L19
export type RelayerPublicDecryptPayload = {
  ciphertextHandles: `0x${string}`[];
};

// https://github.com/zama-ai/fhevm-relayer/blob/96151ef300f787658c5fbaf1b4471263160032d5/src/http/keyurl_http_listener.rs#L6
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
  options?: { apiKey?: string },
): Promise<RelayerFetchResponseJson> {
  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.apiKey && { 'x-api-key': options.apiKey }),
    },
    body: JSON.stringify(payload),
  };

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
