import {
  type CreateUserDecryptEIP712ReturnType,
  type CreateUserDecryptEIP712Parameters,
  createUserDecryptEIP712,
} from "../../actions/chain/createUserDecryptEIP712.js";
import {
  publicDecrypt,
  type PublicDecryptParameters,
  type PublicDecryptReturnType,
} from "../../actions/decrypt/public/publicDecrypt.js";
import {
  userDecrypt,
  type UserDecryptParameters,
  type UserDecryptReturnType,
} from "../../actions/decrypt/user/userDecrypt.js";
import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { WithDecrypt } from "../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import {
  loadFhevmDecryptionKey,
  type LoadFhevmDecryptionKeyParameters,
  type LoadFhevmDecryptionKeyReturnType,
} from "../../actions/decrypt/user/loadFhevmDecryptionKey.js";
import type { GenerateFhevmDecryptionKeyReturnType } from "../../actions/decrypt/user/generateFhevmDecryptionKey.js";
import { generateFhevmDecryptionKey } from "../../user/FhevmDecryptionKey-p.js";
import {
  getExtraData,
  type GetExtraDataParameters,
  type GetExtraDataReturnType,
} from "../../actions/host/getExtraData.js";

export type DecryptActions = {
  /** Creates an EIP-712 decrypt permit for the user to sign. Fetches extraData automatically if not provided. */
  readonly createDecryptPermit: (
    parameters: CreateUserDecryptEIP712Parameters,
  ) => CreateUserDecryptEIP712ReturnType;
  /** Reads publicly decryptable values — no keys or signatures needed. */
  readonly readPublicValue: (
    encryptedValues: PublicDecryptParameters["encryptedValues"],
  ) => Promise<PublicDecryptReturnType>;
  /** Decrypts private values using a transport key pair and signed permit. */
  readonly decrypt: (
    parameters: UserDecryptParameters,
  ) => Promise<UserDecryptReturnType>;
  /** Loads a transport key pair from serialized bytes. */
  readonly loadE2eTransportKeyPair: (
    parameters: LoadFhevmDecryptionKeyParameters,
  ) => Promise<LoadFhevmDecryptionKeyReturnType>;
  /** Generates a new end-to-end transport key pair for decryption. */
  readonly generateE2eTransportKeyPair: () => Promise<GenerateFhevmDecryptionKeyReturnType>;
  /** Gets the extraData bytes for KMS context (used in permits and encryption). */
  readonly getExtraData: (
    parameters: GetExtraDataParameters,
  ) => GetExtraDataReturnType;
};

export function decryptActions(
  fhevm: Fhevm<FhevmChain, WithDecrypt>,
): DecryptActions {
  return {
    createDecryptPermit: (parameters) =>
      createUserDecryptEIP712(fhevm, parameters),
    readPublicValue: (encryptedValues) =>
      publicDecrypt(fhevm, { encryptedValues }),
    decrypt: (parameters) => userDecrypt(fhevm, parameters),
    generateE2eTransportKeyPair: () => generateFhevmDecryptionKey(fhevm),
    loadE2eTransportKeyPair: (parameters) =>
      loadFhevmDecryptionKey(fhevm, parameters),
    getExtraData: (parameters) => getExtraData(fhevm, parameters),
  };
}
