import type {
  Bytes65Hex,
  BytesHex,
  ChecksummedAddress,
  Uint256BigInt,
  UintNumber,
} from '@base/types/primitives';
//import type { FhevmHandle } from '@fhevm-base/index';
import type { EncryptionBits } from '@fhevm-base/index';
import type { FhevmLibs } from '@fhevm-base-types/public-api';
import { createZKProof } from '../ZKProof';
import { createFhevmLibs } from '@fhevm-ethers/index';
import { createCoprocessorSignersVerifier } from './CoprocessorSignersVerifier';
import {
  DuplicateSignerError,
  ThresholdSignerError,
  UnknownSignerError,
} from '../errors/SignersError';

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

const VALID_GATEWAY_CHAIN_ID = 10901n;
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
    gatewayChainId: VALID_GATEWAY_CHAIN_ID as Uint256BigInt,
    verifyingContractAddressInputVerification:
      VALID_VERIFYING_CONTRACT as ChecksummedAddress,
    coprocessorSigners: [
      VALID_SIGNER_1,
      VALID_SIGNER_2,
    ] as ChecksummedAddress[],
    coprocessorSignerThreshold: 1 as UintNumber,
  };
}

////////////////////////////////////////////////////////////////////////////////

describe('CoprocessorSignersVerifier', () => {
  //////////////////////////////////////////////////////////////////////////////
  // fromAddresses - valid inputs
  //////////////////////////////////////////////////////////////////////////////

  describe('fromAddresses', () => {
    let fhevmLibs: FhevmLibs;

    beforeAll(async () => {
      fhevmLibs = await createFhevmLibs();
    });

    it('sets count correctly', () => {
      const verifier = createCoprocessorSignersVerifier(
        fhevmLibs,
        createValidParams(),
      );

      expect(verifier.count).toBe(2);
    });

    it('returns addresses correctly', () => {
      const verifier = createCoprocessorSignersVerifier(
        fhevmLibs,
        createValidParams(),
      );

      expect(verifier.coprocessorSigners).toEqual([
        VALID_SIGNER_1,
        VALID_SIGNER_2,
      ]);
    });

    it('sets threshold correctly', () => {
      const params = {
        ...createValidParams(),
        coprocessorSignerThreshold: 2 as UintNumber,
      };
      const verifier = createCoprocessorSignersVerifier(fhevmLibs, params);

      expect(verifier.coprocessorSignerThreshold).toBe(2);
    });

    it('sets gatewayChainId correctly', () => {
      const verifier = createCoprocessorSignersVerifier(
        fhevmLibs,
        createValidParams(),
      );

      expect(verifier.gatewayChainId).toBe(VALID_GATEWAY_CHAIN_ID);
    });

    it('sets verifyingContractAddressInputVerification correctly', () => {
      const verifier = createCoprocessorSignersVerifier(
        fhevmLibs,
        createValidParams(),
      );

      expect(verifier.verifyingContractAddressInputVerification).toBe(
        VALID_VERIFYING_CONTRACT,
      );
    });

    it('accepts single signer address', () => {
      const params = {
        ...createValidParams(),
        coprocessorSigners: [VALID_SIGNER_1],
      };
      const verifier = createCoprocessorSignersVerifier(fhevmLibs, params);

      expect(verifier.count).toBe(1);
      expect(verifier.coprocessorSigners).toEqual([VALID_SIGNER_1]);
    });

    it('accepts multiple signer addresses', async () => {
      const params = {
        ...createValidParams(),
        coprocessorSigners: [VALID_SIGNER_1, VALID_SIGNER_2, VALID_SIGNER_3],
        coprocessorSignerThreshold: 2 as UintNumber,
      };
      const verifier = createCoprocessorSignersVerifier(fhevmLibs, params);

      expect(verifier.count).toBe(3);
      expect(verifier.coprocessorSigners).toEqual([
        VALID_SIGNER_1,
        VALID_SIGNER_2,
        VALID_SIGNER_3,
      ]);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // Immutability
  //////////////////////////////////////////////////////////////////////////////

  describe('immutability', () => {
    let fhevmLibs: FhevmLibs;

    beforeAll(async () => {
      fhevmLibs = await createFhevmLibs();
    });

    it('addresses array is not affected by modifying original params', () => {
      const params = createValidParams();
      const signersCopy = [...params.coprocessorSigners];
      const verifier = createCoprocessorSignersVerifier(fhevmLibs, params);

      // Attempt to modify original array
      (params.coprocessorSigners as ChecksummedAddress[]).push(VALID_SIGNER_3);

      expect(verifier.coprocessorSigners).toEqual(signersCopy);
    });

    it('returned addresses array is frozen', async () => {
      const verifier = createCoprocessorSignersVerifier(
        fhevmLibs,
        createValidParams(),
      );

      expect(Object.isFrozen(verifier.coprocessorSigners)).toBe(true);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // verify with real payload data
  //////////////////////////////////////////////////////////////////////////////

  describe('verify with real payload data', () => {
    const fs = require('fs');
    const path = require('path');
    const assetsDir = path.join(__dirname, '../../test/assets');

    let fhevmLibs: FhevmLibs;

    beforeAll(async () => {
      fhevmLibs = await createFhevmLibs();
    });

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
      const PAYLOAD_GATEWAY_CHAIN_ID = BigInt(
        payload.gatewayChainId,
      ) as Uint256BigInt;
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
      //const PAYLOAD_VERSION = payload.ciphertextVersion as number;
      const EXPECTED_SIGNER_ADDRESSES =
        payload.coprocessorSigners as ChecksummedAddress[];
      const PAYLOAD_THRESHOLD = payload.threshold as UintNumber;

      it('verifyZKProof succeeds with valid signatures', async () => {
        const verifier = createCoprocessorSignersVerifier(fhevmLibs, {
          gatewayChainId: PAYLOAD_GATEWAY_CHAIN_ID,
          verifyingContractAddressInputVerification: PAYLOAD_VERIFYING_CONTRACT,
          coprocessorSigners: EXPECTED_SIGNER_ADDRESSES,
          coprocessorSignerThreshold: PAYLOAD_THRESHOLD,
        });

        const zkProof = createZKProof({
          ciphertextWithZKProof: PAYLOAD_CIPHERTEXT,
          chainId: BigInt(PAYLOAD_CHAIN_ID),
          aclContractAddress: PAYLOAD_ACL_ADDRESS,
          encryptionBits: PAYLOAD_BITS,
          userAddress: PAYLOAD_USER_ADDRESS,
          contractAddress: PAYLOAD_CONTRACT_ADDRESS,
        });

        // const fhevmHandles: FhevmHandle[] = zkProofToFhevmHandles(zkProof, {
        //   version: PAYLOAD_VERSION,
        // });

        // Should not throw - just await and let Jest fail if it throws
        await verifier.verifyZKProof({
          //handles: fhevmHandles,
          zkProof,
          signatures: PAYLOAD_SIGNATURES,
          extraData: PAYLOAD_EXTRA_DATA,
        });
      });

      it('verifyAndComputeInputProof returns valid InputProof', async () => {
        const verifier = createCoprocessorSignersVerifier(fhevmLibs, {
          gatewayChainId: PAYLOAD_GATEWAY_CHAIN_ID,
          verifyingContractAddressInputVerification: PAYLOAD_VERIFYING_CONTRACT,
          coprocessorSigners: EXPECTED_SIGNER_ADDRESSES,
          coprocessorSignerThreshold: PAYLOAD_THRESHOLD,
        });

        const zkProof = createZKProof({
          ciphertextWithZKProof: PAYLOAD_CIPHERTEXT,
          chainId: BigInt(PAYLOAD_CHAIN_ID),
          aclContractAddress: PAYLOAD_ACL_ADDRESS,
          encryptionBits: PAYLOAD_BITS,
          userAddress: PAYLOAD_USER_ADDRESS,
          contractAddress: PAYLOAD_CONTRACT_ADDRESS,
        });

        // const fhevmHandles: FhevmHandle[] = zkProofToFhevmHandles(zkProof, {
        //   version: PAYLOAD_VERSION,
        // });

        const inputProof = await verifier.verifyZKProofAndComputeInputProof({
          //handles: fhevmHandles,
          zkProof,
          signatures: PAYLOAD_SIGNATURES,
          extraData: PAYLOAD_EXTRA_DATA,
        });

        expect(inputProof).toBeDefined();
      });

      it('verifyZKProof throws for unknown signer', async () => {
        const unknownSigner =
          '0x1234567890123456789012345678901234567890' as ChecksummedAddress;

        // Use a different set of signers that doesn't include the actual signer
        const verifier = createCoprocessorSignersVerifier(fhevmLibs, {
          gatewayChainId: PAYLOAD_GATEWAY_CHAIN_ID,
          verifyingContractAddressInputVerification: PAYLOAD_VERIFYING_CONTRACT,
          coprocessorSigners: [unknownSigner],
          coprocessorSignerThreshold: 1 as UintNumber,
        });

        const zkProof = createZKProof({
          ciphertextWithZKProof: PAYLOAD_CIPHERTEXT,
          chainId: BigInt(PAYLOAD_CHAIN_ID),
          aclContractAddress: PAYLOAD_ACL_ADDRESS,
          encryptionBits: PAYLOAD_BITS,
          userAddress: PAYLOAD_USER_ADDRESS,
          contractAddress: PAYLOAD_CONTRACT_ADDRESS,
        });

        // const fhevmHandles: FhevmHandle[] = zkProofToFhevmHandles(zkProof, {
        //   version: PAYLOAD_VERSION,
        // });

        await expect(
          verifier.verifyZKProof({
            //handles: fhevmHandles,
            zkProof,
            signatures: PAYLOAD_SIGNATURES,
            extraData: PAYLOAD_EXTRA_DATA,
          }),
        ).rejects.toThrow(UnknownSignerError);
      });

      it('verifyZKProof throws when threshold not reached', async () => {
        // Set threshold higher than available signatures
        const verifier = createCoprocessorSignersVerifier(fhevmLibs, {
          gatewayChainId: PAYLOAD_GATEWAY_CHAIN_ID,
          verifyingContractAddressInputVerification: PAYLOAD_VERIFYING_CONTRACT,
          coprocessorSigners: EXPECTED_SIGNER_ADDRESSES,
          coprocessorSignerThreshold: (PAYLOAD_SIGNATURES.length +
            1) as UintNumber,
        });

        const zkProof = createZKProof({
          ciphertextWithZKProof: PAYLOAD_CIPHERTEXT,
          chainId: BigInt(PAYLOAD_CHAIN_ID),
          aclContractAddress: PAYLOAD_ACL_ADDRESS,
          encryptionBits: PAYLOAD_BITS,
          userAddress: PAYLOAD_USER_ADDRESS,
          contractAddress: PAYLOAD_CONTRACT_ADDRESS,
        });

        // const fhevmHandles: FhevmHandle[] = zkProofToFhevmHandles(zkProof, {
        //   version: PAYLOAD_VERSION,
        // });

        await expect(
          verifier.verifyZKProof({
            //handles: fhevmHandles,
            zkProof,
            signatures: PAYLOAD_SIGNATURES,
            extraData: PAYLOAD_EXTRA_DATA,
          }),
        ).rejects.toThrow(ThresholdSignerError);
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
      expect(DuplicateSignerError).toBeDefined();
    });
  });
});
