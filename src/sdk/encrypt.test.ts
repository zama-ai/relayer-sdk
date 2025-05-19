import { createEncryptedInput } from './encrypt';
import { publicKey, publicParams } from '../test';

describe('encrypt', () => {
  it('encrypt', async () => {
    const input = createEncryptedInput({
      aclContractAddress: '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
      chainId: 1234,
      tfheCompactPublicKey: publicKey,
      publicParams,
      userAddress: '0x8ba1f109551bd432803012645ac136ddd64dba72',
      contractAddress: '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    });
    input.addBool(false);
    input.add8(BigInt(43));
    input.add16(BigInt(87));
    input.add32(BigInt(2339389323));
    input.add64(BigInt(23393893233));
    input.add128(BigInt(233938932390));
    input.addAddress('0xa5e1defb98EFe38EBb2D958CEe052410247F4c80');
    input.add256(BigInt('2339389323922393930'));
    const ciphertext = input.encrypt();
    expect(ciphertext.length).toBe(20098);
  }, 60000);

  it('encrypt one 0 value', async () => {
    const input = createEncryptedInput({
      aclContractAddress: '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
      chainId: 1234,
      tfheCompactPublicKey: publicKey,
      publicParams,
      userAddress: '0x8ba1f109551bd432803012645ac136ddd64dba72',
      contractAddress: '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    });
    input.add128(BigInt(0));
    const ciphertext = input.encrypt();
    expect(ciphertext.length).toBe(18914);
  });

  it('encrypt one 2048 value', async () => {
    const input = createEncryptedInput({
      aclContractAddress: '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
      chainId: 1234,
      tfheCompactPublicKey: publicKey,
      publicParams,
      userAddress: '0x8ba1f109551bd432803012645ac136ddd64dba72',
      contractAddress: '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    });
    const data = new Uint8Array(256);
    data.set([255], 63);
    input.addBytes256(data);
    const ciphertext = input.encrypt();
    expect(ciphertext.length).toBe(22754);
  });

  it('throws errors', async () => {
    expect(() =>
      createEncryptedInput({
        aclContractAddress: '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
        chainId: 1234,
        tfheCompactPublicKey: publicKey,
        publicParams,
        userAddress: '0',
        contractAddress: '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
      }),
    ).toThrow('User address is not a valid address.');
    expect(() =>
      createEncryptedInput({
        aclContractAddress: '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
        chainId: 1234,
        tfheCompactPublicKey: publicKey,
        publicParams,
        userAddress: '0x8ba1f109551bd432803012645ac136ddd64dba72',
        contractAddress: '0',
      }),
    ).toThrow('Contract address is not a valid address.');

    expect(() =>
      createEncryptedInput({
        aclContractAddress: '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
        chainId: 1234,
        tfheCompactPublicKey: publicKey,
        publicParams,
        userAddress: '0x8ba1f109551bd432803012645ac136ddd64d',
        contractAddress: '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
      }),
    ).toThrow('User address is not a valid address.');

    const input = createEncryptedInput({
      aclContractAddress: '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
      chainId: 1234,
      tfheCompactPublicKey: publicKey,
      publicParams,
      userAddress: '0x8ba1f109551bd432803012645ac136ddd64dba72',
      contractAddress: '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    });
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
    const input2 = createEncryptedInput({
      aclContractAddress: '0x325ea1b59F28e9e1C51d3B5b47b7D3965CC5D8C8',
      chainId: 1234,
      tfheCompactPublicKey: publicKey,
      publicParams,
      userAddress: '0x8ba1f109551bd432803012645ac136ddd64dba72',
      contractAddress: '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    });
    input2.addBytes256(new Uint8Array(256));
    expect(() => input2.addBool(false)).toThrow(
      'Packing more than 2048 bits in a single input ciphertext is unsupported',
    );
  });
});
