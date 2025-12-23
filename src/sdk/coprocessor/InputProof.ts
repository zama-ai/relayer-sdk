import { MAX_UINT8, uintToHexNo0x } from '../../utils/uint';
import {
  assertIsBytes32HexArray,
  assertIsBytes65HexArray,
  assertIsBytesHex,
  bytesToHex,
} from '../../utils/bytes';
import { RelayerTooManyHandlesError } from '../../errors/RelayerTooManyHandlesError';
import { assertRelayer } from '../../errors/InternalError';
import { remove0x } from '../../utils/string';
import { RelayerInvalidProofError } from '../../errors/RelayerInvalidProofError';
import { Bytes32Hex, Bytes65Hex, BytesHex } from '../../types/primitives';

export class InputProof {
  private readonly _proof: BytesHex;
  private readonly _signatures: Bytes65Hex[];
  private readonly _handles: Bytes32Hex[];
  private readonly _extraData: BytesHex;

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
    this._proof = proof;
    this._signatures = signatures;
    this._handles = handles;
    this._extraData = extraData;

    Object.freeze(this._signatures);
    Object.freeze(this._handles);
  }

  public get proof(): BytesHex {
    return this._proof;
  }

  public get signatures(): Bytes65Hex[] {
    return this._signatures;
  }

  public get handles(): Bytes32Hex[] {
    return this._handles;
  }

  public get extraData(): BytesHex {
    return this._extraData;
  }

  public static from({
    signatures,
    handles,
    extraData,
  }: {
    signatures: Bytes65Hex[];
    handles: Bytes32Hex[];
    extraData: BytesHex;
  }): InputProof {
    assertIsBytes65HexArray(signatures);
    assertIsBytes32HexArray(handles);
    assertIsBytesHex(extraData);

    const numberOfHandles = handles.length;
    const numberOfSignatures = signatures.length;

    if (numberOfHandles > MAX_UINT8) {
      throw new RelayerTooManyHandlesError({ numberOfHandles });
    }

    assertRelayer(numberOfSignatures <= MAX_UINT8);

    const numHandlesHexByte1 = uintToHexNo0x(numberOfHandles);
    const numSignaturesHexByte1 = uintToHexNo0x(numberOfHandles);

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
    proof += uintToHexNo0x(handles.length);

    // Add number of signatures (uint8 | Byte1)
    proof += uintToHexNo0x(signatures.length);

    // Add handles: (uint256 | Byte32) x numHandles
    handles.map(
      (handlesBytes32Hex: Bytes32Hex) => (proof += remove0x(handlesBytes32Hex)),
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
      handles: [...handles],
      extraData,
    });

    return inputProof;
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

    // Debug TO BE REMOVED
    const pb = bytesToHex(proofBytes);
    assertRelayer(pb === inputProof.proof);
    //////////

    return inputProof;
  }
}
