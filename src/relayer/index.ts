import type { RelayerLib, RelayerFetchOptions } from '@fhevm-base/types/libs';
import type {
  FhevmHandle,
  KmsUserDecryptEIP712Message,
  KmsDelegatedUserDecryptEIP712Message,
  ZKProof,
} from '@fhevm-base/types/public-api';
import type {
  Bytes65Hex,
  Bytes65HexNo0x,
  BytesHex,
  BytesHexNo0x,
  ChecksummedAddress,
} from '@base/types/primitives';
import type {
  FetchInputProofPayload,
  FetchUserDecryptPayload,
} from './types/private-api';
import type { KmsSigncryptedShare } from '@fhevm-base/types/private';
import type {
  FetchDelegatedUserDecryptResult,
  FetchInputProofResult,
  FetchPublicDecryptResult,
  FetchUserDecryptResult,
  RelayerDelegatedUserDecryptOptions,
  RelayerInputProofOptions,
  RelayerPublicDecryptOptions,
  RelayerUserDecryptOptions,
} from './types/public-api';
import { RelayerAsyncRequest } from './RelayerAsyncRequest';
import { ensure0x, remove0x, removeSuffix } from '@base/string';
import { bytesToHexNo0x } from '@base/bytes';
import { uintToHex } from '@base/uint';
import { fetchTfhePublicEncryptionParams } from './fetchTfhePublicEncryptionParams';

const relayerLib: RelayerLib = {
  //////////////////////////////////////////////////////////////////////////////
  // fetchTfhePublicEncryptionParams
  //////////////////////////////////////////////////////////////////////////////

  fetchTfhePublicEncryptionParams,

  //////////////////////////////////////////////////////////////////////////////
  // fetchCoprocessorSignatures
  //////////////////////////////////////////////////////////////////////////////

  async fetchCoprocessorSignatures(
    relayerUrl: string,
    payload: {
      readonly zkProof: ZKProof;
      readonly extraData: BytesHex;
    },
    options?: RelayerFetchOptions,
  ): Promise<{
    readonly handles: readonly FhevmHandle[];
    readonly coprocessorEIP712Signatures: readonly Bytes65Hex[];
    readonly extraData: BytesHex;
  }> {
    const relayerOptions = options as RelayerInputProofOptions | undefined;

    const inputProofPayload: FetchInputProofPayload = {
      ciphertextWithInputVerification: bytesToHexNo0x(
        payload.zkProof.ciphertextWithZKProof,
      ),
      contractAddress: payload.zkProof.contractAddress,
      contractChainId: uintToHex(payload.zkProof.chainId),
      extraData: payload.extraData,
      userAddress: payload.zkProof.userAddress,
    };

    const request = new RelayerAsyncRequest({
      relayerOperation: 'INPUT_PROOF',
      url: `${removeSuffix(relayerUrl, '/')}/input-proof`,
      payload: inputProofPayload,
      options: relayerOptions,
    });

    const result = (await request.run()) as FetchInputProofResult;

    return {
      handles: result.handles,
      coprocessorEIP712Signatures: result.signatures,
      extraData: result.extraData,
    };
  },

  //////////////////////////////////////////////////////////////////////////////
  // fetchPublicDecrypt
  //////////////////////////////////////////////////////////////////////////////

  async fetchPublicDecrypt(
    relayerUrl: string,
    payload: {
      readonly orderedHandles: readonly FhevmHandle[];
      readonly extraData: BytesHex;
    },
    options?: RelayerFetchOptions,
  ): Promise<{
    readonly orderedAbiEncodedClearValues: BytesHex;
    readonly kmsPublicDecryptEIP712Signatures: Bytes65Hex[];
  }> {
    const relayerOptions = options as RelayerPublicDecryptOptions | undefined;

    const request = new RelayerAsyncRequest({
      relayerOperation: 'PUBLIC_DECRYPT',
      url: `${removeSuffix(relayerUrl, '/')}/public-decrypt`,
      payload,
      options: relayerOptions,
    });

    const result = (await request.run()) as FetchPublicDecryptResult;

    return {
      orderedAbiEncodedClearValues: ensure0x(result.decryptedValue) as BytesHex,
      kmsPublicDecryptEIP712Signatures: result.signatures.map(
        ensure0x,
      ) as Bytes65Hex[],
    };
  },

  //////////////////////////////////////////////////////////////////////////////
  // fetchUserDecrypt
  //////////////////////////////////////////////////////////////////////////////

  async fetchUserDecrypt(
    relayerUrl: string,
    payload: {
      readonly handleContractPairs: ReadonlyArray<{
        readonly handle: FhevmHandle;
        readonly contractAddress: ChecksummedAddress;
      }>;
      readonly kmsUserDecryptEIP712Signer: ChecksummedAddress;
      readonly kmsUserDecryptEIP712Message: KmsUserDecryptEIP712Message;
      readonly kmsUserDecryptEIP712Signature: Bytes65Hex;
    },
    options?: RelayerFetchOptions,
  ): Promise<readonly KmsSigncryptedShare[]> {
    const relayerOptions = options as RelayerUserDecryptOptions | undefined;

    const userDecryptPayload: FetchUserDecryptPayload = {
      handleContractPairs: payload.handleContractPairs.map((pair) => {
        return {
          handle: pair.handle.bytes32Hex,
          contractAddress: pair.contractAddress,
        };
      }),
      requestValidity: {
        startTimestamp: payload.kmsUserDecryptEIP712Message.startTimestamp,
        durationDays: payload.kmsUserDecryptEIP712Message.durationDays,
      },
      contractsChainId:
        payload.handleContractPairs[0].handle.chainId.toString(),
      contractAddresses: payload.kmsUserDecryptEIP712Message.contractAddresses,
      userAddress: payload.kmsUserDecryptEIP712Signer,
      signature: remove0x(
        payload.kmsUserDecryptEIP712Signature,
      ) as Bytes65HexNo0x,
      extraData: payload.kmsUserDecryptEIP712Message.extraData,
      publicKey: remove0x(
        payload.kmsUserDecryptEIP712Message.publicKey,
      ) as BytesHexNo0x,
    };

    const request = new RelayerAsyncRequest({
      relayerOperation: 'USER_DECRYPT',
      url: `${removeSuffix(relayerUrl, '/')}/user-decrypt`,
      payload: userDecryptPayload,
      options: relayerOptions,
    });

    const result = (await request.run()) as FetchUserDecryptResult;

    return result as readonly KmsSigncryptedShare[];
  },

  //////////////////////////////////////////////////////////////////////////////
  // fetchDelegatedUserDecrypt
  //////////////////////////////////////////////////////////////////////////////

  async fetchDelegatedUserDecrypt(
    relayerUrl: string,
    payload: {
      readonly handleContractPairs: ReadonlyArray<{
        readonly handle: FhevmHandle;
        readonly contractAddress: ChecksummedAddress;
      }>;
      readonly kmsDelegatedUserDecryptEIP712Signer: ChecksummedAddress;
      readonly kmsDelegatedUserDecryptEIP712Message: KmsDelegatedUserDecryptEIP712Message;
      readonly kmsDelegatedUserDecryptEIP712Signature: Bytes65Hex;
    },
    options?: RelayerFetchOptions,
  ): Promise<readonly KmsSigncryptedShare[]> {
    const relayerOptions = options as
      | RelayerDelegatedUserDecryptOptions
      | undefined;

    const request = new RelayerAsyncRequest({
      relayerOperation: 'DELEGATED_USER_DECRYPT',
      url: `${removeSuffix(relayerUrl, '/')}/delegated-user-decrypt`,
      payload,
      options: relayerOptions,
    });

    const result = (await request.run()) as FetchDelegatedUserDecryptResult;

    return result as readonly KmsSigncryptedShare[];
  },
};

export const createRelayerLib = async (
  _config?: unknown,
  // eslint-disable-next-line @typescript-eslint/require-await
): Promise<RelayerLib> => {
  return relayerLib;
};
