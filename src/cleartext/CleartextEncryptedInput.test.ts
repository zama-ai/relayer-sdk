import { createCleartextEncryptedInput } from './CleartextEncryptedInput';
import type { ChecksummedAddress } from '@base/types/primitives';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/cleartext/CleartextEncryptedInput.test.ts
//
////////////////////////////////////////////////////////////////////////////////

describe('CleartextEncryptedInput', () => {
  const ACL =
    '0x339EcE85B9E11a3A3AA557582784a15d7F82AAf2' as ChecksummedAddress;
  const CONTRACT =
    '0x8ba1f109551bD432803012645Ac136ddd64DBA72' as ChecksummedAddress;
  const USER =
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' as ChecksummedAddress;
  const CHAIN_ID = 17000n;

  it('accumulates values and produces InputProof', async () => {
    const input = createCleartextEncryptedInput({
      aclContractAddress: ACL,
      chainId: CHAIN_ID,
      contractAddress: CONTRACT,
      userAddress: USER,
    });

    input.add8(42).add16(1000);
    const result = await input.encrypt();

    expect(result.handles).toHaveLength(2);
    expect(result.handles[0].length).toBe(32);
    expect(result.handles[1].length).toBe(32);
    expect(result.inputProof).toBeInstanceOf(Uint8Array);
    expect(result.inputProof.length).toBeGreaterThan(0);
  });

  it('produces deterministic results', async () => {
    const makeInput = () => {
      const input = createCleartextEncryptedInput({
        aclContractAddress: ACL,
        chainId: CHAIN_ID,
        contractAddress: CONTRACT,
        userAddress: USER,
      });
      input.add8(42).add16(1000);
      return input.encrypt();
    };

    const r1 = await makeInput();
    const r2 = await makeInput();

    // Handles should be identical
    expect(Buffer.from(r1.handles[0]).toString('hex')).toBe(
      Buffer.from(r2.handles[0]).toString('hex'),
    );
    expect(Buffer.from(r1.handles[1]).toString('hex')).toBe(
      Buffer.from(r2.handles[1]).toString('hex'),
    );
  });

  it('throws if no values added on encrypt', async () => {
    const input = createCleartextEncryptedInput({
      aclContractAddress: ACL,
      chainId: CHAIN_ID,
      contractAddress: CONTRACT,
      userAddress: USER,
    });

    await expect(input.encrypt()).rejects.toThrow(
      'Encrypted input must contain at least one value',
    );
  });

  it('throws if no values added on generateZKProof', () => {
    const input = createCleartextEncryptedInput({
      aclContractAddress: ACL,
      chainId: CHAIN_ID,
      contractAddress: CONTRACT,
      userAddress: USER,
    });

    expect(() => input.generateZKProof()).toThrow(
      'Encrypted input must contain at least one value',
    );
  });

  it('enforces 2048-bit limit', () => {
    const input = createCleartextEncryptedInput({
      aclContractAddress: ACL,
      chainId: CHAIN_ID,
      contractAddress: CONTRACT,
      userAddress: USER,
    });

    // 8 x 256-bit = 2048 bits → OK
    for (let i = 0; i < 8; i++) input.add256(BigInt(i));

    // 9th should fail
    expect(() => input.add256(9n)).toThrow('2048 bits');
  });

  it('validates contract address', () => {
    expect(() =>
      createCleartextEncryptedInput({
        aclContractAddress: ACL,
        chainId: CHAIN_ID,
        contractAddress: 'invalid' as ChecksummedAddress,
        userAddress: USER,
      }),
    ).toThrow('not a valid address');
  });

  it('validates user address', () => {
    expect(() =>
      createCleartextEncryptedInput({
        aclContractAddress: ACL,
        chainId: CHAIN_ID,
        contractAddress: CONTRACT,
        userAddress: 'invalid' as ChecksummedAddress,
      }),
    ).toThrow('not a valid address');
  });

  it('getBits returns correct encryption bits', () => {
    const input = createCleartextEncryptedInput({
      aclContractAddress: ACL,
      chainId: CHAIN_ID,
      contractAddress: CONTRACT,
      userAddress: USER,
    });

    input.addBool(true).add8(42).add64(123n);
    expect(input.getBits()).toEqual([2, 8, 64]);
  });

  it('supports all add methods', () => {
    const input = createCleartextEncryptedInput({
      aclContractAddress: ACL,
      chainId: CHAIN_ID,
      contractAddress: CONTRACT,
      userAddress: USER,
    });

    // Each method should return self for chaining
    const result = input.addBool(false).add8(255).add16(65535).add32(100000);

    expect(result).toBe(input);
    expect(input.getBits()).toEqual([2, 8, 16, 32]);
  });

  it('validates value bounds', () => {
    const input = createCleartextEncryptedInput({
      aclContractAddress: ACL,
      chainId: CHAIN_ID,
      contractAddress: CONTRACT,
      userAddress: USER,
    });

    expect(() => input.add8(256)).toThrow('exceeds the limit');
    expect(() => input.add16(65536)).toThrow('exceeds the limit');
    expect(() => input.addBool(2)).toThrow('The value must be 1 or 0');
  });

  it('addAddress validates checksummed address', () => {
    const input = createCleartextEncryptedInput({
      aclContractAddress: ACL,
      chainId: CHAIN_ID,
      contractAddress: CONTRACT,
      userAddress: USER,
    });

    expect(() => input.addAddress('not-an-address')).toThrow(
      'must be a valid address',
    );

    // Valid address should work
    input.addAddress(USER);
    expect(input.getBits()).toEqual([160]);
  });

  it('generateZKProof returns correct shape', () => {
    const input = createCleartextEncryptedInput({
      aclContractAddress: ACL,
      chainId: CHAIN_ID,
      contractAddress: CONTRACT,
      userAddress: USER,
    });

    input.add8(42);
    const proof = input.generateZKProof();

    expect(proof.chainId).toBe(BigInt(CHAIN_ID));
    expect(proof.aclContractAddress).toBe(ACL);
    expect(proof.contractAddress).toBe(CONTRACT);
    expect(proof.userAddress).toBe(USER);
    expect(proof.ciphertextWithZKProof).toBeInstanceOf(Uint8Array);
    expect(proof.encryptionBits).toEqual([8]);
  });
});
