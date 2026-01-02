import type { RelayerProviderFetchOptions } from '@relayer-provider/AbstractRelayerProvider';
import type {
  RelayerInputProofOptions,
  RelayerInputProofPayload,
  RelayerInputProofResult,
} from '@relayer-provider/types/public-api';
import type { EncryptedInput } from '@sdk/encrypt';
import type { TFHEType } from '../tfheType';
import type {
  BytesHex,
  ChecksummedAddress,
  EncryptionBits,
  ZKProofType,
} from '@base/types/primitives';
import type { FhevmInstanceOptions } from '../types/relayer';
import { ethers, getAddress as ethersGetAddress } from 'ethers';
import { isChecksummedAddress } from '@base/address';
import { bytesToHexNo0x, hexToBytes } from '@base/bytes';
import { numberToBytesHexNo0x } from '@base/uint';
import { AbstractRelayerProvider } from '@relayer-provider/AbstractRelayerProvider';
import { createEncryptedInput } from '@sdk/encrypt';
import { FhevmHandle } from '@sdk/FhevmHandle';
import { ZKProof } from '@sdk/ZKProof';
import { CoprocessorSignersVerifier } from '@sdk/coprocessor/CoprocessorSignersVerifier';
import { throwRelayerInternalError } from './error';

////////////////////////////////////////////////////////////////////////////////

// Add type checking
const getAddress = (value: string): `0x${string}` =>
  ethersGetAddress(value) as `0x${string}`;

export const currentCiphertextVersion = () => {
  return 0;
};

////////////////////////////////////////////////////////////////////////////////

export async function requestCiphertextWithZKProofVerification({
  zkProof,
  coprocessorSignersVerifier,
  relayerProvider,
  extraData,
  options,
}: {
  zkProof: ZKProof;
  coprocessorSignersVerifier: CoprocessorSignersVerifier;
  relayerProvider: AbstractRelayerProvider;
  extraData: BytesHex;
  options?: FhevmInstanceOptions & RelayerProviderFetchOptions<any>;
}) {
  const fhevmHandles: FhevmHandle[] = FhevmHandle.fromZKProof(
    zkProof,
    currentCiphertextVersion(),
  );

  const relayerResult: RelayerInputProofResult =
    await relayerProvider.fetchPostInputProofWithZKProof(
      { zkProof, extraData },
      options,
    );

  if (relayerResult.handles && relayerResult.handles.length > 0) {
    const relayerResultHandles = relayerResult.handles.map((h) =>
      FhevmHandle.fromBytes32Hex(h),
    );

    if (fhevmHandles.length !== relayerResultHandles.length) {
      throw new Error(
        `Incorrect Handles list sizes: (expected) ${fhevmHandles.length} != ${relayerResultHandles.length} (received)`,
      );
    }
    for (let i = 0; i < fhevmHandles.length; ++i) {
      if (!fhevmHandles[i].equals(relayerResultHandles[i])) {
        throw new Error(
          `Incorrect Handle ${i}: (expected) ${fhevmHandles[i].toBytes32Hex()} != ${relayerResultHandles[i].toBytes32Hex()} (received)`,
        );
      }
    }
  }

  const ip = coprocessorSignersVerifier.verifyAndComputeInputProof({
    zkProof,
    handles: fhevmHandles,
    signatures: relayerResult.signatures,
    extraData,
  });

  return ip.toBytes();
}

////////////////////////////////////////////////////////////////////////////////

function isThresholdReached(
  coprocessorSigners: readonly string[],
  recoveredAddresses: readonly string[],
  threshold: number,
): boolean {
  const addressMap = new Map<string, number>();
  recoveredAddresses.forEach((address, index) => {
    if (addressMap.has(address)) {
      const duplicateValue = address;
      throw new Error(
        `Duplicate coprocessor signer address found: ${duplicateValue} appears multiple times in recovered addresses`,
      );
    }
    addressMap.set(address, index);
  });

  for (const address of recoveredAddresses) {
    if (!coprocessorSigners.includes(address)) {
      throw new Error(
        `Invalid address found: ${address} is not in the list of coprocessor signers`,
      );
    }
  }

  return recoveredAddresses.length >= threshold;
}

////////////////////////////////////////////////////////////////////////////////

export type FhevmRelayerInputProofResponse = {
  response: {
    handles: string[];
    signatures: string[];
  };
  status: string;
};

function isFhevmRelayerInputProofResponse(
  json: unknown,
): json is FhevmRelayerInputProofResponse {
  const response = json as unknown;
  // const response = json.response as unknown;
  if (typeof response !== 'object' || response === null) {
    return false;
  }
  if (!('handles' in response && Array.isArray(response.handles))) {
    return false;
  }
  if (!('signatures' in response && Array.isArray(response.signatures))) {
    return false;
  }
  return (
    response.signatures.every((s) => typeof s === 'string') &&
    response.handles.every((h) => typeof h === 'string')
  );
}

export type RelayerEncryptedInputInternal = RelayerEncryptedInput & {
  _input: EncryptedInput;
};

export type RelayerEncryptedInput = {
  addBool: (value: boolean | number | bigint) => RelayerEncryptedInput;
  add8: (value: number | bigint) => RelayerEncryptedInput;
  add16: (value: number | bigint) => RelayerEncryptedInput;
  add32: (value: number | bigint) => RelayerEncryptedInput;
  add64: (value: number | bigint) => RelayerEncryptedInput;
  add128: (value: number | bigint) => RelayerEncryptedInput;
  add256: (value: number | bigint) => RelayerEncryptedInput;
  addAddress: (value: string) => RelayerEncryptedInput;
  getBits: () => EncryptionBits[];
  generateZKProof(): ZKProofType;
  encrypt: (options?: RelayerInputProofOptions) => Promise<{
    handles: Uint8Array[];
    inputProof: Uint8Array;
  }>;
};

export const createRelayerEncryptedInput =
  ({
    aclContractAddress,
    verifyingContractAddressInputVerification,
    chainId,
    gatewayChainId,
    relayerProvider,
    tfheCompactPublicKey,
    tfheCompactPkeCrs,
    coprocessorSigners,
    thresholdCoprocessorSigners,
    capacity,
    defaultOptions,
  }: {
    aclContractAddress: string;
    verifyingContractAddressInputVerification: string;
    chainId: number;
    gatewayChainId: number;
    relayerProvider: AbstractRelayerProvider;
    tfheCompactPublicKey: TFHEType['TfheCompactPublicKey'];
    tfheCompactPkeCrs: TFHEType['CompactPkeCrs'];
    coprocessorSigners: string[];
    thresholdCoprocessorSigners: number;
    capacity: number;
    defaultOptions?: FhevmInstanceOptions;
  }) =>
  (
    contractAddress: string,
    userAddress: string,
  ): RelayerEncryptedInputInternal => {
    if (!isChecksummedAddress(contractAddress)) {
      throw new Error('Contract address is not a valid address.');
    }

    if (!isChecksummedAddress(userAddress)) {
      throw new Error('User address is not a valid address.');
    }

    const input = createEncryptedInput({
      aclContractAddress,
      chainId,
      tfheCompactPublicKey,
      tfheCompactPkeCrs,
      contractAddress,
      userAddress,
      capacity,
    });

    return {
      _input: input,
      addBool(value: number | bigint | boolean) {
        input.addBool(value);
        return this;
      },
      add8(value: number | bigint) {
        input.add8(value);
        return this;
      },
      add16(value: number | bigint) {
        input.add16(value);
        return this;
      },
      add32(value: number | bigint) {
        input.add32(value);
        return this;
      },
      add64(value: number | bigint) {
        input.add64(value);
        return this;
      },
      add128(value: number | bigint) {
        input.add128(value);
        return this;
      },
      add256(value: number | bigint) {
        input.add256(value);
        return this;
      },
      addAddress(value: string) {
        input.addAddress(value);
        return this;
      },
      getBits(): EncryptionBits[] {
        return input.getBits();
      },
      generateZKProof(): ZKProofType {
        return ZKProof.fromComponents({
          chainId: BigInt(chainId),
          aclContractAddress: aclContractAddress as ChecksummedAddress,
          userAddress: userAddress as ChecksummedAddress,
          contractAddress: contractAddress as ChecksummedAddress,
          ciphertextWithZKProof: input.encrypt(),
          encryptionBits: input.getBits(),
        });
      },
      encrypt: async (options?: RelayerInputProofOptions) => {
        const extraData: `0x${string}` = '0x00';

        const ciphertext = input.encrypt();

        const zkProof = ZKProof.fromComponents({
          ciphertextWithZKProof: ciphertext,
          chainId: BigInt(chainId),
          aclContractAddress: aclContractAddress as ChecksummedAddress,
          encryptionBits: input.getBits(),
          userAddress,
          contractAddress,
        });

        const payload: RelayerInputProofPayload = {
          contractAddress: getAddress(contractAddress),
          userAddress: getAddress(userAddress),
          ciphertextWithInputVerification: bytesToHexNo0x(ciphertext),
          contractChainId: ('0x' + chainId.toString(16)) as `0x${string}`,
          extraData,
        };

        const json: RelayerInputProofResult =
          await relayerProvider.fetchPostInputProof(payload, {
            ...defaultOptions,
            ...options,
          });

        if (!isFhevmRelayerInputProofResponse(json)) {
          throwRelayerInternalError('INPUT_PROOF', json);
        }

        const fhevmHandles: FhevmHandle[] = FhevmHandle.fromZKProof(
          zkProof,
          currentCiphertextVersion(),
        );

        const handles: Uint8Array[] = fhevmHandles.map((h) => h.toBytes32());
        const result = json;

        // Note that the hex strings returned by the relayer do have have the 0x prefix
        if (result.handles && result.handles.length > 0) {
          const responseHandles = result.handles.map(hexToBytes);
          if (handles.length != responseHandles.length) {
            throw new Error(
              `Incorrect Handles list sizes: (expected) ${handles.length} != ${responseHandles.length} (received)`,
            );
          }
          for (let index = 0; index < handles.length; index += 1) {
            let handle = handles[index];
            let responseHandle = responseHandles[index];
            let expected = bytesToHexNo0x(handle);
            let current = bytesToHexNo0x(responseHandle);
            if (expected !== current) {
              throw new Error(
                `Incorrect Handle ${index}: (expected) ${expected} != ${current} (received)`,
              );
            }
          }
        }

        const signatures = result.signatures;

        const coprocessorSignersVerifier =
          CoprocessorSignersVerifier.fromAddresses({
            coprocessorSignersAddresses:
              coprocessorSigners as ChecksummedAddress[],
            gatewayChainId: gatewayChainId,
            threshold: thresholdCoprocessorSigners,
            verifyingContractAddressInputVerification:
              verifyingContractAddressInputVerification as ChecksummedAddress,
          });

        coprocessorSignersVerifier.verifyZKProof({
          zkProof,
          handles: fhevmHandles,
          signatures,
          extraData,
        });

        ////////////////////////////////////////////////////////////////////////

        // verify signatures for inputs:
        const domain = {
          name: 'InputVerification',
          version: '1',
          chainId: gatewayChainId,
          verifyingContract: verifyingContractAddressInputVerification,
        };
        const types = {
          CiphertextVerification: [
            { name: 'ctHandles', type: 'bytes32[]' },
            { name: 'userAddress', type: 'address' },
            { name: 'contractAddress', type: 'address' },
            { name: 'contractChainId', type: 'uint256' },
            { name: 'extraData', type: 'bytes' },
          ],
        };

        const recoveredAddresses = signatures.map((signature: string) => {
          const sig = signature.startsWith('0x') ? signature : `0x${signature}`;
          const recoveredAddress = ethers.verifyTypedData(
            domain,
            types,
            {
              ctHandles: handles,
              userAddress,
              contractAddress,
              contractChainId: chainId,
              extraData,
            },
            sig,
          );
          return recoveredAddress;
        });

        const thresholdReached = isThresholdReached(
          coprocessorSigners,
          recoveredAddresses,
          thresholdCoprocessorSigners,
        );

        if (!thresholdReached) {
          throw Error('Coprocessor signers threshold is not reached');
        }

        // inputProof is len(list_handles) + numCoprocessorSigners + list_handles + signatureCoprocessorSigners (1+1+NUM_HANDLES*32+65*numSigners)
        let inputProof = numberToBytesHexNo0x(handles.length);
        const numSigners = signatures.length;
        inputProof += numberToBytesHexNo0x(numSigners);

        const listHandlesStr = handles.map((i) => bytesToHexNo0x(i));
        listHandlesStr.map((handle) => (inputProof += handle));
        signatures.map((signature) => (inputProof += signature.slice(2))); // removes the '0x' prefix from the `signature` string

        // Append the extra data to the input proof
        inputProof += extraData.slice(2);
        return {
          handles,
          inputProof: hexToBytes(inputProof),
        };
      },
    };
  };
