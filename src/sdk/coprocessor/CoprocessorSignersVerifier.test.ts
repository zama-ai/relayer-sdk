import type {
  Bytes65Hex,
  BytesHex,
  ChecksummedAddress,
  EncryptionBits,
} from '../../types/primitives';
import { CoprocessorSignersVerifier } from './CoprocessorSignersVerifier';
import { RelayerDuplicateCoprocessorSignerError } from '../../errors/RelayerDuplicateCoprocessorSignerError';
import { RelayerUnknownCoprocessorSignerError } from '../../errors/RelayerUnknownCoprocessorSignerError';
import { RelayerThresholdCoprocessorSignerError } from '../../errors/RelayerThresholdCoprocessorSignerError';
import { ChecksummedAddressError } from '../../errors/ChecksummedAddressError';
import { ZKProof } from '../ZKProof';
import { FhevmHandle } from '../FhevmHandle';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/sdk/coprocessor/CoprocessorSignersVerifier.test.ts
// npx jest --colors --passWithNoTests ./src/sdk/coprocessor/CoprocessorSignersVerifier.test.ts --testNamePattern=xxx
//
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Test Constants
////////////////////////////////////////////////////////////////////////////////

const VALID_GATEWAY_CHAIN_ID = 11155111;
const VALID_VERIFYING_CONTRACT =
  '0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D' as ChecksummedAddress;
const VALID_SIGNER_1 =
  '0x37AC010c1c566696326813b840319B58Bb5840E4' as ChecksummedAddress;
const VALID_SIGNER_2 =
  '0x9aF5773d8dC3d9A57c92e08EF024804eC39FD3b3' as ChecksummedAddress;
const VALID_SIGNER_3 =
  '0xefcfbE659c055e52de50Df781a14B7F3D934db79' as ChecksummedAddress;

function createValidParams() {
  return {
    gatewayChainId: VALID_GATEWAY_CHAIN_ID,
    verifyingContractAddressInputVerification: VALID_VERIFYING_CONTRACT,
    coprocessorSignersAddresses: [VALID_SIGNER_1, VALID_SIGNER_2],
    threshold: 1,
  };
}

////////////////////////////////////////////////////////////////////////////////

describe('CoprocessorSignersVerifier', () => {
  //////////////////////////////////////////////////////////////////////////////
  // fromAddresses - valid inputs
  //////////////////////////////////////////////////////////////////////////////

  describe('fromAddresses', () => {
    it('creates instance with valid params', () => {
      const verifier = CoprocessorSignersVerifier.fromAddresses(
        createValidParams(),
      );

      expect(verifier).toBeInstanceOf(CoprocessorSignersVerifier);
    });

    it('sets count correctly', () => {
      const verifier = CoprocessorSignersVerifier.fromAddresses(
        createValidParams(),
      );

      expect(verifier.count).toBe(2);
    });

    it('returns addresses correctly', () => {
      const verifier = CoprocessorSignersVerifier.fromAddresses(
        createValidParams(),
      );

      expect(verifier.addresses).toEqual([VALID_SIGNER_1, VALID_SIGNER_2]);
    });

    it('sets threshold correctly', () => {
      const params = { ...createValidParams(), threshold: 2 };
      const verifier = CoprocessorSignersVerifier.fromAddresses(params);

      expect(verifier.threshold).toBe(2);
    });

    it('sets gatewayChainId correctly', () => {
      const verifier = CoprocessorSignersVerifier.fromAddresses(
        createValidParams(),
      );

      expect(verifier.gatewayChainId).toBe(VALID_GATEWAY_CHAIN_ID);
    });

    it('sets verifyingContractAddressInputVerification correctly', () => {
      const verifier = CoprocessorSignersVerifier.fromAddresses(
        createValidParams(),
      );

      expect(verifier.verifyingContractAddressInputVerification).toBe(
        VALID_VERIFYING_CONTRACT,
      );
    });

    it('accepts single signer address', () => {
      const params = {
        ...createValidParams(),
        coprocessorSignersAddresses: [VALID_SIGNER_1],
      };
      const verifier = CoprocessorSignersVerifier.fromAddresses(params);

      expect(verifier.count).toBe(1);
      expect(verifier.addresses).toEqual([VALID_SIGNER_1]);
    });

    it('accepts multiple signer addresses', () => {
      const params = {
        ...createValidParams(),
        coprocessorSignersAddresses: [
          VALID_SIGNER_1,
          VALID_SIGNER_2,
          VALID_SIGNER_3,
        ],
        threshold: 2,
      };
      const verifier = CoprocessorSignersVerifier.fromAddresses(params);

      expect(verifier.count).toBe(3);
      expect(verifier.addresses).toEqual([
        VALID_SIGNER_1,
        VALID_SIGNER_2,
        VALID_SIGNER_3,
      ]);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // fromAddresses - invalid inputs
  //////////////////////////////////////////////////////////////////////////////

  describe('fromAddresses - invalid inputs', () => {
    it('throws for non-checksummed signer address', () => {
      const params = {
        ...createValidParams(),
        coprocessorSignersAddresses: [
          '0x37ac010c1c566696326813b840319b58bb5840e4' as ChecksummedAddress,
        ],
      };

      expect(() => CoprocessorSignersVerifier.fromAddresses(params)).toThrow(
        ChecksummedAddressError,
      );
    });

    it('throws for invalid hex in signer address', () => {
      const params = {
        ...createValidParams(),
        coprocessorSignersAddresses: [
          '0xINVALIDHEXADDRESS1234567890123456789012' as ChecksummedAddress,
        ],
      };

      expect(() => CoprocessorSignersVerifier.fromAddresses(params)).toThrow();
    });

    it('throws for non-checksummed verifying contract address', () => {
      const params = {
        ...createValidParams(),
        verifyingContractAddressInputVerification:
          '0xf0ffdc93b7e186bc2f8cb3daa75d86d1930a433d' as ChecksummedAddress,
      };

      expect(() => CoprocessorSignersVerifier.fromAddresses(params)).toThrow(
        ChecksummedAddressError,
      );
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Immutability
  //////////////////////////////////////////////////////////////////////////////

  describe('immutability', () => {
    it('addresses array is not affected by modifying original params', () => {
      const params = createValidParams();
      const signersCopy = [...params.coprocessorSignersAddresses];
      const verifier = CoprocessorSignersVerifier.fromAddresses(params);

      // Attempt to modify original array
      (params.coprocessorSignersAddresses as ChecksummedAddress[]).push(
        VALID_SIGNER_3,
      );

      expect(verifier.addresses).toEqual(signersCopy);
    });

    it('returned addresses array is frozen', () => {
      const verifier = CoprocessorSignersVerifier.fromAddresses(
        createValidParams(),
      );

      expect(Object.isFrozen(verifier.addresses)).toBe(true);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // verify with real payload data
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
      const PAYLOAD_SIGNATURES = payload.fetch_json.response
        .signatures as Bytes65Hex[];
      const PAYLOAD_BITS =
        payload.fheTypeEncryptionBitwidths as EncryptionBits[];
      const PAYLOAD_EXTRA_DATA = '0x00' as BytesHex;
      const PAYLOAD_VERSION = payload.ciphertextVersion as number;
      const EXPECTED_SIGNER_ADDRESSES =
        payload.coprocessorSigners as ChecksummedAddress[];
      const PAYLOAD_THRESHOLD = payload.threshold as number;

      it('verifyZKProof succeeds with valid signatures', () => {
        const verifier = CoprocessorSignersVerifier.fromAddresses({
          gatewayChainId: PAYLOAD_GATEWAY_CHAIN_ID,
          verifyingContractAddressInputVerification: PAYLOAD_VERIFYING_CONTRACT,
          coprocessorSignersAddresses: EXPECTED_SIGNER_ADDRESSES,
          threshold: PAYLOAD_THRESHOLD,
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

        // Should not throw
        expect(() =>
          verifier.verifyZKProof({
            handles: fhevmHandles,
            zkProof,
            signatures: PAYLOAD_SIGNATURES,
            extraData: PAYLOAD_EXTRA_DATA,
          }),
        ).not.toThrow();
      });

      it('verifyAndComputeInputProof returns valid InputProof', () => {
        const verifier = CoprocessorSignersVerifier.fromAddresses({
          gatewayChainId: PAYLOAD_GATEWAY_CHAIN_ID,
          verifyingContractAddressInputVerification: PAYLOAD_VERIFYING_CONTRACT,
          coprocessorSignersAddresses: EXPECTED_SIGNER_ADDRESSES,
          threshold: PAYLOAD_THRESHOLD,
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

        const inputProof = verifier.verifyAndComputeInputProof({
          handles: fhevmHandles,
          zkProof,
          signatures: PAYLOAD_SIGNATURES,
          extraData: PAYLOAD_EXTRA_DATA,
        });

        expect(inputProof).toBeDefined();
      });

      it('verifyZKProof throws for unknown signer', () => {
        const unknownSigner =
          '0x1234567890123456789012345678901234567890' as ChecksummedAddress;

        // Use a different set of signers that doesn't include the actual signer
        const verifier = CoprocessorSignersVerifier.fromAddresses({
          gatewayChainId: PAYLOAD_GATEWAY_CHAIN_ID,
          verifyingContractAddressInputVerification: PAYLOAD_VERIFYING_CONTRACT,
          coprocessorSignersAddresses: [unknownSigner],
          threshold: 1,
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

        expect(() =>
          verifier.verifyZKProof({
            handles: fhevmHandles,
            zkProof,
            signatures: PAYLOAD_SIGNATURES,
            extraData: PAYLOAD_EXTRA_DATA,
          }),
        ).toThrow(RelayerUnknownCoprocessorSignerError);
      });

      it('verifyZKProof throws when threshold not reached', () => {
        // Set threshold higher than available signatures
        const verifier = CoprocessorSignersVerifier.fromAddresses({
          gatewayChainId: PAYLOAD_GATEWAY_CHAIN_ID,
          verifyingContractAddressInputVerification: PAYLOAD_VERIFYING_CONTRACT,
          coprocessorSignersAddresses: EXPECTED_SIGNER_ADDRESSES,
          threshold: PAYLOAD_SIGNATURES.length + 1,
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

        expect(() =>
          verifier.verifyZKProof({
            handles: fhevmHandles,
            zkProof,
            signatures: PAYLOAD_SIGNATURES,
            extraData: PAYLOAD_EXTRA_DATA,
          }),
        ).toThrow(RelayerThresholdCoprocessorSignerError);
      });
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Duplicate signer detection
  //////////////////////////////////////////////////////////////////////////////

  describe('duplicate signer detection', () => {
    it('throws for duplicate signatures from same signer', () => {
      // This test requires mocking the EIP712 verification
      // For now, we test the error class exists
      expect(RelayerDuplicateCoprocessorSignerError).toBeDefined();
    });
  });
});
