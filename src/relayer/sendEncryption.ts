import { isAddress, getAddress as ethersGetAddress } from 'ethers';

import { createEncryptedInput as createEncryptedInput } from '../sdk/encrypt';
import { ethers } from 'ethers';
import { throwRelayerInternalError } from './error';
import { AbstractRelayerProvider } from '../relayer-provider/AbstractRelayerProvider';
import type { RelayerProviderFetchOptions } from '../relayer-provider/AbstractRelayerProvider';
import { bytesToHexNo0x, hexToBytes } from '../utils/bytes';
import { numberToHexNo0x } from '../utils/uint';
import { FhevmHandle } from '../sdk/FhevmHandle';
import type { EncryptedInput, PublicParams } from '../sdk/encrypt';
import type { TFHEType } from '../tfheType';
import type {
  FhevmInstanceOptions,
  RelayerInputProofPayload,
} from '../types/relayer';
import type {
  BytesHex,
  ChecksummedAddress,
  EncryptionBits,
  ZKProof,
} from '../types/primitives';
import type { RelayerV2InputProofOptions } from '../relayer-provider/v2/types/types';

// Add type checking
const getAddress = (value: string): `0x${string}` =>
  ethersGetAddress(value) as `0x${string}`;

export const currentCiphertextVersion = () => {
  return 0;
};

export async function requestCiphertextWithZKProofVerification({
  bits,
  ciphertext,
  contractAddress,
  userAddress,
  aclContractAddress,
  verifyingContractAddressInputVerification,
  chainId,
  gatewayChainId,
  relayerProvider,
  coprocessorSigners,
  thresholdCoprocessorSigners,
  extraData,
  options,
}: {
  bits: EncryptionBits[];
  ciphertext: Uint8Array;
  contractAddress: ChecksummedAddress;
  userAddress: ChecksummedAddress;
  aclContractAddress: ChecksummedAddress;
  verifyingContractAddressInputVerification: ChecksummedAddress;
  chainId: number;
  gatewayChainId: number;
  relayerProvider: AbstractRelayerProvider;
  coprocessorSigners: ChecksummedAddress[];
  thresholdCoprocessorSigners: number;
  extraData: BytesHex;
  options?: FhevmInstanceOptions & RelayerProviderFetchOptions<any>;
}) {
  const payload: RelayerInputProofPayload = {
    contractAddress,
    userAddress,
    ciphertextWithInputVerification: bytesToHexNo0x(ciphertext),
    contractChainId: ('0x' + chainId.toString(16)) as `0x${string}`,
    extraData,
  };

  const json = await relayerProvider.fetchPostInputProof(payload, options);

  if (!isFhevmRelayerInputProofResponse(json)) {
    throwRelayerInternalError('INPUT_PROOF', json);
  }

  const fhevmHandles: FhevmHandle[] = FhevmHandle.fromZKProof({
    ciphertextWithZKProof: ciphertext,
    chainId,
    aclAddress: aclContractAddress as ChecksummedAddress,
    ciphertextVersion: currentCiphertextVersion(),
    fheTypeEncryptionBitwidths: bits,
  });

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

  const signatures: string[] = result.signatures;

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
  let inputProof = numberToHexNo0x(handles.length);
  const numSigners = signatures.length;
  inputProof += numberToHexNo0x(numSigners);

  const listHandlesStr = handles.map((i) => bytesToHexNo0x(i));
  listHandlesStr.map((handle) => (inputProof += handle));
  signatures.map((signature) => (inputProof += signature.slice(2))); // removes the '0x' prefix from the `signature` string

  // Append the extra data to the input proof
  inputProof += extraData.slice(2);
  return {
    handles,
    inputProof: hexToBytes(inputProof),
  };
}

function isThresholdReached(
  coprocessorSigners: string[],
  recoveredAddresses: string[],
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
  generateZKProof(): ZKProof;
  encrypt: (options?: RelayerV2InputProofOptions) => Promise<{
    handles: Uint8Array[];
    inputProof: Uint8Array;
  }>;
};

export const createRelayerEncryptedInput =
  (
    aclContractAddress: string,
    verifyingContractAddressInputVerification: string,
    chainId: number,
    gatewayChainId: number,
    relayerProvider: AbstractRelayerProvider,
    tfheCompactPublicKey: TFHEType['TfheCompactPublicKey'],
    publicParams: PublicParams,
    coprocessorSigners: string[],
    thresholdCoprocessorSigners: number,
    defaultOptions?: FhevmInstanceOptions,
  ) =>
  (
    contractAddress: string,
    userAddress: string,
  ): RelayerEncryptedInputInternal => {
    if (!isAddress(contractAddress)) {
      throw new Error('Contract address is not a valid address.');
    }

    if (!isAddress(userAddress)) {
      throw new Error('User address is not a valid address.');
    }

    const input = createEncryptedInput({
      aclContractAddress,
      chainId,
      tfheCompactPublicKey,
      publicParams,
      contractAddress,
      userAddress,
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
      generateZKProof(): ZKProof {
        return {
          chainId,
          aclContractAddress: aclContractAddress as ChecksummedAddress,
          userAddress: userAddress as ChecksummedAddress,
          contractAddress: contractAddress as ChecksummedAddress,
          ciphertextWithZkProof: input.encrypt(),
          bits: input.getBits(),
        } as const;
      },
      encrypt: async (options?: RelayerV2InputProofOptions) => {
        const extraData: `0x${string}` = '0x00';
        const bits = input.getBits();
        const ciphertext = input.encrypt();
        const payload: RelayerInputProofPayload = {
          contractAddress: getAddress(contractAddress),
          userAddress: getAddress(userAddress),
          ciphertextWithInputVerification: bytesToHexNo0x(ciphertext),
          contractChainId: ('0x' + chainId.toString(16)) as `0x${string}`,
          extraData,
        };

        const json = await relayerProvider.fetchPostInputProof(payload, {
          ...defaultOptions,
          ...options,
        });

        if (!isFhevmRelayerInputProofResponse(json)) {
          throwRelayerInternalError('INPUT_PROOF', json);
        }

        const fhevmHandles: FhevmHandle[] = FhevmHandle.fromZKProof({
          ciphertextWithZKProof: ciphertext,
          chainId,
          aclAddress: aclContractAddress as ChecksummedAddress,
          ciphertextVersion: currentCiphertextVersion(),
          fheTypeEncryptionBitwidths: bits,
        });

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

        const signatures: string[] = result.signatures;

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
        let inputProof = numberToHexNo0x(handles.length);
        const numSigners = signatures.length;
        inputProof += numberToHexNo0x(numSigners);

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
