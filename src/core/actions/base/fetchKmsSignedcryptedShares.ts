import {
  assertHandlesBelongToSameChainId,
  toHandle,
} from "../../handle/FhevmHandle.js";
import { toArray } from "../../base/object.js";
import { createKmsSigncryptedShares } from "../../kms/KmsSigncryptedShares-p.js";
import { assertKmsDecryptionBitLimit } from "../../kms/utils.js";
import type { Fhevm } from "../../types/coreFhevmClient.js";
import type {
  KmsSigncryptedShare,
  KmsSigncryptedSharesMetadata,
} from "../../types/kms-p.js";
import type { KmsSigncryptedShares } from "../../types/kms.js";
import type { KmsSignersContext } from "../../types/kmsSignersContext.js";
import type {
  ChecksummedAddress,
  Uint64BigInt,
} from "../../types/primitives.js";
import { readKmsSignersContext } from "./readKmsSignersContext.js";
import { checkUserAllowedForDecryption } from "./checkUserAllowedForDecryption.js";
import { createKmsEIP712Domain } from "../chain/createKmsEIP712Domain.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import type {
  RelayerDelegatedUserDecryptOptions,
  RelayerUserDecryptOptions,
} from "../../types/relayer.js";
import type {
  SignedDelegatedDecryptionPermit,
  SignedSelfDecryptionPermit,
} from "../../types/signedDecryptionPermit.js";
import { assertIsSignedDecryptionPermit } from "../../kms/SignedDecryptionPermit-p.js";
import type { EncryptedValueLike } from "../../types/encryptedTypes.js";

/*
    See: in KMS (eip712Domain)
    json.response[i].signature is an eip712 sig potentially on this message:

    struct UserDecryptResponseVerification {
        bytes publicKey;
        bytes32[] ctHandles;
        bytes userDecryptedShare;
        bytes extraData;
    }
}    
*/

////////////////////////////////////////////////////////////////////////////////

type EncryptedValueEntry = {
  readonly encryptedValue: EncryptedValueLike;
  readonly contractAddress: ChecksummedAddress;
};

type EncryptedValues = EncryptedValueEntry | readonly EncryptedValueEntry[];

export type FetchKmsSignedcryptedSharesParameters =
  | {
      readonly encryptedValues: EncryptedValues;
      readonly signedPermit: SignedSelfDecryptionPermit;
      readonly options?: RelayerUserDecryptOptions | undefined;
    }
  | {
      readonly encryptedValues: EncryptedValues;
      readonly signedPermit: SignedDelegatedDecryptionPermit;
      readonly options?: RelayerDelegatedUserDecryptOptions | undefined;
    };

export type FetchKmsSignedcryptedSharesReturnType = KmsSigncryptedShares;

////////////////////////////////////////////////////////////////////////////////
// fetchKmsSignedcryptedShares
////////////////////////////////////////////////////////////////////////////////

const MAX_USER_DECRYPT_CONTRACT_ADDRESSES = 10;

export async function fetchKmsSignedcryptedShares(
  fhevm: Fhevm<FhevmChain>,
  parameters: FetchKmsSignedcryptedSharesParameters,
): Promise<FetchKmsSignedcryptedSharesReturnType> {
  const { signedPermit, options } = parameters;

  // Normalize: accept a single entry or an array
  const encryptedValues = toArray(parameters.encryptedValues);

  // Caller-provided options override runtime config defaults (e.g. auth)
  const relayerOptions = {
    auth: fhevm.runtime.config.auth,
    ...options,
  };

  assertIsSignedDecryptionPermit(signedPermit, {});

  // The max number of contracts allowed in a permit is managed by the `SignedDecryptionPermit` directly
  const { userAddress, signerAddress, signature } = signedPermit;

  // 1. Check: At least one handle/contract pair is required
  if (encryptedValues.length === 0) {
    throw Error(
      `encryptedValue/contract pairs must not be empty, at least one encryptedValue/contract pair is required`,
    );
  }

  // 2. Check: At least one contract
  const contractAddressesLength =
    signedPermit.eip712.message.contractAddresses.length;
  if (contractAddressesLength === 0) {
    throw Error("contractAddresses is empty");
  }

  // 3. Check: No more that 10 contract addresses
  if (contractAddressesLength > MAX_USER_DECRYPT_CONTRACT_ADDRESSES) {
    throw Error(
      `contractAddresses max length of ${MAX_USER_DECRYPT_CONTRACT_ADDRESSES} exceeded`,
    );
  }

  const handleContractPairs = encryptedValues.map((pair) => ({
    handle: toHandle(pair.encryptedValue),
    contractAddress: pair.contractAddress,
  }));
  const fhevmHandles = handleContractPairs.map((p) => p.handle);
  Object.freeze(handleContractPairs);
  Object.freeze(fhevmHandles);

  // 4. Check: All handles belong to the host chainId
  assertHandlesBelongToSameChainId(
    fhevmHandles,
    BigInt(fhevm.chain.id) as Uint64BigInt,
  );

  // 5. Check: 2048 bits limit
  assertKmsDecryptionBitLimit(fhevmHandles);

  // 6. Check: Expiration date
  signedPermit.assertNotExpired();

  // 7. Check: ACL permissions (user is signer or delegatorAddress)
  await checkUserAllowedForDecryption(fhevm, {
    userAddress,
    handleContractPairs,
  });

  // 9. Verify the EIP712 signature
  // Not required because a signedPermit is guaranteed to be verified.

  // 10. Fetch `KmsSignersContext` on-chain (cached)
  const kmsSignersContext: KmsSignersContext =
    await readKmsSignersContext(fhevm);

  // 11. Fetch `KmsSigncryptedShares` from the relayer
  // Safe casts: the discriminated union on parameters guarantees
  // that options type matches signedPermit type, but TS can't prove
  // it after destructuring (nested discriminant limitation).
  const relayerUrl = fhevm.chain.fhevm.relayerUrl;

  let shares: readonly KmsSigncryptedShare[];

  if (signedPermit.isDelegated) {
    shares = await fhevm.runtime.relayer.fetchDelegatedUserDecrypt(
      { relayerUrl, chainId: fhevm.chain.id },
      {
        payload: {
          handleContractPairs,
          kmsDecryptEip712Signer: signerAddress,
          kmsDecryptEip712Message: signedPermit.eip712.message,
          kmsDecryptEip712Signature: signature,
        },
        options: relayerOptions as RelayerDelegatedUserDecryptOptions,
      },
    );
  } else {
    shares = await fhevm.runtime.relayer.fetchUserDecrypt(
      { relayerUrl, chainId: fhevm.chain.id },
      {
        payload: {
          handleContractPairs,
          kmsDecryptEip712Signer: signerAddress,
          kmsDecryptEip712Message: signedPermit.eip712.message,
          kmsDecryptEip712Signature: signature,
        },
        options: relayerOptions as RelayerUserDecryptOptions,
      },
    );
  }

  // 12. Build the sealed `KmsSigncryptedShares` object
  const sharesMetadata: KmsSigncryptedSharesMetadata = {
    kmsSignersContext,
    eip712Domain: createKmsEIP712Domain(fhevm),
    eip712Signature: signature,
    eip712SignerAddress: signerAddress,
    handles: fhevmHandles,
  };

  return createKmsSigncryptedShares(sharesMetadata, shares);
}
