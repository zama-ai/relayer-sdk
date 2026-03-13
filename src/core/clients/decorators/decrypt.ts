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
import type { WithDecryptAndRelayer } from "../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../types/fhevmChain.js";

export type DecryptActions = {
  readonly publicDecrypt: (
    parameters: PublicDecryptParameters,
  ) => Promise<PublicDecryptReturnType>;
  readonly userDecrypt: (
    parameters: UserDecryptParameters,
  ) => Promise<UserDecryptReturnType>;
};

export function decryptActions(
  fhevm: Fhevm<FhevmChain, WithDecryptAndRelayer>,
): DecryptActions {
  return {
    publicDecrypt: (parameters) => publicDecrypt(fhevm, parameters),
    userDecrypt: (parameters) => userDecrypt(fhevm, parameters),
  };
}
