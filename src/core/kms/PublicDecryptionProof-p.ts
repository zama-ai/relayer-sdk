import type { BytesHex } from "../types/primitives.js";
import type { PublicDecryptionProof } from "../types/publicDecryptionProof.js";
import type { DecryptedFhevmHandle } from "../types/decryptedFhevmHandle.js";

//////////////////////////////////////////////////////////////////////////////
// PublicDecryptionProof class
//////////////////////////////////////////////////////////////////////////////

/**
 * @internal
 */
export class PublicDecryptionProofImpl implements PublicDecryptionProof {
  // numSigners + KMS signatures + extraData
  readonly #decryptionProof: BytesHex;
  readonly #values: readonly DecryptedFhevmHandle[];
  readonly #orderedAbiEncodedClearValues: BytesHex;
  readonly #extraData: BytesHex;

  constructor(params: {
    readonly decryptionProof: BytesHex;
    readonly values: readonly DecryptedFhevmHandle[];
    readonly orderedAbiEncodedClearValues: BytesHex;
    readonly extraData: BytesHex;
  }) {
    this.#decryptionProof = params.decryptionProof;
    this.#values = Object.freeze([
      ...params.values,
    ]);
    this.#extraData = params.extraData;
    this.#orderedAbiEncodedClearValues = params.orderedAbiEncodedClearValues;
  }

  //////////////////////////////////////////////////////////////////////////////
  // Getters
  //////////////////////////////////////////////////////////////////////////////

  public get decryptionProof(): BytesHex {
    return this.#decryptionProof;
  }

  public get values(): readonly DecryptedFhevmHandle[] {
    return this.#values;
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
