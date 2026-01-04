import { Wallet } from 'ethers';
import { verifySignature } from './signature';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/base/signature.test.ts
// npx jest --colors --passWithNoTests --coverage ./src/base/signature.test.ts --collectCoverageFrom=./src/base/signature.ts
//
////////////////////////////////////////////////////////////////////////////////

describe('signature', () => {
  // Test wallet with known private key for deterministic tests
  const testPrivateKey =
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  const testWallet = new Wallet(testPrivateKey);

  const domain = {
    name: 'Test',
    version: '1',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
  };

  const types = {
    Message: [{ name: 'content', type: 'string' }],
  };

  const message = {
    content: 'Hello, World!',
  };

  //////////////////////////////////////////////////////////////////////////////

  it('verifies a valid signature and returns the signer address', async () => {
    const signature = await testWallet.signTypedData(domain, types, message);

    const recoveredAddress = verifySignature({
      signature: signature as `0x${string}`,
      domain,
      types,
      message,
    });

    expect(recoveredAddress).toBe(testWallet.address);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('verifies a valid signature with primaryType specified', async () => {
    const signature = await testWallet.signTypedData(domain, types, message);

    const recoveredAddress = verifySignature({
      signature: signature as `0x${string}`,
      domain,
      types,
      message,
      primaryType: 'Message',
    });

    expect(recoveredAddress).toBe(testWallet.address);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('throws on invalid signature format (not 65 bytes hex)', () => {
    expect(() =>
      verifySignature({
        signature: '0xinvalid' as `0x${string}`,
        domain,
        types,
        message,
      }),
    ).toThrow();
  });

  //////////////////////////////////////////////////////////////////////////////

  it('throws on signature with wrong length', () => {
    expect(() =>
      verifySignature({
        signature: '0xdeadbeef' as `0x${string}`,
        domain,
        types,
        message,
      }),
    ).toThrow();
  });

  //////////////////////////////////////////////////////////////////////////////

  it('recovers different address for tampered message', async () => {
    const signature = await testWallet.signTypedData(domain, types, message);

    const tamperedMessage = {
      content: 'Tampered message',
    };

    // Signature verification will recover a different address (not the original signer)
    const recoveredAddress = verifySignature({
      signature: signature as `0x${string}`,
      domain,
      types,
      message: tamperedMessage,
    });

    expect(recoveredAddress).not.toBe(testWallet.address);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('works with multiple types in types object', async () => {
    const multiTypes = {
      Message: [
        { name: 'content', type: 'string' },
        { name: 'sender', type: 'Person' },
      ],
      Person: [
        { name: 'name', type: 'string' },
        { name: 'age', type: 'uint256' },
      ],
    };

    const multiMessage = {
      content: 'Hello',
      sender: {
        name: 'Alice',
        age: 30,
      },
    };

    const signature = await testWallet.signTypedData(
      domain,
      multiTypes,
      multiMessage,
    );

    // Without primaryType - uses all types
    const recoveredAddress = verifySignature({
      signature: signature as `0x${string}`,
      domain,
      types: multiTypes,
      message: multiMessage,
    });

    expect(recoveredAddress).toBe(testWallet.address);
  });
});
