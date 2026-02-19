import type {
  Bytes32Hex,
  Bytes65Hex,
  BytesHex,
  ChecksummedAddress,
} from '@base/types/primitives';
import {
  createKmsEIP712Builder,
  KmsEIP712BuilderImpl,
} from './KmsEIP712Builder';
import { InvalidTypeError } from '@base/errors/InvalidTypeError';
import { ChecksummedAddressError } from '@base/errors/ChecksummedAddressError';
import { AddressError } from '@base/errors/AddressError';
import { Wallet } from 'ethers';
import { createFhevmLibs } from '@fhevm-ethers/index';
import { FhevmLibs } from '@fhevm-base-types/public-api';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/sdk/kms/KmsEIP712Builder.test.ts
// npx jest --colors --passWithNoTests ./src/sdk/kms/KmsEIP712Builder.test.ts --testNamePattern=xxx
//
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Test Constants
////////////////////////////////////////////////////////////////////////////////

const VALID_CHAIN_ID = 11155111n;
const VALID_VERIFYING_CONTRACT =
  '0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D' as ChecksummedAddress;
const VALID_CONTRACT_ADDRESS =
  '0x9aF5773d8dC3d9A57c92e08EF024804eC39FD3b3' as ChecksummedAddress;
const VALID_DELEGATED_ACCOUNT =
  '0x37AC010c1c566696326813b840319B58Bb5840E4' as ChecksummedAddress;
const VALID_PUBLIC_KEY = '0xabcdef1234567890' as BytesHex;
const VALID_EXTRA_DATA = '0xabcdef' as BytesHex;
const VALID_START_TIMESTAMP = 1704067200; // 2024-01-01 00:00:00 UTC
const VALID_DURATION_DAYS = 30;

function createValidParams() {
  return {
    chainId: VALID_CHAIN_ID,
    verifyingContractAddressDecryption: VALID_VERIFYING_CONTRACT,
  };
}

function createValidMessage() {
  return {
    publicKey: VALID_PUBLIC_KEY,
    contractAddresses: [VALID_CONTRACT_ADDRESS] as ChecksummedAddress[],
    startTimestamp: VALID_START_TIMESTAMP,
    durationDays: VALID_DURATION_DAYS,
    extraData: VALID_EXTRA_DATA,
  };
}

function createValidDelegateMessage() {
  return {
    ...createValidMessage(),
    delegatedAccount: VALID_DELEGATED_ACCOUNT,
  };
}

////////////////////////////////////////////////////////////////////////////////

describe('KmsEIP712', () => {
  //////////////////////////////////////////////////////////////////////////////
  // Constructor - valid inputs
  //////////////////////////////////////////////////////////////////////////////

  describe('constructor', () => {
    it('creates instance with valid params', () => {
      const kms = createKmsEIP712Builder(createValidParams());

      expect(kms).toBeInstanceOf(KmsEIP712BuilderImpl);
    });

    it('sets domain correctly', () => {
      const kms = createKmsEIP712Builder(createValidParams());

      expect(kms.domain.name).toBe('Decryption');
      expect(kms.domain.version).toBe('1');
      expect(kms.domain.chainId).toBe(VALID_CHAIN_ID);
      expect(kms.domain.verifyingContract).toBe(VALID_VERIFYING_CONTRACT);
    });

    it('freezes domain object', () => {
      const kms = createKmsEIP712Builder(createValidParams());

      expect(Object.isFrozen(kms.domain)).toBe(true);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Constructor - invalid inputs
  //////////////////////////////////////////////////////////////////////////////

  describe('constructor validation', () => {
    it('throws for negative chainId', () => {
      const params = {
        ...createValidParams(),
        chainId: -1n,
      };

      expect(() => createKmsEIP712Builder(params)).toThrow(InvalidTypeError);
    });

    it('throws for non-number chainId', () => {
      const params = {
        ...createValidParams(),
        chainId: 'invalid',
      };

      expect(() => createKmsEIP712Builder(params as any)).toThrow(
        InvalidTypeError,
      );
    });

    it('throws for chainId exceeding uint32 max', () => {
      const params = {
        ...createValidParams(),
        chainId: 4294967296n, // 2^32
      };

      expect(() => createKmsEIP712Builder(params)).toThrow(InvalidTypeError);
    });

    it('throws for invalid verifyingContract address', () => {
      const params = {
        ...createValidParams(),
        verifyingContractAddressDecryption: '0xinvalid',
      };

      expect(() => createKmsEIP712Builder(params)).toThrow(
        ChecksummedAddressError,
      );
    });

    it('throws for lowercase verifyingContract address', () => {
      const params = {
        ...createValidParams(),
        verifyingContractAddressDecryption:
          '0xf0ffdc93b7e186bc2f8cb3daa75d86d1930a433d',
      };

      expect(() => createKmsEIP712Builder(params)).toThrow(
        ChecksummedAddressError,
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Getters
  //////////////////////////////////////////////////////////////////////////////

  describe('getters', () => {
    let kms: KmsEIP712BuilderImpl;

    beforeEach(() => {
      kms = createKmsEIP712Builder(createValidParams());
    });

    it('chainId returns chainId from domain', () => {
      expect(kms.chainId).toBe(VALID_CHAIN_ID);
    });

    it('verifyingContractAddressDecryption returns verifyingContract from domain', () => {
      expect(kms.verifyingContractAddressDecryption).toBe(
        VALID_VERIFYING_CONTRACT,
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // createEIP712 - valid inputs
  //////////////////////////////////////////////////////////////////////////////

  describe('createEIP712', () => {
    let kmsEIP712: KmsEIP712BuilderImpl;

    beforeEach(() => {
      kmsEIP712 = createKmsEIP712Builder(createValidParams());
    });

    it('creates EIP712 object with valid message', () => {
      const eip712 = kmsEIP712.createUserDecrypt(createValidMessage());

      expect(eip712).toBeDefined();
      expect(eip712.domain).toBeDefined();
      expect(eip712.types).toBeDefined();
      expect(eip712.message).toBeDefined();
      expect(eip712.primaryType).toBe('UserDecryptRequestVerification');
    });

    it('copies domain to EIP712 object', () => {
      const eip712 = kmsEIP712.createUserDecrypt(createValidMessage());

      expect(eip712.domain.name).toBe('Decryption');
      expect(eip712.domain.version).toBe('1');
      expect(eip712.domain.chainId).toBe(VALID_CHAIN_ID);
      expect(eip712.domain.verifyingContract).toBe(VALID_VERIFYING_CONTRACT);
    });

    it('includes message fields in EIP712 object', () => {
      const message = createValidMessage();
      const eip712 = kmsEIP712.createUserDecrypt(message);

      expect(eip712.message.publicKey).toBe(VALID_PUBLIC_KEY);
      expect(eip712.message.contractAddresses).toEqual([
        VALID_CONTRACT_ADDRESS,
      ]);
      expect(eip712.message.startTimestamp).toBe(
        VALID_START_TIMESTAMP.toString(),
      );
      expect(eip712.message.durationDays).toBe(VALID_DURATION_DAYS.toString());
      expect(eip712.message.extraData).toBe(VALID_EXTRA_DATA);
    });

    it('freezes EIP712 object and its properties', () => {
      const eip712 = kmsEIP712.createUserDecrypt(createValidMessage());

      expect(Object.isFrozen(eip712)).toBe(true);
      expect(Object.isFrozen(eip712.domain)).toBe(true);
      expect(Object.isFrozen(eip712.types)).toBe(true);
      expect(Object.isFrozen(eip712.types.UserDecryptRequestVerification)).toBe(
        true,
      );
      expect(Object.isFrozen(eip712.message)).toBe(true);
      expect(Object.isFrozen(eip712.message.contractAddresses)).toBe(true);
    });

    it('accepts empty contractAddresses array', () => {
      const message = {
        ...createValidMessage(),
        contractAddresses: [] as ChecksummedAddress[],
      };

      const eip712 = kmsEIP712.createUserDecrypt(message);

      expect(eip712.message.contractAddresses).toEqual([]);
    });

    it('accepts multiple contractAddresses', () => {
      const message = {
        ...createValidMessage(),
        contractAddresses: [VALID_CONTRACT_ADDRESS, VALID_DELEGATED_ACCOUNT],
      };

      const eip712 = kmsEIP712.createUserDecrypt(message);

      expect(eip712.message.contractAddresses).toEqual([
        VALID_CONTRACT_ADDRESS,
        VALID_DELEGATED_ACCOUNT,
      ]);
    });

    it('accepts empty extraData', () => {
      const message = {
        ...createValidMessage(),
        extraData: '0x' as BytesHex,
      };

      const eip712 = kmsEIP712.createUserDecrypt(message);

      expect(eip712.message.extraData).toBe('0x');
    });

    it('throws for bigint startTimestamp', () => {
      const message = {
        ...createValidMessage(),
        startTimestamp: BigInt(VALID_START_TIMESTAMP),
      };

      expect(() => kmsEIP712.createUserDecrypt(message as any)).toThrow(
        InvalidTypeError,
      );
    });

    it('throws for bigint durationDays', () => {
      const message = {
        ...createValidMessage(),
        durationDays: BigInt(VALID_DURATION_DAYS),
      };

      expect(() => kmsEIP712.createUserDecrypt(message as any)).toThrow(
        InvalidTypeError,
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // createEIP712 - validation
  //////////////////////////////////////////////////////////////////////////////

  describe('createEIP712 validation', () => {
    let kms: KmsEIP712BuilderImpl;

    beforeEach(() => {
      kms = createKmsEIP712Builder(createValidParams());
    });

    it('throws for invalid publicKey', () => {
      const message = {
        ...createValidMessage(),
        publicKey: 'invalid',
      };

      expect(() => kms.createUserDecrypt(message as any)).toThrow(
        InvalidTypeError,
      );
    });

    it('throws for invalid contractAddresses', () => {
      const message = {
        ...createValidMessage(),
        contractAddresses: ['0xinvalid'] as any,
      };

      expect(() => kms.createUserDecrypt(message)).toThrow(AddressError);
    });

    it('throws for negative startTimestamp', () => {
      const message = {
        ...createValidMessage(),
        startTimestamp: -1,
      };

      expect(() => kms.createUserDecrypt(message)).toThrow(InvalidTypeError);
    });

    it('throws for negative durationDays', () => {
      const message = {
        ...createValidMessage(),
        durationDays: -1,
      };

      expect(() => kms.createUserDecrypt(message)).toThrow(InvalidTypeError);
    });

    it('throws for invalid extraData', () => {
      const message = {
        ...createValidMessage(),
        extraData: 'invalid',
      };

      expect(() => kms.createUserDecrypt(message as any)).toThrow(
        InvalidTypeError,
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // createDelegateEIP712 - valid inputs
  //////////////////////////////////////////////////////////////////////////////

  describe('createDelegateEIP712', () => {
    let kms: KmsEIP712BuilderImpl;

    beforeEach(() => {
      kms = createKmsEIP712Builder(createValidParams());
    });

    it('creates delegate EIP712 object with valid message', () => {
      const eip712 = kms.createDelegateUserDecrypt(
        createValidDelegateMessage(),
      );

      expect(eip712).toBeDefined();
      expect(eip712.domain).toBeDefined();
      expect(eip712.types).toBeDefined();
      expect(eip712.message).toBeDefined();
      expect(eip712.primaryType).toBe(
        'DelegatedUserDecryptRequestVerification',
      );
    });

    it('copies domain to delegate EIP712 object', () => {
      const eip712 = kms.createDelegateUserDecrypt(
        createValidDelegateMessage(),
      );

      expect(eip712.domain.name).toBe('Decryption');
      expect(eip712.domain.version).toBe('1');
      expect(eip712.domain.chainId).toBe(VALID_CHAIN_ID);
      expect(eip712.domain.verifyingContract).toBe(VALID_VERIFYING_CONTRACT);
    });

    it('includes delegatedAccount in delegate EIP712 message', () => {
      const eip712 = kms.createDelegateUserDecrypt(
        createValidDelegateMessage(),
      );

      expect(eip712.message.delegatedAccount).toBe(VALID_DELEGATED_ACCOUNT);
    });

    it('freezes delegate EIP712 object and its properties', () => {
      const eip712 = kms.createDelegateUserDecrypt(
        createValidDelegateMessage(),
      );

      expect(Object.isFrozen(eip712)).toBe(true);
      expect(Object.isFrozen(eip712.domain)).toBe(true);
      expect(Object.isFrozen(eip712.types)).toBe(true);
      expect(
        Object.isFrozen(eip712.types.DelegatedUserDecryptRequestVerification),
      ).toBe(true);
      expect(Object.isFrozen(eip712.message)).toBe(true);
      expect(Object.isFrozen(eip712.message.contractAddresses)).toBe(true);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // createDelegateEIP712 - validation
  //////////////////////////////////////////////////////////////////////////////

  describe('createDelegateEIP712 validation', () => {
    let kms: KmsEIP712BuilderImpl;

    beforeEach(() => {
      kms = createKmsEIP712Builder(createValidParams());
    });

    it('throws for invalid delegatedAccount', () => {
      const message = {
        ...createValidDelegateMessage(),
        delegatedAccount: '0xinvalid',
      };

      expect(() => kms.createDelegateUserDecrypt(message as any)).toThrow(
        AddressError,
      );
    });

    it('throws for lowercase delegatedAccount', () => {
      const message = {
        ...createValidDelegateMessage(),
        delegatedAccount: '0x37ac010c1c566696326813b840319b58bb5840e4',
      };

      expect(() => kms.createDelegateUserDecrypt(message as any)).not.toThrow();
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // verify - validation
  //////////////////////////////////////////////////////////////////////////////

  describe('verify validation', () => {
    let kms: KmsEIP712BuilderImpl;
    let fhevmLibs: FhevmLibs;

    beforeAll(async () => {
      fhevmLibs = await createFhevmLibs();
    });

    beforeEach(() => {
      kms = createKmsEIP712Builder(createValidParams());
    });

    it('throws for invalid signatures array', async () => {
      await expect(
        kms.verifyUserDecrypt({
          signatures: ['0xinvalid'] as any,
          message: createValidMessage(),
          verifier: fhevmLibs.eip712Lib,
        }),
      ).rejects.toThrow(InvalidTypeError);
    });

    it('accepts empty signatures array', async () => {
      const result = await kms.verifyUserDecrypt({
        signatures: [],
        message: createValidMessage(),
        verifier: fhevmLibs.eip712Lib,
      });

      expect(result).toEqual([]);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // verifyDelegate - validation
  //////////////////////////////////////////////////////////////////////////////

  describe('verifyDelegate validation', () => {
    let kms: KmsEIP712BuilderImpl;
    let fhevmLibs: FhevmLibs;

    beforeAll(async () => {
      fhevmLibs = await createFhevmLibs();
    });

    beforeEach(() => {
      kms = createKmsEIP712Builder(createValidParams());
    });

    it('throws for invalid signatures array', async () => {
      await expect(() =>
        kms.verifyDelegateUserDecrypt({
          signatures: ['0xinvalid'] as any,
          message: createValidDelegateMessage(),
          verifier: fhevmLibs.eip712Lib,
        }),
      ).rejects.toThrow(InvalidTypeError);
    });

    it('accepts empty signatures array', async () => {
      const result = await kms.verifyDelegateUserDecrypt({
        signatures: [],
        message: createValidDelegateMessage(),
        verifier: fhevmLibs.eip712Lib,
      });

      expect(result).toEqual([]);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Immutability
  //////////////////////////////////////////////////////////////////////////////

  describe('immutability', () => {
    it('domain is not affected by modifying original params', () => {
      const params = createValidParams();
      const kms = createKmsEIP712Builder(params);

      (params as any).chainId = 999;

      expect(kms.chainId).toBe(VALID_CHAIN_ID);
    });

    it('createEIP712 copies contractAddresses array', () => {
      const kms = createKmsEIP712Builder(createValidParams());
      const addresses = [VALID_CONTRACT_ADDRESS];
      const message = {
        ...createValidMessage(),
        contractAddresses: addresses,
      };

      const eip712 = kms.createUserDecrypt(message);

      addresses.push(VALID_DELEGATED_ACCOUNT);

      expect(eip712.message.contractAddresses).toEqual([
        VALID_CONTRACT_ADDRESS,
      ]);
    });

    it('createDelegateEIP712 copies contractAddresses array', () => {
      const kms = createKmsEIP712Builder(createValidParams());
      const addresses = [VALID_CONTRACT_ADDRESS];
      const message = {
        ...createValidDelegateMessage(),
        contractAddresses: addresses,
      };

      const eip712 = kms.createDelegateUserDecrypt(message);

      addresses.push(VALID_DELEGATED_ACCOUNT);

      expect(eip712.message.contractAddresses).toEqual([
        VALID_CONTRACT_ADDRESS,
      ]);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // createPublicDecryptEIP712
  //////////////////////////////////////////////////////////////////////////////

  describe('createPublicDecryptEIP712', () => {
    let kms: KmsEIP712BuilderImpl;

    beforeEach(() => {
      kms = createKmsEIP712Builder(createValidParams());
    });

    it('creates public decrypt EIP712 object with valid message', () => {
      const message = {
        ctHandles: [
          '0x0000000000000000000000000000000000000000000000000000000000000001' as Bytes32Hex,
        ],
        decryptedResult: '0xabcd' as BytesHex,
        extraData: '0x1234' as BytesHex,
      };

      const eip712 = kms.createPublicDecrypt(message);

      expect(eip712).toBeDefined();
      expect(eip712.primaryType).toBe('PublicDecryptVerification');
      expect(eip712.message.ctHandles).toEqual(message.ctHandles);
      expect(eip712.message.decryptedResult).toBe(message.decryptedResult);
      expect(eip712.message.extraData).toBe(message.extraData);
    });

    it('freezes public decrypt EIP712 object and its properties', () => {
      const message = {
        ctHandles: [
          '0x0000000000000000000000000000000000000000000000000000000000000001' as Bytes32Hex,
        ],
        decryptedResult: '0xabcd' as BytesHex,
        extraData: '0x1234' as BytesHex,
      };

      const eip712 = kms.createPublicDecrypt(message);

      expect(Object.isFrozen(eip712)).toBe(true);
      expect(Object.isFrozen(eip712.domain)).toBe(true);
      expect(Object.isFrozen(eip712.types)).toBe(true);
      expect(Object.isFrozen(eip712.types.PublicDecryptVerification)).toBe(
        true,
      );
      expect(Object.isFrozen(eip712.message)).toBe(true);
      expect(Object.isFrozen(eip712.message.ctHandles)).toBe(true);
    });

    it('throws for invalid ctHandles', () => {
      const message = {
        ctHandles: ['0xinvalid'],
        decryptedResult: '0xabcd' as BytesHex,
        extraData: '0x1234' as BytesHex,
      };

      expect(() => kms.createPublicDecrypt(message as any)).toThrow(
        InvalidTypeError,
      );
    });

    it('throws for invalid decryptedResult', () => {
      const message = {
        ctHandles: [
          '0x0000000000000000000000000000000000000000000000000000000000000001' as Bytes32Hex,
        ],
        decryptedResult: 'invalid',
        extraData: '0x1234' as BytesHex,
      };

      expect(() => kms.createPublicDecrypt(message as any)).toThrow(
        InvalidTypeError,
      );
    });

    it('throws for invalid extraData', () => {
      const message = {
        ctHandles: [
          '0x0000000000000000000000000000000000000000000000000000000000000001' as Bytes32Hex,
        ],
        decryptedResult: '0xabcd' as BytesHex,
        extraData: 'invalid',
      };

      expect(() => kms.createPublicDecrypt(message as any)).toThrow(
        InvalidTypeError,
      );
    });

    it('accepts empty ctHandles array', () => {
      const message = {
        ctHandles: [] as Bytes32Hex[],
        decryptedResult: '0xabcd' as BytesHex,
        extraData: '0x' as BytesHex,
      };

      const eip712 = kms.createPublicDecrypt(message);

      expect(eip712.message.ctHandles).toEqual([]);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // verifyPublicDecrypt
  //////////////////////////////////////////////////////////////////////////////

  describe('verifyPublicDecrypt', () => {
    let kms: KmsEIP712BuilderImpl;
    let fhevmLibs: FhevmLibs;

    beforeAll(async () => {
      fhevmLibs = await createFhevmLibs();
    });

    beforeEach(() => {
      kms = createKmsEIP712Builder(createValidParams());
    });

    it('accepts empty signatures array', async () => {
      const message = {
        ctHandles: [
          '0x0000000000000000000000000000000000000000000000000000000000000001' as Bytes32Hex,
        ],
        decryptedResult: '0xabcd' as BytesHex,
        extraData: '0x1234' as BytesHex,
      };

      const result = await kms.verifyPublicDecrypt({
        signatures: [],
        message,
        verifier: fhevmLibs.eip712Lib,
      });

      expect(result).toEqual([]);
    });

    it('throws for invalid signatures array', async () => {
      const message = {
        ctHandles: [
          '0x0000000000000000000000000000000000000000000000000000000000000001' as Bytes32Hex,
        ],
        decryptedResult: '0xabcd' as BytesHex,
        extraData: '0x1234' as BytesHex,
      };

      await expect(() =>
        kms.verifyPublicDecrypt({
          signatures: ['0xinvalid'] as any,
          message,
          verifier: fhevmLibs.eip712Lib,
        }),
      ).rejects.toThrow(InvalidTypeError);
    });

    it('recovers signer address from valid signature', async () => {
      const wallet = Wallet.createRandom();
      const message = {
        ctHandles: [
          '0x0000000000000000000000000000000000000000000000000000000000000001' as Bytes32Hex,
        ],
        decryptedResult: '0xabcd' as BytesHex,
        extraData: '0x1234' as BytesHex,
      };

      const domain = {
        name: 'Decryption',
        version: '1',
        chainId: VALID_CHAIN_ID,
        verifyingContract: VALID_VERIFYING_CONTRACT,
      };

      const types = {
        PublicDecryptVerification: [
          { name: 'ctHandles', type: 'bytes32[]' },
          { name: 'decryptedResult', type: 'bytes' },
          { name: 'extraData', type: 'bytes' },
        ],
      };

      const signature = (await wallet.signTypedData(
        domain,
        types,
        message,
      )) as Bytes65Hex;

      const result = await kms.verifyPublicDecrypt({
        signatures: [signature],
        message,
        verifier: fhevmLibs.eip712Lib,
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(wallet.address);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // verifyUserDecrypt with signatures
  //////////////////////////////////////////////////////////////////////////////

  describe('verifyUserDecrypt with signatures', () => {
    let kms: KmsEIP712BuilderImpl;
    let fhevmLibs: FhevmLibs;

    beforeAll(async () => {
      fhevmLibs = await createFhevmLibs();
    });

    beforeEach(() => {
      kms = createKmsEIP712Builder(createValidParams());
    });

    it('recovers signer address from valid signature', async () => {
      const wallet = Wallet.createRandom();
      const message = createValidMessage();

      const domain = {
        name: 'Decryption',
        version: '1',
        chainId: VALID_CHAIN_ID,
        verifyingContract: VALID_VERIFYING_CONTRACT,
      };

      const types = {
        UserDecryptRequestVerification: [
          { name: 'publicKey', type: 'bytes' },
          { name: 'contractAddresses', type: 'address[]' },
          { name: 'startTimestamp', type: 'uint256' },
          { name: 'durationDays', type: 'uint256' },
          { name: 'extraData', type: 'bytes' },
        ],
      };

      const signature = (await wallet.signTypedData(domain, types, {
        ...message,
        startTimestamp: message.startTimestamp.toString(),
        durationDays: message.durationDays.toString(),
      })) as Bytes65Hex;

      const result = await kms.verifyUserDecrypt({
        signatures: [signature],
        message,
        verifier: fhevmLibs.eip712Lib,
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(wallet.address);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // verifyDelegateUserDecrypt with signatures
  //////////////////////////////////////////////////////////////////////////////

  describe('verifyDelegateUserDecrypt with signatures', () => {
    let kms: KmsEIP712BuilderImpl;
    let fhevmLibs: FhevmLibs;

    beforeAll(async () => {
      fhevmLibs = await createFhevmLibs();
    });

    beforeEach(() => {
      kms = createKmsEIP712Builder(createValidParams());
    });

    it('recovers signer address from valid signature', async () => {
      const wallet = Wallet.createRandom();
      const message = createValidDelegateMessage();

      const domain = {
        name: 'Decryption',
        version: '1',
        chainId: VALID_CHAIN_ID,
        verifyingContract: VALID_VERIFYING_CONTRACT,
      };

      const types = {
        DelegatedUserDecryptRequestVerification: [
          { name: 'publicKey', type: 'bytes' },
          { name: 'contractAddresses', type: 'address[]' },
          { name: 'startTimestamp', type: 'uint256' },
          { name: 'durationDays', type: 'uint256' },
          { name: 'extraData', type: 'bytes' },
          { name: 'delegatedAccount', type: 'address' },
        ],
      };

      const signature = (await wallet.signTypedData(domain, types, {
        ...message,
        startTimestamp: message.startTimestamp.toString(),
        durationDays: message.durationDays.toString(),
      })) as Bytes65Hex;

      const result = await kms.verifyDelegateUserDecrypt({
        signatures: [signature],
        message,
        verifier: fhevmLibs.eip712Lib,
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(wallet.address);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // _verifyPublicKeyArg edge cases (tested via createUserDecrypt)
  //////////////////////////////////////////////////////////////////////////////

  describe('publicKey argument handling', () => {
    let kms: KmsEIP712BuilderImpl;

    beforeEach(() => {
      kms = createKmsEIP712Builder(createValidParams());
    });

    it('throws for null publicKey', () => {
      const message = {
        ...createValidMessage(),
        publicKey: null,
      };

      expect(() => kms.createUserDecrypt(message as any)).toThrow(
        'Missing publicKey argument.',
      );
    });

    it('throws for undefined publicKey', () => {
      const message = {
        ...createValidMessage(),
        publicKey: undefined,
      };

      expect(() => kms.createUserDecrypt(message as any)).toThrow(
        'Missing publicKey argument.',
      );
    });

    it('accepts object with publicKey property', () => {
      const message = {
        ...createValidMessage(),
        publicKey: { publicKey: VALID_PUBLIC_KEY },
      };

      const eip712 = kms.createUserDecrypt(message as any);

      expect(eip712.message.publicKey).toBe(VALID_PUBLIC_KEY);
    });

    it('accepts Uint8Array publicKey', () => {
      const publicKeyBytes = new Uint8Array([0xab, 0xcd, 0xef]);
      const message = {
        ...createValidMessage(),
        publicKey: publicKeyBytes,
      };

      const eip712 = kms.createUserDecrypt(message as any);

      expect(eip712.message.publicKey).toBe('0xabcdef');
    });

    it('accepts string publicKey without 0x prefix', () => {
      const message = {
        ...createValidMessage(),
        publicKey: 'abcdef1234567890',
      };

      const eip712 = kms.createUserDecrypt(message as any);

      expect(eip712.message.publicKey).toBe('0xabcdef1234567890');
    });

    it('throws for invalid publicKey type (number)', () => {
      const message = {
        ...createValidMessage(),
        publicKey: 12345,
      };

      expect(() => kms.createUserDecrypt(message as any)).toThrow(
        'Invalid publicKey argument.',
      );
    });

    it('throws for invalid publicKey type (boolean)', () => {
      const message = {
        ...createValidMessage(),
        publicKey: true,
      };

      expect(() => kms.createUserDecrypt(message as any)).toThrow(
        'Invalid publicKey argument.',
      );
    });
  });
});
