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
import type { Bytes, BytesHex } from "../../../types/primitives.js";
import { hexToBytesFaster } from "../../../base/bytes.js";

////////////////////////////////////////////////////////////////////////////////

export type LoadFhevmDecryptionKeyParameters = {
  readonly tkmsPrivateKeyBytes: Bytes | BytesHex;
};

export type LoadFhevmDecryptionKeyReturnType = FhevmDecryptionKey;

export async function loadFhevmDecryptionKey(
  fhevm: Fhevm<FhevmChain | undefined, WithDecrypt, OptionalNativeClient>,
  parameters: LoadFhevmDecryptionKeyParameters,
): Promise<LoadFhevmDecryptionKeyReturnType> {
  let tkmsPrivateKeyBytes: Bytes;
  if (typeof parameters.tkmsPrivateKeyBytes === "string") {
    tkmsPrivateKeyBytes = hexToBytesFaster(parameters.tkmsPrivateKeyBytes, {
      strict: true,
    });
  } else {
    tkmsPrivateKeyBytes = parameters.tkmsPrivateKeyBytes;
  }

  const tkmsPrivateKey = await fhevm.runtime.decrypt.deserializeTkmsPrivateKey({
    tkmsPrivateKeyBytes,
  });

  return createFhevmDecryptionKey(fhevm.runtime, { tkmsPrivateKey });
}

////////////////////////////////////////////////////////////////////////////////
