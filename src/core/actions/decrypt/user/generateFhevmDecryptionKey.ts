import {
  createFhevmDecryptionKey,
  type FhevmDecryptionKey,
} from "../../../user/FhevmDecryptionKey-p.js";
import type {
  Fhevm,
  OptionalNativeClient,
} from "../../../types/coreFhevmClient.js";
import type { WithDecrypt } from "../../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../../types/fhevmChain.js";

////////////////////////////////////////////////////////////////////////////////

export type GenerateFhevmDecryptionKeyReturnType = FhevmDecryptionKey;

export async function generateFhevmDecryptionKey(
  fhevm: Fhevm<FhevmChain | undefined, WithDecrypt, OptionalNativeClient>,
): Promise<GenerateFhevmDecryptionKeyReturnType> {
  const tkmsPrivateKey = await fhevm.runtime.decrypt.generateTkmsPrivateKey();
  return createFhevmDecryptionKey(fhevm.runtime, { tkmsPrivateKey });
}

////////////////////////////////////////////////////////////////////////////////
