import type { DecryptedFhevmHandle } from "../../../types/decryptedFhevmHandle.js";
import type { Fhevm } from "../../../types/coreFhevmClient.js";
import type { FhevmDecryptionKey } from "../../../types/fhevmDecryptionKey.js";
import type { FhevmHandle } from "../../../types/fhevmHandle.js";
import type { SignedPermit } from "../../chain/createSignedPermit.js";
import type { ChecksummedAddress } from "../../../types/primitives.js";
import { userDecryptWithKmsClosures } from "./userDecryptWithKmsClosures-p.js";
import type { FhevmChain } from "../../../types/fhevmChain.js";
import type { RelayerUserDecryptOptions } from "../../../types/relayer.js";

////////////////////////////////////////////////////////////////////////////////
// userDecrypt (with privateKey)
////////////////////////////////////////////////////////////////////////////////

export type UserDecryptParameters = {
  /**
   * The end-to-end transport key pair for decryption.
   * Also exported as `E2eTransportKeyPair` (new name).
   */
  readonly e2eTransportKeyPair: FhevmDecryptionKey;
  /**
   * Array of encrypted values to decrypt.
   * Each entry contains an encrypted value and its contract address.
   */
  readonly encryptedValues: ReadonlyArray<{
    encrypted: FhevmHandle;
    contractAddress: ChecksummedAddress;
  }>;
  /**
   * Signed decrypt permit containing the EIP-712 permit, signature, and signer.
   * Replaces the separate `userDecryptEIP712Signer`, `userDecryptEIP712Message`,
   * and `userDecryptEIP712Signature` parameters.
   */
  readonly signedPermit: SignedPermit;
  readonly options?: RelayerUserDecryptOptions | undefined;
};

export type UserDecryptReturnType = readonly DecryptedFhevmHandle[];

////////////////////////////////////////////////////////////////////////////////

export async function userDecrypt(
  fhevm: Fhevm<FhevmChain>,
  parameters: UserDecryptParameters,
): Promise<UserDecryptReturnType> {
  const { e2eTransportKeyPair, encryptedValues, signedPermit, ...rest } = parameters;

  // Map user-facing encryptedValues to internal handleContractPairs format
  const handleContractPairs = encryptedValues.map((item) => ({
    handle: item.encrypted,
    contractAddress: item.contractAddress,
  }));

  // Extract EIP-712 parameters from signedPermit
  const userDecryptEIP712Signer = signedPermit.signer;
  const userDecryptEIP712Message = signedPermit.permit.message;
  const userDecryptEIP712Signature = signedPermit.signature;

  return await userDecryptWithKmsClosures(fhevm, {
    ...rest,
    handleContractPairs,
    userDecryptEIP712Signer,
    userDecryptEIP712Message,
    userDecryptEIP712Signature,
    decryptAndReconstruct: (args) => e2eTransportKeyPair.decryptAndReconstruct(args),
    getTkmsPublicKeyHex: () => e2eTransportKeyPair.getTkmsPublicKeyHex(),
  });
}
