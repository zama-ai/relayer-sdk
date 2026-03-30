import type { RelayerPublicDecryptOptions } from "../../types/relayer.js";
import {
  assertHandlesBelongToSameChainId,
  toHandle,
} from "../../handle/FhevmHandle.js";
import { assertKmsDecryptionBitLimit } from "../../kms/utils.js";
import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import type { BytesHex, Uint64BigInt } from "../../types/primitives.js";
import type { PublicDecryptionProof } from "../../types/publicDecryptionProof.js";
import { checkAllowedForDecryption } from "./checkAllowedForDecryption.js";
import { createPublicDecryptionProof } from "./createPublicDecryptionProof.js";
import type { EncryptedValueLike } from "../../types/encryptedTypes.js";

export type PublicDecryptParameters = {
  readonly encryptedValues: readonly EncryptedValueLike[];
  readonly options?: RelayerPublicDecryptOptions | undefined;
};

export type PublicDecryptReturnType = PublicDecryptionProof;

export async function publicDecrypt(
  fhevm: Fhevm<FhevmChain>,
  parameters: PublicDecryptParameters,
): Promise<PublicDecryptReturnType> {
  // relayer is expecting '0x00'
  const hardCodedExtraData = "0x00" as BytesHex;

  const { encryptedValues, options } = parameters;

  const orderedHandles = parameters.encryptedValues.map((ev) => toHandle(ev));

  // Caller-provided options override runtime config defaults (e.g. auth)
  const relayerOptions: RelayerPublicDecryptOptions = {
    auth: fhevm.runtime.config.auth,
    ...options,
  };

  // 1. Check: At least one handle is required
  if (orderedHandles.length === 0) {
    throw Error(`handles must not be empty, at least one handle is required`);
  }

  // 2. Check: 2048 bits limit
  assertKmsDecryptionBitLimit(orderedHandles);

  // 3. Check: All handles belong to the host chainId
  assertHandlesBelongToSameChainId(
    orderedHandles,
    BigInt(fhevm.chain.id) as Uint64BigInt,
  );

  // 4. Check: ACL permissions
  await checkAllowedForDecryption(fhevm, {
    handles: encryptedValues,
    options: { checkArguments: true },
  });

  // 5. Call relayer
  const { orderedAbiEncodedClearValues, kmsPublicDecryptEIP712Signatures } =
    await fhevm.runtime.relayer.fetchPublicDecrypt(
      { relayerUrl: fhevm.chain.fhevm.relayerUrl, chainId: fhevm.chain.id },
      {
        payload: {
          orderedHandles,
          extraData: hardCodedExtraData,
        },
        options: relayerOptions,
      },
    );

  ////////////////////////////////////////////////////////////////////////////
  //
  // Warning!!!! Do not use '0x00' here!! Only '0x' is permitted!
  //
  ////////////////////////////////////////////////////////////////////////////
  const signedExtraData = "0x" as BytesHex;

  // 6. Verify and Compute PublicDecryptionProof
  const publicDecryptionProof: PublicDecryptionProof =
    await createPublicDecryptionProof(fhevm, {
      orderedEncryptedValues: orderedHandles,
      orderedAbiEncodedClearValues,
      kmsPublicDecryptEIP712Signatures,
      extraData: signedExtraData,
    });

  return publicDecryptionProof;
}
