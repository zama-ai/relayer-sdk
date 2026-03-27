import type { RelayerPublicDecryptOptions } from "../../../types/relayer.js";
import { assertFhevmHandlesBelongToSameChainId } from "../../../handle/FhevmHandle.js";
import { assertKmsDecryptionBitLimit } from "../../../kms/utils.js";
import type { Fhevm } from "../../../types/coreFhevmClient.js";
import type { FhevmChain } from "../../../types/fhevmChain.js";
import type { FhevmHandle } from "../../../types/fhevmHandle.js";
import type { BytesHex, Uint64BigInt } from "../../../types/primitives.js";
import type { PublicDecryptionProof } from "../../../types/publicDecryptionProof.js";
import { checkAllowedForDecryption } from "./checkAllowedForDecryption.js";
import { createPublicDecryptionProof } from "./createPublicDecryptionProof.js";
import { getExtraData } from "../../host/getExtraData.js";

/**
 * Parameters for publicDecrypt - simplified to take array directly.
 * The array of encrypted values to decrypt, with optional relayer options.
 */
export type PublicDecryptParameters = {
  readonly encryptedValues: readonly FhevmHandle[];
  readonly options?: RelayerPublicDecryptOptions | undefined;
};

export type PublicDecryptReturnType = PublicDecryptionProof;

export async function publicDecrypt(
  fhevm: Fhevm<FhevmChain>,
  parameters: PublicDecryptParameters,
): Promise<PublicDecryptReturnType> {
  // Map user-facing encryptedValues to internal handles
  const fhevmHandles = parameters.encryptedValues;

  // 1. Check: At least one encrypted value is required
  if (fhevmHandles.length === 0) {
    throw Error(`encryptedValues must not be empty, at least one encrypted value is required`);
  }

  // 2. Check: 2048 bits limit
  assertKmsDecryptionBitLimit(fhevmHandles);

  // 3. Check: All handles belong to the host chainId
  assertFhevmHandlesBelongToSameChainId(
    fhevmHandles,
    BigInt(fhevm.chain.id) as Uint64BigInt,
  );

  // 4. Check: ACL permissions
  await checkAllowedForDecryption(fhevm, {
    handles: fhevmHandles,
    options: { checkArguments: true },
  });

  // 5. Fetch extraData for KMS context
  const extraData = await getExtraData(fhevm, {});

  // 6. Call relayer
  const { orderedAbiEncodedClearValues, kmsPublicDecryptEIP712Signatures } =
    await fhevm.runtime.relayer.fetchPublicDecrypt(
      { relayerUrl: fhevm.chain.fhevm.relayerUrl },
      {
        payload: {
          orderedHandles: fhevmHandles,
          extraData: extraData,
        },
        options: parameters.options ?? {},
      },
    );

  ////////////////////////////////////////////////////////////////////////////
  //
  // Warning!!!! Do not use '0x00' here!! Only '0x' is permitted!
  //
  ////////////////////////////////////////////////////////////////////////////
  const signedExtraData = "0x" as BytesHex;

  // 7. Verify and Compute PublicDecryptionProof
  const publicDecryptionProof: PublicDecryptionProof =
    await createPublicDecryptionProof(fhevm, {
      orderedHandles: fhevmHandles,
      orderedAbiEncodedClearValues,
      kmsPublicDecryptEIP712Signatures,
      extraData: signedExtraData,
    });

  return publicDecryptionProof;
}
