import {
  type CreateKmsUserDecryptEIP712ReturnType,
  type CreateKmsUserDecryptEIP712Parameters,
  createKmsUserDecryptEIP712,
} from "../../actions/chain/createKmsUserDecryptEIP712.js";
import {
  type CreateKmsDelegatedUserDecryptEIP712ReturnType,
  type CreateKmsDelegatedUserDecryptEIP712Parameters,
  createKmsDelegatedUserDecryptEIP712,
} from "../../actions/chain/createKmsDelegatedUserDecryptEIP712.js";
import {
  publicDecrypt,
  type PublicDecryptParameters,
  type PublicDecryptReturnType,
} from "../../actions/base/publicDecrypt.js";
import {
  decrypt,
  type DecryptParameters,
  type DecryptReturnType,
} from "../../actions/decrypt/decrypt.js";
import type {
  Fhevm,
  FhevmBase,
  FhevmExtension,
  OptionalNativeClient,
} from "../../types/coreFhevmClient.js";
import type {
  FhevmRuntime,
  WithDecrypt,
} from "../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import type { GenerateE2eTransportKeypairReturnType } from "../../actions/decrypt/generateE2eTransportKeypair.js";
import type { DecryptModuleFactory } from "../../modules/decrypt/types.js";
import {
  asFhevmClientWith,
  assertIsFhevmClientWith,
} from "../../runtime/CoreFhevm-p.js";
import { generateE2eTransportKeypair } from "../../kms/E2eTransportKeypair-p.js";

////////////////////////////////////////////////////////////////////////////////

export type DecryptActions = {
  readonly createUserDecryptEIP712: (
    parameters: CreateKmsUserDecryptEIP712Parameters,
  ) => CreateKmsUserDecryptEIP712ReturnType;
  readonly createDelegatedUserDecryptEIP712: (
    parameters: CreateKmsDelegatedUserDecryptEIP712Parameters,
  ) => CreateKmsDelegatedUserDecryptEIP712ReturnType;
  readonly publicDecrypt: (
    parameters: PublicDecryptParameters,
  ) => Promise<PublicDecryptReturnType>;
  readonly decrypt: (
    parameters: DecryptParameters,
  ) => Promise<DecryptReturnType>;
  readonly generateE2eTransportKeypair: () => Promise<GenerateE2eTransportKeypairReturnType>;
};

////////////////////////////////////////////////////////////////////////////////

function _decryptActions(
  fhevm: Fhevm<FhevmChain, WithDecrypt>,
): DecryptActions {
  return {
    createUserDecryptEIP712: (parameters) =>
      createKmsUserDecryptEIP712(fhevm, parameters),
    createDelegatedUserDecryptEIP712: (parameters) =>
      createKmsDelegatedUserDecryptEIP712(fhevm, parameters),
    publicDecrypt: (parameters) => publicDecrypt(fhevm, parameters),
    decrypt: (parameters) => decrypt(fhevm, parameters),
    generateE2eTransportKeypair: () => generateE2eTransportKeypair(fhevm),
  };
}

////////////////////////////////////////////////////////////////////////////////

function _initDecrypt(
  fhevm: FhevmBase<FhevmChain | undefined, FhevmRuntime, OptionalNativeClient>,
): Promise<void> {
  const f = asFhevmClientWith(fhevm, "decrypt");
  return f.runtime.decrypt.initTkmsModule();
}

////////////////////////////////////////////////////////////////////////////////

export function decryptActionsWithModule(
  fhevm: FhevmBase<FhevmChain>,
  factory: DecryptModuleFactory,
): FhevmExtension<DecryptActions, WithDecrypt> {
  const runtime = fhevm.runtime.extend(factory);
  assertIsFhevmClientWith(fhevm, "decrypt");
  return {
    actions: _decryptActions(fhevm),
    runtime,
    init: _initDecrypt,
  };
}
