import type {
  Bytes65Hex,
  Bytes65HexNo0x,
  BytesHexNo0x,
  ChecksummedAddress,
  UintNumber,
} from '@base/types/primitives';
import type {
  ClearValueType,
  KmsUserDecryptEIP712Message,
} from '@sdk/kms/public-api';
import { type PrivateEncKeyMlKem512 } from '@sdk/lowlevel/TKMSPkeKeypair';
import type { FhevmConfig, FhevmHandle } from '@fhevm-base/types/public-api';
import type { FetchUserDecryptPayload } from './types/private-api';
import type { RelayerUserDecryptOptions } from './types/public-api';
import { createACL } from '@fhevm-base/host-contracts/ACL';
import { assertKmsDecryptionBitLimit } from '@fhevm-base/kms/utils';
import { remove0x } from '@base/string';
import { fetchUserDecrypt } from './fetch/userDecrypt';
import type { KmsSigncryptedShares } from '@fhevm-base/types/public-api';
import type { FhevmChainClient } from '@fhevm-base-types/public-api';
import { assertKmsEIP712DeadlineValidity } from '@fhevm-base/kms/KmsEIP712';
import type {
  KmsSigncryptedShare,
  KmsSigncryptedSharesMetadata,
} from '@sdk/types/private';
import { createKmsSigncryptedShares } from '@fhevm-base/kms/KmsSigncryptedShares';
import type { FHELib } from '@fhevm-base/types/libs';

////////////////////////////////////////////////////////////////////////////////
// userDecrypt
////////////////////////////////////////////////////////////////////////////////

const MAX_USER_DECRYPT_CONTRACT_ADDRESSES = 10;
const MAX_USER_DECRYPT_DURATION_DAYS = 365 as UintNumber;

export async function userDecrypt(
  fhevm: FhevmChainClient & {
    config: FhevmConfig;
    relayerUrl: string;
    fheLib: FHELib;
  },
  args: {
    readonly privateKey: PrivateEncKeyMlKem512;
    readonly userAddress: ChecksummedAddress;
    readonly handleContractPairs: ReadonlyArray<{
      handle: FhevmHandle;
      contractAddress: ChecksummedAddress;
    }>;
    readonly userDecryptEIP712Message: Omit<
      KmsUserDecryptEIP712Message,
      'publicKey'
    >;
    readonly userDecryptEIP712Signature: Bytes65Hex;
    readonly options?: RelayerUserDecryptOptions;
  },
): Promise<Readonly<Record<`0x${string}`, ClearValueType>>> {
  const { userDecryptEIP712Message, userAddress } = args;

  // No more that 10 contract addresses
  const contractAddressesLength =
    userDecryptEIP712Message.contractAddresses.length;
  if (contractAddressesLength === 0) {
    throw Error('contractAddresses is empty');
  }
  if (contractAddressesLength > MAX_USER_DECRYPT_CONTRACT_ADDRESSES) {
    throw Error(
      `contractAddresses max length of ${MAX_USER_DECRYPT_CONTRACT_ADDRESSES} exceeded`,
    );
  }

  const fhevmHandles = args.handleContractPairs.map((pair) => pair.handle);
  Object.freeze(fhevmHandles);

  // Check 2048 bits limit
  assertKmsDecryptionBitLimit(fhevmHandles);

  // Check expiration date
  assertKmsEIP712DeadlineValidity(
    userDecryptEIP712Message,
    MAX_USER_DECRYPT_DURATION_DAYS,
  );

  // Check ACL permissions
  const acl = createACL(fhevm);
  await acl.checkUserAllowedForDecryption({
    userAddress: args.userAddress,
    handleContractPairs: args.handleContractPairs,
  });

  // Build relayer playload
  const payloadForRequest: FetchUserDecryptPayload = {
    handleContractPairs: args.handleContractPairs.map((pair) => {
      return {
        handle: pair.handle.bytes32Hex,
        contractAddress: pair.contractAddress,
      };
    }),
    requestValidity: {
      startTimestamp: userDecryptEIP712Message.startTimestamp,
      durationDays: userDecryptEIP712Message.durationDays,
    },
    contractsChainId: fhevm.config.hostChainConfig.chainId.toString(),
    contractAddresses: userDecryptEIP712Message.contractAddresses,
    userAddress,
    signature: remove0x(args.userDecryptEIP712Signature) as Bytes65HexNo0x,
    extraData: args.userDecryptEIP712Message.extraData,
    publicKey: remove0x(args.privateKey.getPublicKeyHex()) as BytesHexNo0x,
  };

  // Call relayer with playload to fetch the `KmsSigncryptedShares`
  const shares: readonly KmsSigncryptedShare[] = await fetchUserDecrypt(
    fhevm.relayerUrl,
    payloadForRequest,
    args.options,
  );

  // Build the sealed `KmsSigncryptedShares` object
  const sharesMetadata: KmsSigncryptedSharesMetadata = {
    kmsVerifier: fhevm.config.kmsVerifier,
    eip712Signature: args.userDecryptEIP712Signature,
    eip712SignerAddress: userAddress,
    fhevmHandles,
  };

  const kmsSigncryptedShares: KmsSigncryptedShares = createKmsSigncryptedShares(
    sharesMetadata,
    shares,
  );

  // Using the `KmsSigncryptedShares` decrypt and reconstruct clear values
  const orderedDecryptedHandles = fhevm.fheLib.kmsDecryptAndReconstruct(
    args.privateKey,
    kmsSigncryptedShares,
  );

  // Build the return type in the expected format
  const clearValues: Record<string, ClearValueType> = {};

  orderedDecryptedHandles.forEach(
    (decryptedHandle) =>
      (clearValues[decryptedHandle.handle.bytes32Hex] =
        decryptedHandle.value as ClearValueType),
  );
  Object.freeze(clearValues);

  return clearValues;
}
