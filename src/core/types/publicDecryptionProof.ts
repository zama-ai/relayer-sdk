import type { ClearValue } from "./encryptedTypes.js";
import type { BytesHex } from "./primitives.js";

////////////////////////////////////////////////////////////////////////////////
//
// PublicDecryptionProof
//
////////////////////////////////////////////////////////////////////////////////

export interface PublicDecryptionProof {
  readonly decryptionProof: BytesHex;
  readonly orderedClearValues: readonly ClearValue[];
  readonly orderedAbiEncodedClearValues: BytesHex;
  readonly extraData: BytesHex;
}
