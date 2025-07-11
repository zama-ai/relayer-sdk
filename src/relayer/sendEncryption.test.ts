import {
  createRelayerEncryptedInput,
  currentCiphertextVersion,
  RelayerEncryptedInput,
} from './sendEncryption';
import { publicKey, publicParams } from '../test';
import fetchMock from '@fetch-mock/core';
import { computeHandles } from './handles';
import { fromHexString, toHexString } from '../utils';

const relayerUrl = 'https://test-fhevm-relayer';
const aclContractAddress = '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8';
const verifyingContractAddressInputVerification =
  '0x0C475a195D5C16bb730Ae2d5B1196844A83899A5';
const chainId = 1234;
const gatewayChainId = 4321;

const autoMock = (input: RelayerEncryptedInput, opts?: { apiKey: string }) => {
  fetchMock.postOnce(`${relayerUrl}/v1/input-proof`, function (params: any) {
    if (opts?.apiKey) {
      if (params.options.headers['x-api-key'] !== opts.apiKey) {
        return { status: 401 };
      }
    }
    const body = JSON.parse(params.options.body);
    const ciphertextWithInputVerification: string =
      body.ciphertextWithInputVerification;
    const options = {
      params: { ciphertextWithInputVerification },
    };
    const handles = computeHandles(
      fromHexString(ciphertextWithInputVerification),
      input.getBits(),
      aclContractAddress,
      chainId,
      currentCiphertextVersion(),
    ).map((handle: Uint8Array) => toHexString(handle));
    return {
      options: options,
      response: {
        handles: handles,
        signatures: [],
      },
    };
  });
};

describe('encrypt', () => {
  it('encrypt', async () => {
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
    autoMock(input);
    const { inputProof, handles } = await input.encrypt();
    expect(inputProof).toBeDefined();
    expect(handles.length).toBe(8);
  }, 60000);

  it('encrypt one 0 value', async () => {
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
    autoMock(input);
    const { inputProof, handles } = await input.encrypt();
    expect(inputProof).toBeDefined();
    expect(handles.length).toBe(1);
  });

  it('throws errors', async () => {
    expect(() =>
      createRelayerEncryptedInput(
        aclContractAddress,
        verifyingContractAddressInputVerification,
        chainId,
        gatewayChainId,
        relayerUrl,
        publicKey,
        publicParams,
        [],
        0,
      )('0xa5e1defb98EFe38EBb2D958CEe052410247F4c80', '0'),
    ).toThrow('User address is not a valid address.');
    expect(() =>
      createRelayerEncryptedInput(
        aclContractAddress,
        verifyingContractAddressInputVerification,
        chainId,
        gatewayChainId,
        relayerUrl,
        publicKey,
        publicParams,
        [],
        0,
      )('0x0', '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80'),
    ).toThrow('Contract address is not a valid address.');

    expect(() =>
      createRelayerEncryptedInput(
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
        '0xa5e1defb98EFe38EBb2D958CEe052410247F4c',
      ),
    ).toThrow('User address is not a valid address.');

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
    expect(() => input.addBool('hello' as any)).toThrow(
      'The value must be a boolean, a number or a bigint.',
    );
    expect(() => input.addBool({} as any)).toThrow(
      'The value must be a boolean, a number or a bigint.',
    );
    expect(() => input.addBool(29393 as any)).toThrow(
      'The value must be 1 or 0.',
    );
    expect(() => input.add8(2 ** 8)).toThrow(
      'The value exceeds the limit for 8bits integer (255)',
    );
    expect(() => input.add16(2 ** 16)).toThrow(
      `The value exceeds the limit for 16bits integer (65535).`,
    );
    expect(() => input.add32(2 ** 32)).toThrow(
      'The value exceeds the limit for 32bits integer (4294967295).',
    );
    expect(() => input.add64(BigInt('0xffffffffffffffff') + BigInt(1))).toThrow(
      'The value exceeds the limit for 64bits integer (18446744073709551615).',
    );
    expect(() =>
      input.add128(BigInt('0xffffffffffffffffffffffffffffffff') + BigInt(1)),
    ).toThrow(
      'The value exceeds the limit for 128bits integer (340282366920938463463374607431768211455).',
    );

    expect(() => input.addAddress('0x00')).toThrow(
      'The value must be a valid address.',
    );
  });

  it('throws if total bits is above 2048', async () => {
    const input2 = createRelayerEncryptedInput(
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
    input2.add256(242);
    input2.add256(242);
    input2.add256(242);
    input2.add256(242);
    input2.add256(242);
    input2.add256(242);
    input2.add256(242);
    input2.add256(242);
    expect(() => input2.addBool(false)).toThrow(
      'Packing more than 2048 bits in a single input ciphertext is unsupported',
    );
  });

  it('throws if incorrect handles list size', async () => {
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
    autoMock(input);
    const input2 = createRelayerEncryptedInput(
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
    input2.add128(BigInt(0));
    input2.add128(BigInt(0));
    await expect(input2.encrypt()).rejects.toThrow(
      'Incorrect Handles list sizes: (expected) 2 != 1 (received)',
    );
  });

  it('throws if incorrect handle', async () => {
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
    input.add128(BigInt(1));
    fetchMock.postOnce(`${relayerUrl}/v1/input-proof`, (params: any) => {
      const body = JSON.parse(params.options.body);
      const ciphertextWithInputVerification: string =
        body.ciphertextWithInputVerification;
      const options = {
        params: { ciphertextWithInputVerification },
      };
      return {
        options: options,
        response: {
          handles: [
            '0x0034ab0034ab00340034abe034cb00340034ab0034ab00340034ab0934ab0034',
          ],
          signatures: ['dead3232'],
        },
      };
    });
    await expect(input.encrypt()).rejects.toThrow(
      /Incorrect Handle 0: \(expected\) [0-9a-z]{64} != [0-9a-z]{64} \(received\)/,
    );
  });

  describe('when api keys are enabled', () => {
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
      autoMock(input, { apiKey: 'my-api-key' });
      expect(input.encrypt({ apiKey: 'my-wrong-api-key' })).rejects.toThrow(
        /Unauthorized/,
      );
    });

    it('returns Unauthorized if the api key is missing', async () => {
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
      autoMock(input, { apiKey: 'my-api-key' });
      expect(input.encrypt()).rejects.toThrow(/Unauthorized/);
    });

    it('returns ok if the api key is valid', async () => {
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
      autoMock(input, { apiKey: 'my-api-key' });
      const { inputProof } = await input.encrypt({
        apiKey: 'my-api-key',
      });
      expect(inputProof).toBeDefined();
    });
  });
});
