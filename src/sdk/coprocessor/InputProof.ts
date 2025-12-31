import type {
  Bytes32,
  Bytes32Hex,
  Bytes65Hex,
  BytesHex,
} from '../../types/primitives';
import { MAX_UINT8, uintToBytesHexNo0x } from '../../utils/uint';
import {
  assertIsBytes65HexArray,
  assertIsBytesHex,
  bytesEquals,
  bytesToHex,
  hexToBytes,
  hexToBytes32,
  toBytes32HexArray,
} from '../../utils/bytes';
import { RelayerTooManyHandlesError } from '../../errors/RelayerTooManyHandlesError';
import { assertRelayer } from '../../errors/InternalError';
import { remove0x } from '../../utils/string';
import { RelayerInvalidProofError } from '../../errors/RelayerInvalidProofError';

export class InputProof {
  #proof: BytesHex;
  #signatures: Bytes65Hex[];
  #handles: Bytes32Hex[];
  #extraData: BytesHex;

  private constructor({
    proof,
    signatures,
    handles,
    extraData,
  }: {
    proof: BytesHex;
    signatures: Bytes65Hex[];
    handles: Bytes32Hex[];
    extraData: BytesHex;
  }) {
    this.#proof = proof;
    this.#signatures = signatures;
    this.#handles = handles;
    this.#extraData = extraData;

    Object.freeze(this.#signatures);
    Object.freeze(this.#handles);
  }

  public get proof(): BytesHex {
    return this.#proof;
  }

  public get signatures(): Bytes65Hex[] {
    return this.#signatures;
  }

  public get handles(): Bytes32Hex[] {
    return this.#handles;
  }

  public get extraData(): BytesHex {
    return this.#extraData;
  }

  public toBytes(): {
    handles: Uint8Array[];
    inputProof: Uint8Array;
  } {
    return {
      handles: this.#handles.map((h) => hexToBytes32(h)),
      inputProof: hexToBytes(this.#proof),
    };
  }

  public static from({
    signatures,
    handles,
    extraData,
  }: {
    readonly signatures: readonly Bytes65Hex[];
    readonly handles: readonly Bytes32Hex[] | readonly Bytes32[];
    readonly extraData: BytesHex;
  }): InputProof {
    const handlesBytes32Hex: Bytes32Hex[] = toBytes32HexArray(handles);

    assertIsBytes65HexArray(signatures);
    assertIsBytesHex(extraData);

    const numberOfHandles = handles.length;
    const numberOfSignatures = signatures.length;

    if (numberOfHandles > MAX_UINT8) {
      throw new RelayerTooManyHandlesError({ numberOfHandles });
    }

    assertRelayer(numberOfSignatures <= MAX_UINT8);

    const numHandlesHexByte1 = uintToBytesHexNo0x(numberOfHandles);
    const numSignaturesHexByte1 = uintToBytesHexNo0x(numberOfHandles);

    assertRelayer(numHandlesHexByte1.length === 2); // Byte1
    assertRelayer(numSignaturesHexByte1.length === 2); // Byte1

    //
    // Proof format :
    // ==============
    //
    // <len(handles)><len(signatures)><concat(handles)><concat(signatures)>
    //
    // size: Byte1 + Byte1 + len(handles)*Bytes32 + len(signatures)*Bytes65
    //

    let proof: string = '';

    // Add number of handles (uint8 | Byte1)
    proof += uintToBytesHexNo0x(handles.length);

    // Add number of signatures (uint8 | Byte1)
    proof += uintToBytesHexNo0x(signatures.length);

    // Add handles: (uint256 | Byte32) x numHandles
    handlesBytes32Hex.map(
      (handleBytes32Hex: Bytes32Hex) => (proof += remove0x(handleBytes32Hex)),
    );

    // Add signatures: (uint256 | Byte32) x numSignatures
    signatures.map(
      (signatureBytesHex: BytesHex) => (proof += remove0x(signatureBytesHex)),
    );

    // Append the extra data to the input proof
    proof += remove0x(extraData);

    // Make sure we get the right size
    assertRelayer(
      proof.length ===
        (1 + 1 + numberOfHandles * 32 + numberOfSignatures * 65) * 2 +
          (extraData.length - 2),
    );

    const inputProof = new InputProof({
      proof: `0x${proof}`,
      signatures: [...signatures],
      handles: [...handlesBytes32Hex],
      extraData,
    });

    return inputProof;
  }

  /**
   * Validates that the provided handles and inputProof bytes match this InputProof.
   * Use this as a sanity check to ensure handles correspond to the proof data.
   */
  public equalsBytes({
    handles,
    inputProof,
  }: {
    handles: Uint8Array[];
    inputProof: Uint8Array;
  }): boolean {
    const b = this.toBytes();
    if (handles.length !== b.handles.length) {
      return false;
    }
    for (let i = 0; i < handles.length; ++i) {
      const b1 = b.handles[i];
      const b2 = handles[i];
      if (!bytesEquals(b1, b2)) {
        return false;
      }
    }
    return bytesEquals(b.inputProof, inputProof);
  }

  public static fromProofBytes(proofBytes: Uint8Array): InputProof {
    if (proofBytes.length < 2) {
      throw new RelayerInvalidProofError({
        message: `Invalid proof: too short`,
      });
    }

    const numHandles = proofBytes[0]!;
    const numSignatures = proofBytes[1]!;

    const HANDLE_SIZE = 32;
    const SIGNATURE_SIZE = 65;
    const HEADER_SIZE = 2;

    const handlesStart = HEADER_SIZE;
    const handlesEnd = handlesStart + numHandles * HANDLE_SIZE;
    const signaturesStart = handlesEnd;
    const signaturesEnd = signaturesStart + numSignatures * SIGNATURE_SIZE;
    const extraDataStart = signaturesEnd;

    if (proofBytes.length < signaturesEnd) {
      throw new RelayerInvalidProofError({
        message: `Invalid proof: expected at least ${signaturesEnd} bytes, got ${proofBytes.length}`,
      });
    }

    // Extract handles
    const handles: Bytes32Hex[] = [];
    for (let i = 0; i < numHandles; i++) {
      const start = handlesStart + i * HANDLE_SIZE;
      const end = start + HANDLE_SIZE;
      const handleBytes = proofBytes.slice(start, end);
      const handleHex = bytesToHex(handleBytes) as Bytes32Hex;
      handles.push(handleHex);
    }

    // Extract signatures
    const signatures: Bytes65Hex[] = [];
    for (let i = 0; i < numSignatures; i++) {
      const start = signaturesStart + i * SIGNATURE_SIZE;
      const end = start + SIGNATURE_SIZE;
      const signatureBytes = proofBytes.slice(start, end);
      const signatureHex = bytesToHex(signatureBytes) as Bytes65Hex;
      signatures.push(signatureHex);
    }

    // Extract extra data
    const extraDataBytes = proofBytes.slice(extraDataStart);
    const extraData = bytesToHex(extraDataBytes);

    const inputProof = InputProof.from({ signatures, handles, extraData });

    /// Debug TO BE REMOVED
    assertRelayer(bytesToHex(proofBytes) === inputProof.proof);
    //////////

    return inputProof;
  }
}
