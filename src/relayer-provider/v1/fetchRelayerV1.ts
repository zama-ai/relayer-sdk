import { sdkName, version } from '../../_version';
import {
  throwRelayerUnexpectedJSONError,
  throwRelayerJSONError,
  throwRelayerResponseError,
  throwRelayerUnknownError,
} from '../../relayer/error';
import { setAuth } from '../../auth';
import type { RelayerV1FetchResponseJson } from './types';
import type {
  FhevmInstanceOptions,
  RelayerGetOperation,
  RelayerPostOperation,
} from '../../types/relayer';

function assertIsRelayerV1FetchResponseJson(
  json: any,
): asserts json is RelayerV1FetchResponseJson {
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

export async function fetchRelayerV1Post(
  relayerOperation: RelayerPostOperation,
  url: string,
  payload: any,
  options?: FhevmInstanceOptions,
): Promise<RelayerV1FetchResponseJson> {
  const init = setAuth(
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ZAMA-SDK-VERSION': `${version}`,
        'ZAMA-SDK-NAME': `${sdkName}`,
      },
      body: JSON.stringify(payload),
    } satisfies RequestInit,
    options?.auth,
  );

  let response: Response;
  let json: RelayerV1FetchResponseJson;
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
    throwRelayerJSONError(relayerOperation, e, response);
  }

  try {
    assertIsRelayerV1FetchResponseJson(parsed);
    json = parsed;
  } catch (e) {
    throwRelayerUnexpectedJSONError(relayerOperation, e);
  }

  return json;
}

export async function fetchRelayerV1Get(
  relayerOperation: RelayerGetOperation,
  url: string,
): Promise<RelayerV1FetchResponseJson> {
  const init = {
    method: 'GET',
    headers: {
      'ZAMA-SDK-VERSION': `${version}`,
      'ZAMA-SDK-NAME': `${sdkName}`,
    },
  } satisfies RequestInit;

  let response: Response;
  let json: RelayerV1FetchResponseJson;
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
    throwRelayerJSONError(relayerOperation, e, response);
  }

  try {
    assertIsRelayerV1FetchResponseJson(parsed);
    json = parsed;
  } catch (e) {
    throwRelayerUnexpectedJSONError(relayerOperation, e);
  }

  return json;
}
