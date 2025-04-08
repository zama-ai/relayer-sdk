import { ProvenCompactCiphertextList } from 'node-tfhe';
import { createEncryptedInput, ZKInput } from './encrypt';
import { publicKey, publicKeyId, publicParams } from '../test';
import fetchMock from '@fetch-mock/core';

const relayer_url = 'https://test-httpz-relayer';

const auto_mock = (input: ZKInput) => {
  const ciphertextWithZKProof = Buffer.from(input._prove()).toString('hex');
  const options = {
    params: { ciphertextWithZkpok: ciphertextWithZKProof },
  };
  const handles = input
    ._handles()
    .map((handle: Uint8Array) => Buffer.from(handle).toString('hex'));
  const response = {
    handles: handles,
    signatures: ['dead3232'],
  };
  fetchMock.postOnce(`${relayer_url}/v1/input-proof`, {
    options: options,
    response: response,
  });
};

describe('encrypt', () => {
  it('encrypt/decrypt', async () => {
    const input = createEncryptedInput(
      '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
      1234,
      relayer_url,
      publicKey,
      publicParams,
    )(
      '0x8ba1f109551bd432803012645ac136ddd64dba72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );
    input.addBool(false);
    input.add4(2);
    input.add8(BigInt(43));
    input.add16(BigInt(87));
    input.add32(BigInt(2339389323));
    input.add64(BigInt(23393893233));
    input.add128(BigInt(233938932390));
    input.addAddress('0xa5e1defb98EFe38EBb2D958CEe052410247F4c80');
    input.add256(BigInt('2339389323922393930'));
    auto_mock(input);
    const { inputProof, handles } = await input.encrypt();
    expect(inputProof).toBeDefined();
    expect(handles.length).toBe(9);
    // const compactList = ProvenCompactCiphertextList.safe_deserialize(
    //   buffer.inputProof,
    //   BigInt(1024 * 1024 * 512),
    // );

    // const types = input.getBits().map((_, i) => compactList.get_kind_of(i));
    // const expectedTypes = [0, 2, 4, 8, 9, 10, 11, 12, 13];

    // types.forEach((val, i) => {
    //   expect(val).toBe(expectedTypes[i]);
    // });
  }, 60000);

  it('encrypt/decrypt one 0 value', async () => {
    const input = createEncryptedInput(
      '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
      1234,
      relayer_url,
      publicKey,
      publicParams,
    )(
      '0x8ba1f109551bd432803012645ac136ddd64dba72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );
    input.add128(BigInt(0));
    auto_mock(input);
    const { inputProof, handles } = await input.encrypt();
    expect(inputProof).toBeDefined();
    expect(handles.length).toBe(1);
    // const compactList = ProvenCompactCiphertextList.safe_deserialize(
    //   buffer.inputProof,
    //   BigInt(1024 * 1024 * 512),
    // );
    // const types = input.getBits().map((_, i) => compactList.get_kind_of(i));
    // const expectedTypes = [11];

    // types.forEach((val, i) => {
    //   expect(val).toBe(expectedTypes[i]);
    // });
  });

  it('encrypt/decrypt one 2048 value', async () => {
    const input = createEncryptedInput(
      '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
      1234,
      relayer_url,
      publicKey,
      publicParams,
    )(
      '0x8ba1f109551bd432803012645ac136ddd64dba72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );
    const data = new Uint8Array(256);
    data.set([255], 63);
    input.addBytes256(data);
    auto_mock(input);
    const { handles, inputProof } = await input.encrypt();
    expect(inputProof).toBeDefined();
    expect(handles.length).toBe(1);
    // const compactList = ProvenCompactCiphertextList.safe_deserialize(
    //   buffer.inputProof,
    //   BigInt(1024 * 1024 * 512),
    // );
    // const types = input.getBits().map((_, i) => compactList.get_kind_of(i));
    // const expectedTypes = [16];

    // types.forEach((val, i) => {
    //   expect(val).toBe(expectedTypes[i]);
    // });
  });

  it('throws errors', async () => {
    expect(() =>
      createEncryptedInput(
        '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
        1234,
        relayer_url,
        publicKey,
        publicParams,
      )('0xa5e1defb98EFe38EBb2D958CEe052410247F4c80', '0'),
    ).toThrow('User address is not a valid address.');
    expect(() =>
      createEncryptedInput(
        '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
        1234,
        relayer_url,
        publicKey,
        publicParams,
      )('0x0', '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80'),
    ).toThrow('Contract address is not a valid address.');

    expect(() =>
      createEncryptedInput(
        '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
        1234,
        relayer_url,
        publicKey,
        publicParams,
      )(
        '0x8ba1f109551bd432803012645ac136ddd64dba72',
        '0xa5e1defb98EFe38EBb2D958CEe052410247F4c',
      ),
    ).toThrow('User address is not a valid address.');

    const input = createEncryptedInput(
      '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
      1234,
      relayer_url,
      publicKey,
      publicParams,
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
    expect(() => input.add4(29393)).toThrow(
      'The value exceeds the limit for 4bits integer (15)',
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
    const input2 = createEncryptedInput(
      '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
      1234,
      relayer_url,
      publicKey,
      publicParams,
    )(
      '0x8ba1f109551bd432803012645ac136ddd64dba72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );
    input2.addBytes256(new Uint8Array(256));
    expect(() => input2.addBool(false)).toThrow(
      'Packing more than 2048 bits in a single input ciphertext is unsupported',
    );
  });

  it('throws if incorrect handles list size', async () => {
    const input = createEncryptedInput(
      '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
      1234,
      relayer_url,
      publicKey,
      publicParams,
    )(
      '0x8ba1f109551bd432803012645ac136ddd64dba72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );
    input.add128(BigInt(0));
    auto_mock(input);
    const input2 = createEncryptedInput(
      '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
      1234,
      relayer_url,
      publicKey,
      publicParams,
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
    const input = createEncryptedInput(
      '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
      1234,
      relayer_url,
      publicKey,
      publicParams,
    )(
      '0x8ba1f109551bd432803012645ac136ddd64dba72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );
    input.add128(BigInt(1));
    auto_mock(input);
    const input2 = createEncryptedInput(
      '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
      1234,
      relayer_url,
      publicKey,
      publicParams,
    )(
      '0x8ba1f109551bd432803012645ac136ddd64dba72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );
    input2.add128(BigInt(1));
    await expect(input2.encrypt()).rejects.toThrow(
      /Incorrect Handle 0: \(expected\) [0-9a-z]{64} != [0-9a-z]{64} \(received\)/,
    );
  });
});
