import { bytesToHexLarge } from "../../base/bytes.js";
import type {
  Fhevm,
  OptionalNativeClient,
} from "../../types/coreFhevmClient.js";
import type { WithTkmsKey } from "../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import type { Bytes, BytesHex } from "../../types/primitives.js";

////////////////////////////////////////////////////////////////////////////////

export type GenerateTkmsPrivateKeyReturnType = BytesHex;

export async function generateTkmsPrivateKey(
  fhevm: Fhevm<FhevmChain | undefined, WithTkmsKey, OptionalNativeClient>,
): Promise<GenerateTkmsPrivateKeyReturnType> {
  const tkmsPrivateKey = await fhevm.runtime.tkmsKey.generateTkmsPrivateKey();
  const tkmsPrivateKeyBytes: Bytes =
    await fhevm.runtime.tkmsKey.serializeTkmsPrivateKey({ tkmsPrivateKey });
  return bytesToHexLarge(tkmsPrivateKeyBytes, false /* no0x */);
}

////////////////////////////////////////////////////////////////////////////////
