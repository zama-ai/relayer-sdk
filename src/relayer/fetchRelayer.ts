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

type HexString = `0x${string}`;

// https://github.com/zama-ai/fhevm-relayer/blob/96151ef300f787658c5fbaf1b4471263160032d5/src/http/input_http_listener.rs#L17
export type RelayerInputProofPayload = {
  contractChainId: HexString;
  contractAddress: HexString;
  userAddress: HexString;
  ciphertextWithInputVerification: string;
  extraData: HexString;
};

// https://github.com/zama-ai/fhevm-relayer/blob/96151ef300f787658c5fbaf1b4471263160032d5/src/http/userdecrypt_http_listener.rs#L33
export type HandleContractPairRelayer = {
  handle: HexString;
  contractAddress: HexString;
};

// https://github.com/zama-ai/fhevm-relayer/blob/96151ef300f787658c5fbaf1b4471263160032d5/src/http/userdecrypt_http_listener.rs#L20
export type RelayerUserDecryptPayload = {
  handleContractPairs: HandleContractPairRelayer[];
  requestValidity: {
    startTimestamp: string;
    durationDays: string;
  };
  contractsChainId: string;
  contractAddresses: HexString[];
  userAddress: HexString;
  signature: string;
  publicKey: string;
  extraData: HexString;
};

// https://github.com/zama-ai/fhevm-relayer/blob/96151ef300f787658c5fbaf1b4471263160032d5/src/http/public_decrypt_http_listener.rs#L19
export type RelayerPublicDecryptPayload = {
  ciphertextHandles: HexString[];
  extraData: HexString;
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
    payload: string;
    signature: string;
  }>;
};

// https://github.com/zama-ai/fhevm-relayer/blob/96151ef300f787658c5fbaf1b4471263160032d5/src/http/public_decrypt_http_listener.rs#L32
export type RelayerPublicDecryptJsonResponse = {
  response: Array<{
    decrypted_value: string;
    signatures: string[];
  }>;
};

// https://github.com/zama-ai/fhevm-relayer/blob/96151ef300f787658c5fbaf1b4471263160032d5/src/http/input_http_listener.rs#L38
export type RelayerInputProofJsonResponse = {
  response: {
    handles: HexString[];
    signatures: HexString[];
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
    throwRelayerResponseError(relayerOperation, response);
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
    throwRelayerResponseError(relayerOperation, response);
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
