import type { BytesHex, ChecksummedAddress } from '../../base/types/primitives';
import { KmsEIP712 } from './KmsEIP712';
import { InvalidTypeError } from '../../errors/InvalidTypeError';
import { ChecksummedAddressError } from '../../errors/ChecksummedAddressError';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/sdk/kms/KmsEIP712.test.ts
// npx jest --colors --passWithNoTests ./src/sdk/kms/KmsEIP712.test.ts --testNamePattern=xxx
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
      const kms = new KmsEIP712(createValidParams());

      expect(kms).toBeInstanceOf(KmsEIP712);
    });

    it('sets domain correctly', () => {
      const kms = new KmsEIP712(createValidParams());

      expect(kms.domain.name).toBe('Decryption');
      expect(kms.domain.version).toBe('1');
      expect(kms.domain.chainId).toBe(VALID_CHAIN_ID);
      expect(kms.domain.verifyingContract).toBe(VALID_VERIFYING_CONTRACT);
    });

    it('freezes domain object', () => {
      const kms = new KmsEIP712(createValidParams());

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

      expect(() => new KmsEIP712(params)).toThrow(InvalidTypeError);
    });

    it('throws for non-number chainId', () => {
      const params = {
        ...createValidParams(),
        chainId: 'invalid',
      };

      expect(() => new KmsEIP712(params as any)).toThrow(InvalidTypeError);
    });

    it('throws for chainId exceeding uint32 max', () => {
      const params = {
        ...createValidParams(),
        chainId: 4294967296n, // 2^32
      };

      expect(() => new KmsEIP712(params)).toThrow(InvalidTypeError);
    });

    it('throws for invalid verifyingContract address', () => {
      const params = {
        ...createValidParams(),
        verifyingContractAddressDecryption: '0xinvalid',
      };

      expect(() => new KmsEIP712(params)).toThrow(ChecksummedAddressError);
    });

    it('throws for lowercase verifyingContract address', () => {
      const params = {
        ...createValidParams(),
        verifyingContractAddressDecryption:
          '0xf0ffdc93b7e186bc2f8cb3daa75d86d1930a433d',
      };

      expect(() => new KmsEIP712(params)).toThrow(ChecksummedAddressError);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Getters
  //////////////////////////////////////////////////////////////////////////////

  describe('getters', () => {
    let kms: KmsEIP712;

    beforeEach(() => {
      kms = new KmsEIP712(createValidParams());
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
    let kms: KmsEIP712;

    beforeEach(() => {
      kms = new KmsEIP712(createValidParams());
    });

    it('creates EIP712 object with valid message', () => {
      const eip712 = kms.createEIP712(createValidMessage());

      expect(eip712).toBeDefined();
      expect(eip712.domain).toBeDefined();
      expect(eip712.types).toBeDefined();
      expect(eip712.message).toBeDefined();
      expect(eip712.primaryType).toBe('UserDecryptRequestVerification');
    });

    it('copies domain to EIP712 object', () => {
      const eip712 = kms.createEIP712(createValidMessage());

      expect(eip712.domain.name).toBe('Decryption');
      expect(eip712.domain.version).toBe('1');
      expect(eip712.domain.chainId).toBe(VALID_CHAIN_ID);
      expect(eip712.domain.verifyingContract).toBe(VALID_VERIFYING_CONTRACT);
    });

    it('includes message fields in EIP712 object', () => {
      const message = createValidMessage();
      const eip712 = kms.createEIP712(message);

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
      const eip712 = kms.createEIP712(createValidMessage());

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

      const eip712 = kms.createEIP712(message);

      expect(eip712.message.contractAddresses).toEqual([]);
    });

    it('accepts multiple contractAddresses', () => {
      const message = {
        ...createValidMessage(),
        contractAddresses: [VALID_CONTRACT_ADDRESS, VALID_DELEGATED_ACCOUNT],
      };

      const eip712 = kms.createEIP712(message);

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

      const eip712 = kms.createEIP712(message);

      expect(eip712.message.extraData).toBe('0x');
    });

    it('accepts bigint startTimestamp', () => {
      const message = {
        ...createValidMessage(),
        startTimestamp: BigInt(VALID_START_TIMESTAMP),
      };

      const eip712 = kms.createEIP712(message);

      expect(eip712.message.startTimestamp).toBe(
        VALID_START_TIMESTAMP.toString(),
      );
    });

    it('accepts bigint durationDays', () => {
      const message = {
        ...createValidMessage(),
        durationDays: BigInt(VALID_DURATION_DAYS),
      };

      const eip712 = kms.createEIP712(message);

      expect(eip712.message.durationDays).toBe(VALID_DURATION_DAYS.toString());
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // createEIP712 - validation
  //////////////////////////////////////////////////////////////////////////////

  describe('createEIP712 validation', () => {
    let kms: KmsEIP712;

    beforeEach(() => {
      kms = new KmsEIP712(createValidParams());
    });

    it('throws for invalid publicKey', () => {
      const message = {
        ...createValidMessage(),
        publicKey: 'invalid',
      };

      expect(() => kms.createEIP712(message as any)).toThrow(InvalidTypeError);
    });

    it('throws for invalid contractAddresses', () => {
      const message = {
        ...createValidMessage(),
        contractAddresses: ['0xinvalid'] as any,
      };

      expect(() => kms.createEIP712(message)).toThrow(ChecksummedAddressError);
    });

    it('throws for negative startTimestamp', () => {
      const message = {
        ...createValidMessage(),
        startTimestamp: -1,
      };

      expect(() => kms.createEIP712(message)).toThrow(InvalidTypeError);
    });

    it('throws for negative durationDays', () => {
      const message = {
        ...createValidMessage(),
        durationDays: -1,
      };

      expect(() => kms.createEIP712(message)).toThrow(InvalidTypeError);
    });

    it('throws for invalid extraData', () => {
      const message = {
        ...createValidMessage(),
        extraData: 'invalid',
      };

      expect(() => kms.createEIP712(message as any)).toThrow(InvalidTypeError);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // createDelegateEIP712 - valid inputs
  //////////////////////////////////////////////////////////////////////////////

  describe('createDelegateEIP712', () => {
    let kms: KmsEIP712;

    beforeEach(() => {
      kms = new KmsEIP712(createValidParams());
    });

    it('creates delegate EIP712 object with valid message', () => {
      const eip712 = kms.createDelegateEIP712(createValidDelegateMessage());

      expect(eip712).toBeDefined();
      expect(eip712.domain).toBeDefined();
      expect(eip712.types).toBeDefined();
      expect(eip712.message).toBeDefined();
      expect(eip712.primaryType).toBe(
        'DelegatedUserDecryptRequestVerification',
      );
    });

    it('copies domain to delegate EIP712 object', () => {
      const eip712 = kms.createDelegateEIP712(createValidDelegateMessage());

      expect(eip712.domain.name).toBe('Decryption');
      expect(eip712.domain.version).toBe('1');
      expect(eip712.domain.chainId).toBe(VALID_CHAIN_ID);
      expect(eip712.domain.verifyingContract).toBe(VALID_VERIFYING_CONTRACT);
    });

    it('includes delegatedAccount in delegate EIP712 message', () => {
      const eip712 = kms.createDelegateEIP712(createValidDelegateMessage());

      expect(eip712.message.delegatedAccount).toBe(VALID_DELEGATED_ACCOUNT);
    });

    it('freezes delegate EIP712 object and its properties', () => {
      const eip712 = kms.createDelegateEIP712(createValidDelegateMessage());

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
    let kms: KmsEIP712;

    beforeEach(() => {
      kms = new KmsEIP712(createValidParams());
    });

    it('throws for invalid delegatedAccount', () => {
      const message = {
        ...createValidDelegateMessage(),
        delegatedAccount: '0xinvalid',
      };

      expect(() => kms.createDelegateEIP712(message as any)).toThrow(
        ChecksummedAddressError,
      );
    });

    it('throws for lowercase delegatedAccount', () => {
      const message = {
        ...createValidDelegateMessage(),
        delegatedAccount: '0x37ac010c1c566696326813b840319b58bb5840e4',
      };

      expect(() => kms.createDelegateEIP712(message as any)).toThrow(
        ChecksummedAddressError,
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // verify - validation
  //////////////////////////////////////////////////////////////////////////////

  describe('verify validation', () => {
    let kms: KmsEIP712;

    beforeEach(() => {
      kms = new KmsEIP712(createValidParams());
    });

    it('throws for invalid signatures array', () => {
      expect(() =>
        kms.verify(['0xinvalid'] as any, createValidMessage()),
      ).toThrow(InvalidTypeError);
    });

    it('accepts empty signatures array', () => {
      const result = kms.verify([], createValidMessage());

      expect(result).toEqual([]);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // verifyDelegate - validation
  //////////////////////////////////////////////////////////////////////////////

  describe('verifyDelegate validation', () => {
    let kms: KmsEIP712;

    beforeEach(() => {
      kms = new KmsEIP712(createValidParams());
    });

    it('throws for invalid signatures array', () => {
      expect(() =>
        kms.verifyDelegate(['0xinvalid'] as any, createValidDelegateMessage()),
      ).toThrow(InvalidTypeError);
    });

    it('accepts empty signatures array', () => {
      const result = kms.verifyDelegate([], createValidDelegateMessage());

      expect(result).toEqual([]);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Immutability
  //////////////////////////////////////////////////////////////////////////////

  describe('immutability', () => {
    it('domain is not affected by modifying original params', () => {
      const params = createValidParams();
      const kms = new KmsEIP712(params);

      (params as any).chainId = 999;

      expect(kms.chainId).toBe(VALID_CHAIN_ID);
    });

    it('createEIP712 copies contractAddresses array', () => {
      const kms = new KmsEIP712(createValidParams());
      const addresses = [VALID_CONTRACT_ADDRESS];
      const message = {
        ...createValidMessage(),
        contractAddresses: addresses,
      };

      const eip712 = kms.createEIP712(message);

      addresses.push(VALID_DELEGATED_ACCOUNT);

      expect(eip712.message.contractAddresses).toEqual([
        VALID_CONTRACT_ADDRESS,
      ]);
    });

    it('createDelegateEIP712 copies contractAddresses array', () => {
      const kms = new KmsEIP712(createValidParams());
      const addresses = [VALID_CONTRACT_ADDRESS];
      const message = {
        ...createValidDelegateMessage(),
        contractAddresses: addresses,
      };

      const eip712 = kms.createDelegateEIP712(message);

      addresses.push(VALID_DELEGATED_ACCOUNT);

      expect(eip712.message.contractAddresses).toEqual([
        VALID_CONTRACT_ADDRESS,
      ]);
    });
  });
});
