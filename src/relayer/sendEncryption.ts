import { isAddress, getAddress as ethersGetAddress } from 'ethers';

import { fromHexString, numberToHex, toHexString } from '../utils';
import {
  createEncryptedInput as createEncryptedInput,
  EncryptedInput,
} from '../sdk/encrypt';
import { EncryptionTypes } from '../sdk/encryptionTypes';
import { computeHandles } from './handles';
import { ethers } from 'ethers';
import { TFHEType } from '../tfheType';
import { throwRelayerInternalError } from './error';
import {
  fetchRelayerJsonRpcPost,
  RelayerFetchResponseJson,
  RelayerInputProofPayload,
} from './fetchRelayer';

// Add type checking
const getAddress = (value: string): `0x${string}` =>
  ethersGetAddress(value) as `0x${string}`;

export const currentCiphertextVersion = () => {
  return 0;
};

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
  json: RelayerFetchResponseJson,
): json is FhevmRelayerInputProofResponse {
  const response = json.response as unknown;
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
  getBits: () => EncryptionTypes[];
  encrypt: (options?: { apiKey?: string }) => Promise<{
    handles: Uint8Array[];
    inputProof: Uint8Array;
  }>;
};

export type PublicParams<T = TFHEType['CompactPkeCrs']> = {
  [key in EncryptionTypes]?: { publicParams: T; publicParamsId: string };
};

export const createRelayerEncryptedInput =
  (
    aclContractAddress: string,
    verifyingContractAddressInputVerification: string,
    chainId: number,
    gatewayChainId: number,
    relayerUrl: string,
    tfheCompactPublicKey: TFHEType['TfheCompactPublicKey'],
    publicParams: PublicParams,
    coprocessorSigners: string[],
    thresholdCoprocessorSigners: number,
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
      getBits(): EncryptionTypes[] {
        return input.getBits();
      },
      encrypt: async (options?: { apiKey?: string }) => {
        const bits = input.getBits();
        const ciphertext = input.encrypt();

        const payload: RelayerInputProofPayload = {
          contractAddress: getAddress(contractAddress),
          userAddress: getAddress(userAddress),
          ciphertextWithInputVerification: toHexString(ciphertext),
          contractChainId: ('0x' + chainId.toString(16)) as `0x${string}`,
        };

        const json = await fetchRelayerJsonRpcPost(
          'INPUT_PROOF',
          `${relayerUrl}/v1/input-proof`,
          payload,
          options,
        );

        if (!isFhevmRelayerInputProofResponse(json)) {
          throwRelayerInternalError('INPUT_PROOF', json);
        }

        const handles: Uint8Array[] = computeHandles(
          ciphertext,
          bits,
          aclContractAddress,
          chainId,
          currentCiphertextVersion(),
        );

        // Note that the hex strings returned by the relayer do have have the 0x prefix
        if (json.response.handles && json.response.handles.length > 0) {
          const responseHandles = json.response.handles.map(fromHexString);
          if (handles.length != responseHandles.length) {
            throw new Error(
              `Incorrect Handles list sizes: (expected) ${handles.length} != ${responseHandles.length} (received)`,
            );
          }
          for (let index = 0; index < handles.length; index += 1) {
            let handle = handles[index];
            let responseHandle = responseHandles[index];
            let expected = toHexString(handle);
            let current = toHexString(responseHandle);
            if (expected !== current) {
              throw new Error(
                `Incorrect Handle ${index}: (expected) ${expected} != ${current} (received)`,
              );
            }
          }
        }

        const signatures: string[] = json.response.signatures;

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
        let inputProof = numberToHex(handles.length);
        const numSigners = signatures.length;
        inputProof += numberToHex(numSigners);

        const listHandlesStr = handles.map((i) => toHexString(i));
        listHandlesStr.map((handle) => (inputProof += handle));
        signatures.map((signature) => (inputProof += signature.slice(2))); // removes the '0x' prefix from the `signature` string
        return {
          handles,
          inputProof: fromHexString(inputProof),
        };
      },
    };
  };
