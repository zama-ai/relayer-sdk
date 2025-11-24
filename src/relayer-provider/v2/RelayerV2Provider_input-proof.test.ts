import { SepoliaConfig } from '../..';
import type { RelayerInputProofPayload } from '../../relayer/fetchRelayer';
import { AbstractRelayerProvider } from '../AbstractRelayerProvider';
import { createRelayerProvider } from '../createRelayerFhevm';
import fetchMock from '@fetch-mock/core';

// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_input-proof.test.ts --testNamePattern=BBB
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_input-proof.test.ts
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/RelayerV2Provider_input-proof.test.ts --collectCoverageFrom=./src/relayer-provider/v2/RelayerV2Provider.ts

const relayerUrlV2 = `${SepoliaConfig.relayerUrl!}/v2`;

const contractAddress = '0x8ba1f109551bd432803012645ac136ddd64dba72';
const userAddress = '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80';
const ciphertextWithInputVerification = '0xdeadbeef';
const contractChainId: `0x${string}` = ('0x' +
  Number(31337).toString(16)) as `0x${string}`;
const payload: RelayerInputProofPayload = {
  contractAddress,
  userAddress,
  ciphertextWithInputVerification,
  contractChainId,
  extraData: '0x00',
};

function post202(body: any) {
  fetchMock.post(`${relayerUrlV2}/input-proof`, {
    status: 202,
    body,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('RelayerV2Provider', () => {
  let relayerProvider: AbstractRelayerProvider;

  beforeEach(() => {
    fetchMock.removeRoutes();
    const SepoliaConfigeRelayerUrl = SepoliaConfig.relayerUrl!;
    relayerProvider = createRelayerProvider(`${SepoliaConfigeRelayerUrl}/v2`);
    expect(relayerProvider.version).toBe(2);
    expect(relayerProvider.url).toBe(`${SepoliaConfigeRelayerUrl}/v2`);
    expect(relayerProvider.keyUrl).toBe(
      `${SepoliaConfigeRelayerUrl}/v2/keyurl`,
    );
  });

  it('v2: 202 - malformed json', async () => {
    const malformedBodyJson = '{ "some_key": "incomplete_json"';

    let syntaxError;
    try {
      JSON.stringify(malformedBodyJson);
    } catch (e) {
      syntaxError = e as Error;
    }

    post202(malformedBodyJson);
    await expect(() =>
      relayerProvider.fetchPostInputProof(payload),
    ).rejects.toThrow(syntaxError);
  });

  it('v2: 202 - empty json', async () => {
    post202({});
    await expect(() =>
      relayerProvider.fetchPostInputProof(payload),
    ).rejects.toThrow('Invalid body.status');
  });

  it('v2: 202 - status:failed', async () => {
    post202({ status: 'failed' });
    await expect(() =>
      relayerProvider.fetchPostInputProof(payload),
    ).rejects.toThrow(
      "Invalid value for body.status. Expected 'queued'. Got 'failed'.",
    );
  });

  it('v2: 202 - status:succeeded', async () => {
    post202({ status: 'succeeded' });
    await expect(() =>
      relayerProvider.fetchPostInputProof(payload),
    ).rejects.toThrow(
      "Invalid value for body.status. Expected 'queued'. Got 'succeeded'.",
    );
  });

  it('v2: 202 - status:queued', async () => {
    post202({ status: 'queued' });
    await expect(() =>
      relayerProvider.fetchPostInputProof(payload),
    ).rejects.toThrow('Invalid body.result');
  });

  it('v2: 202 - status:queued, result empty', async () => {
    post202({ status: 'queued', result: {} });
    await expect(() =>
      relayerProvider.fetchPostInputProof(payload),
    ).rejects.toThrow('Invalid body.result.id');
  });

  it('v2: 202 - status:queued, result no timestamp', async () => {
    post202({ status: 'queued', result: { id: '123' } });
    await expect(() =>
      relayerProvider.fetchPostInputProof(payload),
    ).rejects.toThrow('Invalid body.result.retry_after');
  });

  it('BBB v2: 202 - status:queued, result ok', async () => {
    post202({
      status: 'queued',
      result: { id: '123', retry_after: new Date() },
    });
    await relayerProvider.fetchPostInputProof(payload);
  });

  // it('BBB v2: fetchPostInputProof', async () => {
  //   fetchMock.post(`${relayerUrlV2}/input-proof`, { status: 202, body: '{' });
  //   await relayerProvider.fetchPostInputProof(payload);
  //   //expect(response).toEqual(relayerV2ResponseGetKeyUrl);
  // });

  //   it('BBB v2: fetchGetKeyUrl', async () => {
  //   fetchMock.get(`${relayerUrlV2}/keyurl`, relayerV2ResponseGetKeyUrl);

  //   const response = await fetch(relayerProvider.keyUrl);
  //   const responseJson1 = await response.json();
  //   const responseJson2 = await response.json();
  //   console.log(JSON.stringify(responseJson1));
  //   console.log(JSON.stringify(responseJson2));
  //   //expect(response).toEqual(relayerV2ResponseGetKeyUrl);
  // });
  // //     response = await fetch(url);

  // it("v2: fetchGetKeyUrl - response = { hello: '123' }", async () => {
  //   fetchMock.get(`${relayerUrlV2}/keyurl`, { hello: '123' });

  //   await expect(() => relayerProvider.fetchGetKeyUrl()).rejects.toThrow(
  //     'Relayer returned an unexpected JSON response',
  //   );
  // });

  // it('v2: fetchGetKeyUrl - response = 123 ', async () => {
  //   fetchMock.get(`${relayerUrlV2}/keyurl`, 123);

  //   await expect(() => relayerProvider.fetchGetKeyUrl()).rejects.toThrow(
  //     "Relayer didn't response correctly. Bad JSON.",
  //   );
  // });

  // it('v2: fetchGetKeyUrl - response = { response: undefined }', async () => {
  //   fetchMock.get(`${relayerUrlV2}/keyurl`, { response: undefined });

  //   await expect(() => relayerProvider.fetchGetKeyUrl()).rejects.toThrow(
  //     'Relayer returned an unexpected JSON response',
  //   );
  // });

  // it('v2: fetchGetKeyUrl - response = { response: null }', async () => {
  //   fetchMock.get(`${relayerUrlV2}/keyurl`, { response: null });

  //   await expect(() => relayerProvider.fetchGetKeyUrl()).rejects.toThrow(
  //     'Relayer returned an unexpected JSON response',
  //   );
  // });

  // it('v2: fetchGetKeyUrl - response = { response: {} }', async () => {
  //   fetchMock.get(`${relayerUrlV2}/keyurl`, { response: {} });

  //   await expect(() => relayerProvider.fetchGetKeyUrl()).rejects.toThrow(
  //     `Unexpected response ${relayerUrlV2}/keyurl. Invalid fetchGetKeyUrl().response.crs`,
  //   );
  // });

  // it('v2: fetchGetKeyUrl - response = { response: { crs: {} } }', async () => {
  //   fetchMock.get(`${relayerUrlV2}/keyurl`, { response: { crs: {} } });

  //   await expect(() => relayerProvider.fetchGetKeyUrl()).rejects.toThrow(
  //     `Unexpected response ${relayerUrlV2}/keyurl. Invalid fetchGetKeyUrl().response.fhe_key_info`,
  //   );
  // });

  // it('v2: fetchGetKeyUrl - response = { response: { crs: {}, fhe_key_info: {} } }', async () => {
  //   fetchMock.get(`${relayerUrlV2}/keyurl`, {
  //     response: { crs: {}, fhe_key_info: {} },
  //   });

  //   await expect(() => relayerProvider.fetchGetKeyUrl()).rejects.toThrow(
  //     `Unexpected response ${relayerUrlV2}/keyurl. Invalid array fetchGetKeyUrl().response.fhe_key_info`,
  //   );
  // });

  // it('v2: fetchGetKeyUrl - 404', async () => {
  //   fetchMock.getOnce(`${relayerUrlV2}/keyurl`, { status: 404 });
  //   await expect(() => relayerProvider.fetchGetKeyUrl()).rejects.toThrow(
  //     'HTTP error! status: 404',
  //   );
  // });

  // it('BBB v2: fetchGetKeyUrl - 404 - cause', async () => {
  //   fetchMock.getOnce(`${relayerUrlV2}/keyurl`, { status: 404 });

  //   try {
  //     await relayerProvider.fetchGetKeyUrl();
  //     fail('Expected fetchGetKeyUrl to throw an error, but it did not.');
  //   } catch (e) {
  //     expect(String(e)).toStrictEqual('Error: HTTP error! status: 404');
  //     const cause = getErrorCause(e) as any;
  //     expect(cause.code).toStrictEqual('RELAYER_FETCH_ERROR');
  //     expect(cause.operation).toStrictEqual('KEY_URL');
  //     expect(cause.status).toStrictEqual(404);
  //     expect(cause.statusText).toStrictEqual('Not Found');
  //     expect(cause.url).toStrictEqual(relayerProvider.keyUrl);
  //   }
  // });
});
