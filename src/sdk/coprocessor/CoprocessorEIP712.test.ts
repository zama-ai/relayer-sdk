import type {
  Bytes32Hex,
  Bytes65Hex,
  BytesHex,
  ChecksummedAddress,
  EncryptionBits,
} from '../../base/types/primitives';
import { CoprocessorEIP712 } from './CoprocessorEIP712';
import { InvalidTypeError } from '../../errors/InvalidTypeError';
import { ChecksummedAddressError } from '../../errors/ChecksummedAddressError';
import { ZKProof } from '../ZKProof';
import { FhevmHandle } from '../FhevmHandle';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/sdk/coprocessor/CoprocessorEIP712.test.ts
// npx jest --colors --passWithNoTests ./src/sdk/coprocessor/CoprocessorEIP712.test.ts --testNamePattern=xxx
//
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Test Constants
////////////////////////////////////////////////////////////////////////////////

const VALID_GATEWAY_CHAIN_ID = 10901;
const VALID_VERIFYING_CONTRACT =
  '0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D' as ChecksummedAddress;
const VALID_USER_ADDRESS =
  '0x37AC010c1c566696326813b840319B58Bb5840E4' as ChecksummedAddress;
const VALID_CONTRACT_ADDRESS =
  '0x9aF5773d8dC3d9A57c92e08EF024804eC39FD3b3' as ChecksummedAddress;
const VALID_HANDLE =
  '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef' as Bytes32Hex;
const VALID_EXTRA_DATA = '0xabcdef' as BytesHex;

function createValidParams() {
  return {
    gatewayChainId: VALID_GATEWAY_CHAIN_ID,
    verifyingContractAddressInputVerification: VALID_VERIFYING_CONTRACT,
  };
}

function createValidMessage() {
  return {
    ctHandles: [VALID_HANDLE] as readonly Bytes32Hex[],
    userAddress: VALID_USER_ADDRESS,
    contractAddress: VALID_CONTRACT_ADDRESS,
    contractChainId: VALID_GATEWAY_CHAIN_ID,
    extraData: VALID_EXTRA_DATA,
  };
}

////////////////////////////////////////////////////////////////////////////////

describe('CoprocessorEIP712', () => {
  //////////////////////////////////////////////////////////////////////////////
  // Constructor - valid inputs
  //////////////////////////////////////////////////////////////////////////////

  describe('constructor', () => {
    it('creates instance with valid params', () => {
      const coprocessor = new CoprocessorEIP712(createValidParams());

      expect(coprocessor).toBeInstanceOf(CoprocessorEIP712);
    });

    it('sets domain correctly', () => {
      const coprocessor = new CoprocessorEIP712(createValidParams());

      expect(coprocessor.domain.name).toBe('InputVerification');
      expect(coprocessor.domain.version).toBe('1');
      expect(coprocessor.domain.chainId).toBe(VALID_GATEWAY_CHAIN_ID);
      expect(coprocessor.domain.verifyingContract).toBe(
        VALID_VERIFYING_CONTRACT,
      );
    });

    it('freezes domain object', () => {
      const coprocessor = new CoprocessorEIP712(createValidParams());

      expect(Object.isFrozen(coprocessor.domain)).toBe(true);
    });

    it('accepts bigint chainId', () => {
      const bigintChainId = BigInt(VALID_GATEWAY_CHAIN_ID);
      const params = {
        ...createValidParams(),
        gatewayChainId: bigintChainId,
      };

      const coprocessor = new CoprocessorEIP712(params as any);

      expect(coprocessor.gatewayChainId).toBe(bigintChainId);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Constructor - invalid inputs
  //////////////////////////////////////////////////////////////////////////////

  describe('constructor validation', () => {
    it('throws for negative chainId', () => {
      const params = {
        ...createValidParams(),
        gatewayChainId: -1,
      };

      expect(() => new CoprocessorEIP712(params)).toThrow(InvalidTypeError);
    });

    it('throws for non-number chainId', () => {
      const params = {
        ...createValidParams(),
        gatewayChainId: 'invalid',
      };

      expect(() => new CoprocessorEIP712(params as any)).toThrow(
        InvalidTypeError,
      );
    });

    it('throws for invalid verifyingContract address', () => {
      const params = {
        ...createValidParams(),
        verifyingContractAddressInputVerification: '0xinvalid',
      };

      expect(() => new CoprocessorEIP712(params)).toThrow(
        ChecksummedAddressError,
      );
    });

    it('throws for lowercase verifyingContract address', () => {
      const params = {
        ...createValidParams(),
        verifyingContractAddressInputVerification:
          '0xf0ffdc93b7e186bc2f8cb3daa75d86d1930a433d',
      };

      expect(() => new CoprocessorEIP712(params)).toThrow(
        ChecksummedAddressError,
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Getters
  //////////////////////////////////////////////////////////////////////////////

  describe('getters', () => {
    let coprocessor: CoprocessorEIP712;

    beforeEach(() => {
      coprocessor = new CoprocessorEIP712(createValidParams());
    });

    it('gatewayChainId returns chainId from domain', () => {
      expect(coprocessor.gatewayChainId).toBe(VALID_GATEWAY_CHAIN_ID);
    });

    it('verifyingContractAddressInputVerification returns verifyingContract from domain', () => {
      expect(coprocessor.verifyingContractAddressInputVerification).toBe(
        VALID_VERIFYING_CONTRACT,
      );
    });

    it('types returns CiphertextVerification type definition', () => {
      const types = coprocessor.types;

      expect(types).toHaveProperty('CiphertextVerification');
      expect(types.CiphertextVerification).toEqual([
        { name: 'ctHandles', type: 'bytes32[]' },
        { name: 'userAddress', type: 'address' },
        { name: 'contractAddress', type: 'address' },
        { name: 'contractChainId', type: 'uint256' },
        { name: 'extraData', type: 'bytes' },
      ]);
    });

    it('types is frozen', () => {
      const types = coprocessor.types;

      expect(Object.isFrozen(types)).toBe(true);
      expect(Object.isFrozen(types.CiphertextVerification)).toBe(true);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // createEIP712 - valid inputs
  //////////////////////////////////////////////////////////////////////////////

  describe('createEIP712', () => {
    let coprocessor: CoprocessorEIP712;

    beforeEach(() => {
      coprocessor = new CoprocessorEIP712(createValidParams());
    });

    it('creates EIP712 object with valid message', () => {
      const eip712 = coprocessor.createEIP712(createValidMessage());

      expect(eip712).toBeDefined();
      expect(eip712.domain).toBeDefined();
      expect(eip712.types).toBeDefined();
      expect(eip712.message).toBeDefined();
    });

    it('copies domain to EIP712 object', () => {
      const eip712 = coprocessor.createEIP712(createValidMessage());

      expect(eip712.domain.name).toBe('InputVerification');
      expect(eip712.domain.version).toBe('1');
      expect(eip712.domain.chainId).toBe(VALID_GATEWAY_CHAIN_ID);
      expect(eip712.domain.verifyingContract).toBe(VALID_VERIFYING_CONTRACT);
    });

    it('includes message fields in EIP712 object', () => {
      const message = createValidMessage();
      const eip712 = coprocessor.createEIP712(message);

      expect(eip712.message.ctHandles).toEqual([VALID_HANDLE]);
      expect(eip712.message.userAddress).toBe(VALID_USER_ADDRESS);
      expect(eip712.message.contractAddress).toBe(VALID_CONTRACT_ADDRESS);
      expect(eip712.message.contractChainId).toBe(VALID_GATEWAY_CHAIN_ID);
      expect(eip712.message.extraData).toBe(VALID_EXTRA_DATA);
    });

    it('freezes EIP712 object and its properties', () => {
      const eip712 = coprocessor.createEIP712(createValidMessage());

      expect(Object.isFrozen(eip712)).toBe(true);
      expect(Object.isFrozen(eip712.domain)).toBe(true);
      expect(Object.isFrozen(eip712.types)).toBe(true);
      expect(Object.isFrozen(eip712.types.CiphertextVerification)).toBe(true);
      expect(Object.isFrozen(eip712.message)).toBe(true);
      expect(Object.isFrozen(eip712.message.ctHandles)).toBe(true);
    });

    it('accepts empty ctHandles array', () => {
      const message = {
        ...createValidMessage(),
        ctHandles: [] as readonly Bytes32Hex[],
      };

      const eip712 = coprocessor.createEIP712(message);

      expect(eip712.message.ctHandles).toEqual([]);
    });

    it('accepts multiple ctHandles', () => {
      const handle2 =
        '0x1234567812345678123456781234567812345678123456781234567812345678' as Bytes32Hex;
      const message = {
        ...createValidMessage(),
        ctHandles: [VALID_HANDLE, handle2],
      };

      const eip712 = coprocessor.createEIP712(message);

      expect(eip712.message.ctHandles).toEqual([VALID_HANDLE, handle2]);
    });

    it('accepts empty extraData', () => {
      const message = {
        ...createValidMessage(),
        extraData: '0x' as BytesHex,
      };

      const eip712 = coprocessor.createEIP712(message);

      expect(eip712.message.extraData).toBe('0x');
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // createEIP712 - validation
  //////////////////////////////////////////////////////////////////////////////

  describe('createEIP712 validation', () => {
    let coprocessor: CoprocessorEIP712;

    beforeEach(() => {
      coprocessor = new CoprocessorEIP712(createValidParams());
    });

    it('throws for invalid ctHandles', () => {
      const message = {
        ...createValidMessage(),
        ctHandles: ['0xinvalid'] as any,
      };

      expect(() => coprocessor.createEIP712(message)).toThrow(InvalidTypeError);
    });

    it('throws for invalid userAddress', () => {
      const message = {
        ...createValidMessage(),
        userAddress: '0xinvalid',
      };

      expect(() => coprocessor.createEIP712(message as any)).toThrow(
        ChecksummedAddressError,
      );
    });

    it('throws for invalid contractAddress', () => {
      const message = {
        ...createValidMessage(),
        contractAddress: '0xinvalid',
      };

      expect(() => coprocessor.createEIP712(message as any)).toThrow(
        ChecksummedAddressError,
      );
    });

    it('throws for invalid contractChainId', () => {
      const message = {
        ...createValidMessage(),
        contractChainId: -1,
      };

      expect(() => coprocessor.createEIP712(message)).toThrow(InvalidTypeError);
    });

    it('throws for invalid extraData', () => {
      const message = {
        ...createValidMessage(),
        extraData: 'invalid',
      };

      expect(() => coprocessor.createEIP712(message as any)).toThrow(
        InvalidTypeError,
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // verify - validation
  //////////////////////////////////////////////////////////////////////////////

  describe('verify validation', () => {
    let coprocessor: CoprocessorEIP712;

    beforeEach(() => {
      coprocessor = new CoprocessorEIP712(createValidParams());
    });

    it('throws for invalid signatures array', () => {
      expect(() =>
        coprocessor.verify({
          signatures: ['0xinvalid'] as any,
          message: createValidMessage(),
        }),
      ).toThrow(InvalidTypeError);
    });

    it('accepts empty signatures array', () => {
      const result = coprocessor.verify({
        signatures: [],
        message: createValidMessage(),
      });

      expect(result).toEqual([]);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // verify - real payload data
  //////////////////////////////////////////////////////////////////////////////

  describe('verify with real payload data', () => {
    const fs = require('fs');
    const path = require('path');
    const assetsDir = path.join(__dirname, '../../test/assets');

    // Find all input-proof-payload-*.json files
    const payloadFiles = fs
      .readdirSync(assetsDir)
      .filter(
        (file: string) =>
          file.startsWith('input-proof-payload-') && file.endsWith('.json'),
      )
      .sort();

    describe.each<string>(payloadFiles)('%s', (payloadFile) => {
      const payloadPath = path.join(assetsDir, payloadFile);
      const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf-8'));

      const PAYLOAD_CHAIN_ID = payload.chainId;
      const PAYLOAD_GATEWAY_CHAIN_ID = payload.gatewayChainId;
      const PAYLOAD_VERIFYING_CONTRACT =
        payload.verifyingContractAddressInputVerification as ChecksummedAddress;
      const PAYLOAD_USER_ADDRESS = payload.userAddress as ChecksummedAddress;
      const PAYLOAD_ACL_ADDRESS = payload.aclAddress as ChecksummedAddress;
      const PAYLOAD_CONTRACT_ADDRESS =
        payload.contractAddress as ChecksummedAddress;
      const PAYLOAD_CIPHERTEXT = payload.ciphertextWithInputVerification;
      const PAYLOAD_HANDLES = payload.fetch_json.response
        .handles as Bytes32Hex[];
      const PAYLOAD_SIGNATURES = payload.fetch_json.response
        .signatures as Bytes65Hex[];
      const PAYLOAD_BITS =
        payload.fheTypeEncryptionBitwidths as EncryptionBits[];
      const PAYLOAD_EXTRA_DATA = '0x00' as BytesHex;
      const PAYLOAD_VERSION = payload.ciphertextVersion as number;
      const EXPECTED_SIGNER_ADDRESSES =
        payload.coprocessorSigners as ChecksummedAddress[];

      it('recovers correct signer address from real payload signature', () => {
        const coprocessorEIP712 = new CoprocessorEIP712({
          gatewayChainId: PAYLOAD_GATEWAY_CHAIN_ID,
          verifyingContractAddressInputVerification: PAYLOAD_VERIFYING_CONTRACT,
        });

        const zkProof = ZKProof.fromComponents({
          ciphertextWithZKProof: PAYLOAD_CIPHERTEXT,
          chainId: BigInt(PAYLOAD_CHAIN_ID),
          aclContractAddress: PAYLOAD_ACL_ADDRESS,
          encryptionBits: PAYLOAD_BITS,
          userAddress: PAYLOAD_USER_ADDRESS,
          contractAddress: PAYLOAD_CONTRACT_ADDRESS,
        });

        const fhevmHandles: FhevmHandle[] = FhevmHandle.fromZKProof(
          zkProof,
          PAYLOAD_VERSION,
        );

        // Verify computed handles match the payload handles
        const computedHandles = fhevmHandles.map((h) => h.toBytes32Hex());
        expect(computedHandles).toEqual(PAYLOAD_HANDLES);

        const message = {
          ctHandles: PAYLOAD_HANDLES as readonly Bytes32Hex[],
          userAddress: PAYLOAD_USER_ADDRESS,
          contractAddress: PAYLOAD_CONTRACT_ADDRESS,
          contractChainId: PAYLOAD_CHAIN_ID,
          extraData: PAYLOAD_EXTRA_DATA,
        };

        const recoveredAddresses = coprocessorEIP712.verify({
          signatures: PAYLOAD_SIGNATURES,
          message,
        });

        expect(recoveredAddresses).toHaveLength(
          EXPECTED_SIGNER_ADDRESSES.length,
        );
        expect(recoveredAddresses[0]).toBe(EXPECTED_SIGNER_ADDRESSES[0]);
      });
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Immutability
  //////////////////////////////////////////////////////////////////////////////

  describe('immutability', () => {
    it('domain is not affected by modifying original params', () => {
      const params = createValidParams();
      const coprocessor = new CoprocessorEIP712(params);

      // Attempt to modify params (would have no effect anyway due to value copy)
      (params as any).gatewayChainId = 999;

      expect(coprocessor.gatewayChainId).toBe(VALID_GATEWAY_CHAIN_ID);
    });

    it('createEIP712 copies ctHandles array', () => {
      const coprocessor = new CoprocessorEIP712(createValidParams());
      const handles = [VALID_HANDLE];
      const message = {
        ...createValidMessage(),
        ctHandles: handles,
      };

      const eip712 = coprocessor.createEIP712(message);

      // Original array modification should not affect EIP712
      handles.push(
        '0x1111111111111111111111111111111111111111111111111111111111111111' as Bytes32Hex,
      );

      expect(eip712.message.ctHandles).toEqual([VALID_HANDLE]);
    });
  });
});
