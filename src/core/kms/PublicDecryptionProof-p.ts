import type { ClearValue } from "../types/encryptedTypes.js";
import type { BytesHex } from "../types/primitives.js";
import type { PublicDecryptionProof } from "../types/publicDecryptionProof.js";

//////////////////////////////////////////////////////////////////////////////
// PublicDecryptionProof class
//////////////////////////////////////////////////////////////////////////////

/**
 * @internal
 */
export class PublicDecryptionProofImpl implements PublicDecryptionProof {
  // numSigners + KMS signatures + extraData
  readonly #decryptionProof: BytesHex;
  readonly #orderedClearValues: readonly ClearValue[];
  readonly #orderedAbiEncodedClearValues: BytesHex;
  readonly #extraData: BytesHex;

  constructor(params: {
    readonly decryptionProof: BytesHex;
    readonly orderedClearValues: readonly ClearValue[];
    readonly orderedAbiEncodedClearValues: BytesHex;
    readonly extraData: BytesHex;
  }) {
    this.#decryptionProof = params.decryptionProof;
    this.#orderedClearValues = Object.freeze([...params.orderedClearValues]);
    this.#extraData = params.extraData;
    this.#orderedAbiEncodedClearValues = params.orderedAbiEncodedClearValues;
  }

  //////////////////////////////////////////////////////////////////////////////
  // Getters
  //////////////////////////////////////////////////////////////////////////////

  public get decryptionProof(): BytesHex {
    return this.#decryptionProof;
  }

  public get orderedClearValues(): readonly ClearValue[] {
    return this.#orderedClearValues;
  }

  public get orderedAbiEncodedClearValues(): BytesHex {
    return this.#orderedAbiEncodedClearValues;
  }

  public get extraData(): BytesHex {
    return this.#extraData;
  }
}

Object.freeze(PublicDecryptionProofImpl);
Object.freeze(PublicDecryptionProofImpl.prototype);
