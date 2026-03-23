import type { DecryptedFhevmHandle } from "../../../types/decryptedFhevmHandle.js";
import type { Fhevm } from "../../../types/coreFhevmClient.js";
import type { FhevmDecryptionKey } from "../../../types/fhevmDecryptionKey.js";
import type { FhevmHandle } from "../../../types/fhevmHandle.js";
import type { KmsUserDecryptEIP712Message } from "../../../types/kms.js";
import type {
  Bytes65Hex,
  ChecksummedAddress,
} from "../../../types/primitives.js";
import { userDecryptWithKmsClosures } from "./userDecryptWithKmsClosures-p.js";
import type { FhevmChain } from "../../../types/fhevmChain.js";
import type { RelayerUserDecryptOptions } from "../../../types/relayer.js";

////////////////////////////////////////////////////////////////////////////////
// userDecrypt (with privateKey)
////////////////////////////////////////////////////////////////////////////////

export type UserDecryptParameters = {
  readonly decryptionKey: FhevmDecryptionKey;
  readonly handleContractPairs: ReadonlyArray<{
    handle: FhevmHandle;
    contractAddress: ChecksummedAddress;
  }>;
  readonly userDecryptEIP712Signer: ChecksummedAddress;
  readonly userDecryptEIP712Message: KmsUserDecryptEIP712Message;
  readonly userDecryptEIP712Signature: Bytes65Hex;
  readonly options?: RelayerUserDecryptOptions | undefined;
};

export type UserDecryptReturnType = readonly DecryptedFhevmHandle[];

////////////////////////////////////////////////////////////////////////////////

export async function userDecrypt(
  fhevm: Fhevm<FhevmChain>,
  parameters: UserDecryptParameters,
): Promise<UserDecryptReturnType> {
  const { decryptionKey, ...rest } = parameters;
  return await userDecryptWithKmsClosures(fhevm, {
    ...rest,
    decryptAndReconstruct: (args) => decryptionKey.decryptAndReconstruct(args),
    getTkmsPublicKeyHex: () => decryptionKey.getTkmsPublicKeyHex(),
  });
}
