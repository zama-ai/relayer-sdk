import type {
  Bytes65Hex,
  BytesHex,
  ChecksummedAddress,
  UintNumber,
} from '@base/types/primitives';
import type { KmsUserDecryptEIP712Message } from './types/public-api';
import type {
  DecryptedFhevmHandle,
  FhevmConfig,
  FhevmHandle,
  PublicDecryptionProof,
} from './types/public-api';
import { createACL } from '@fhevm-base/host-contracts/ACL';
import { assertKmsDecryptionBitLimit } from '@fhevm-base/kms/utils';
import type { KmsSigncryptedShares } from '@fhevm-base/types/public-api';
import {
  assertKmsEIP712DeadlineValidity,
  verifyKmsUserDecryptEIP712,
} from '@fhevm-base/kms/KmsEIP712';
import type {
  KmsSigncryptedShare,
  KmsSigncryptedSharesMetadata,
  TkmsPrivateKey,
} from './types/private';
import { createKmsSigncryptedShares } from '@fhevm-base/kms/KmsSigncryptedShares';
import type { RelayerFetchOptions, RelayerLib, TKMSLib } from './types/libs';
import type { FhevmChainClient } from '@fhevm-base-types/public-api';
import { assertFhevmHandlesBelongToSameChainId } from '@fhevm-base/FhevmHandle';
import { createPublicDecryptionProof } from './kms/PublicDecryptionProof';

////////////////////////////////////////////////////////////////////////////////
// userDecrypt
////////////////////////////////////////////////////////////////////////////////

const MAX_USER_DECRYPT_CONTRACT_ADDRESSES = 10;
const MAX_USER_DECRYPT_DURATION_DAYS = 365 as UintNumber;

export async function userDecrypt(
  fhevm: FhevmChainClient & {
    readonly config: FhevmConfig;
    readonly relayerUrl: string;
    readonly libs: {
      readonly relayerLib: RelayerLib;
      readonly tkmsLib: TKMSLib;
    };
  },
  args: {
    readonly tkmsPrivateKey: TkmsPrivateKey;
    readonly handleContractPairs: ReadonlyArray<{
      handle: FhevmHandle;
      contractAddress: ChecksummedAddress;
    }>;
    readonly userDecryptEIP712Signer: ChecksummedAddress;
    readonly userDecryptEIP712Message: Omit<
      KmsUserDecryptEIP712Message,
      'publicKey'
    >;
    readonly userDecryptEIP712Signature: Bytes65Hex;
    readonly options?: RelayerFetchOptions;
  },
): Promise<readonly DecryptedFhevmHandle[]> {
  const {
    handleContractPairs,
    userDecryptEIP712Signature,
    userDecryptEIP712Message,
    userDecryptEIP712Signer: userAddress,
  } = args;
  // 1. Check: At least one handle/contract pair is required
  if (handleContractPairs.length === 0) {
    throw Error(
      `handleContractPairs must not be empty, at least one handle/contract pair is required`,
    );
  }

  // 2. Check: At leat one contract
  const contractAddressesLength =
    userDecryptEIP712Message.contractAddresses.length;
  if (contractAddressesLength === 0) {
    throw Error('contractAddresses is empty');
  }

  // 3. Check: No more that 10 contract addresses
  if (contractAddressesLength > MAX_USER_DECRYPT_CONTRACT_ADDRESSES) {
    throw Error(
      `contractAddresses max length of ${MAX_USER_DECRYPT_CONTRACT_ADDRESSES} exceeded`,
    );
  }

  const fhevmHandles = handleContractPairs.map((pair) => pair.handle);
  Object.freeze(fhevmHandles);

  // 4. Check: All handles belong to the host chainId
  assertFhevmHandlesBelongToSameChainId(
    fhevmHandles,
    fhevm.config.hostChainConfig.chainId,
  );

  // 5. Check: 2048 bits limit
  assertKmsDecryptionBitLimit(fhevmHandles);

  // 6. Check: Expiration date
  assertKmsEIP712DeadlineValidity(
    userDecryptEIP712Message,
    MAX_USER_DECRYPT_DURATION_DAYS,
  );

  // 7. Check: ACL permissions
  const acl = createACL(fhevm);
  await acl.checkUserAllowedForDecryption({
    userAddress: args.userDecryptEIP712Signer,
    handleContractPairs: args.handleContractPairs,
  });

  // 8. Extract FHE public key from FHE private key.
  const tkmsPublicKeyHex: BytesHex = fhevm.libs.tkmsLib.getTkmsPublicKeyHex(
    args.tkmsPrivateKey,
  );
  const kmsUserDecryptEIP712Message: KmsUserDecryptEIP712Message = {
    ...userDecryptEIP712Message,
    publicKey: tkmsPublicKeyHex,
  };

  // 9. Verify the EIP712 signature
  await verifyKmsUserDecryptEIP712(fhevm, {
    signer: args.userDecryptEIP712Signer,
    message: kmsUserDecryptEIP712Message,
    signature: userDecryptEIP712Signature,
  });

  // 10. Fetch `KmsSigncryptedShares` from the relayer
  const shares: readonly KmsSigncryptedShare[] =
    await fhevm.libs.relayerLib.fetchUserDecrypt(
      fhevm.relayerUrl,
      {
        handleContractPairs,
        kmsUserDecryptEIP712Signer: userAddress,
        kmsUserDecryptEIP712Message: {
          ...userDecryptEIP712Message,
          publicKey: tkmsPublicKeyHex,
        },
        kmsUserDecryptEIP712Signature: userDecryptEIP712Signature,
      },
      args.options,
    );

  // 11. Build the sealed `KmsSigncryptedShares` object
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

  // 12. Using the `KmsSigncryptedShares` decrypt and reconstruct clear values
  const orderedDecryptedHandles: readonly DecryptedFhevmHandle[] =
    fhevm.libs.tkmsLib.decryptAndReconstruct(
      args.tkmsPrivateKey,
      kmsSigncryptedShares,
    );

  return orderedDecryptedHandles;
}

////////////////////////////////////////////////////////////////////////////////
// publicDecrypt
////////////////////////////////////////////////////////////////////////////////

export async function publicDecrypt(
  fhevm: FhevmChainClient & {
    readonly config: FhevmConfig;
    readonly relayerUrl: string;
    readonly libs: {
      readonly relayerLib: RelayerLib;
    };
  },
  args: {
    readonly handles: readonly FhevmHandle[];
    readonly extraData: BytesHex;
    readonly options?: RelayerFetchOptions;
  },
): Promise<PublicDecryptionProof> {
  const fhevmHandles = args.handles;

  // 1. Check: At least one handle is required
  if (fhevmHandles.length === 0) {
    throw Error(`handles must not be empty, at least one handle is required`);
  }

  // 2. Check: 2048 bits limit
  assertKmsDecryptionBitLimit(fhevmHandles);

  // 3. Check: All handles belong to the host chainId
  assertFhevmHandlesBelongToSameChainId(
    fhevmHandles,
    fhevm.config.hostChainConfig.chainId,
  );

  // 4. Check: ACL permissions
  const acl = createACL(fhevm);
  await acl.checkAllowedForDecryption(fhevmHandles);

  // 5. Call relayer
  const { orderedAbiEncodedClearValues, kmsPublicDecryptEIP712Signatures } =
    await fhevm.libs.relayerLib.fetchPublicDecrypt(
      fhevm.relayerUrl,
      {
        orderedHandles: fhevmHandles,
        extraData: args.extraData,
      },
      args.options,
    );

  ////////////////////////////////////////////////////////////////////////////
  //
  // Warning!!!! Do not use '0x00' here!! Only '0x' is permitted!
  //
  ////////////////////////////////////////////////////////////////////////////
  const signedExtraData = '0x' as BytesHex;

  // 6. Verify and Compute PublicDecryptionProof
  const publicDecryptionProof: PublicDecryptionProof =
    await createPublicDecryptionProof(fhevm, {
      orderedHandles: fhevmHandles,
      orderedAbiEncodedClearValues,
      kmsPublicDecryptEIP712Signatures,
      extraData: signedExtraData,
    });

  return publicDecryptionProof;
}
