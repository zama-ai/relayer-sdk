import type {
  Bytes32,
  Bytes32Hex,
  Bytes65Hex,
  BytesHex,
  Uint,
} from '@base/types/primitives';
import type { InputProof, InputProofBytes } from './public-api';
import { MAX_UINT8, uintToBytesHexNo0x } from '@base/uint';
import {
  assertIsBytes,
  assertIsBytes65HexArray,
  assertIsBytesHex,
  bytes32ToHex,
  bytes65ToHex,
  bytesToHex,
  hexToBytes,
  hexToBytes32,
  toBytes32HexArray,
  unsafeBytesEquals,
} from '@base/bytes';
import { assert } from '@base/errors/InternalError';
import { remove0x } from '@base/string';
import {
  InputProofError,
  TooManyHandlesError,
} from '../errors/InputProofError';

////////////////////////////////////////////////////////////////////////////////
// Private class InputProof
////////////////////////////////////////////////////////////////////////////////

class InputProofImpl implements InputProof {
  readonly #handles: Bytes32Hex[];
  readonly #proof: BytesHex;
  readonly #signatures: Bytes65Hex[];
  readonly #extraData: BytesHex;

  constructor({
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

  public toBytes(): InputProofBytes {
    return {
      handles: this.#handles.map((h) => hexToBytes32(h)),
      inputProof: hexToBytes(this.#proof),
    };
  }
}

////////////////////////////////////////////////////////////////////////////////
// Public API
////////////////////////////////////////////////////////////////////////////////

export function createInputProofFromSignatures({
  signatures,
  handles,
  extraData,
}: {
  readonly signatures: readonly Bytes65Hex[];
  readonly handles: readonly Bytes32Hex[] | readonly Bytes32[];
  readonly extraData: BytesHex;
}): InputProof {
  let handlesBytes32Hex: Bytes32Hex[];
  try {
    handlesBytes32Hex = toBytes32HexArray(handles);
  } catch {
    throw new InputProofError({
      message: 'Invalid handles. Expecting bytes32[] or bytes32Hex[]',
    });
  }

  assertIsBytes65HexArray(signatures, {});
  assertIsBytesHex(extraData, {});

  const numberOfHandles = handles.length;
  const numberOfSignatures = signatures.length;

  if (numberOfHandles > MAX_UINT8) {
    throw new TooManyHandlesError({ numberOfHandles });
  }

  assert(numberOfSignatures <= MAX_UINT8);

  const numHandlesHexByte1 = uintToBytesHexNo0x(numberOfHandles as Uint);
  const numSignaturesHexByte1 = uintToBytesHexNo0x(numberOfHandles as Uint);

  assert(numHandlesHexByte1.length === 2); // Byte1
  assert(numSignaturesHexByte1.length === 2); // Byte1

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
  proof += uintToBytesHexNo0x(handles.length as Uint);

  // Add number of signatures (uint8 | Byte1)
  proof += uintToBytesHexNo0x(signatures.length as Uint);

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
  assert(
    proof.length ===
      (1 + 1 + numberOfHandles * 32 + numberOfSignatures * 65) * 2 +
        (extraData.length - 2),
  );

  const inputProof = new InputProofImpl({
    proof: `0x${proof}` as BytesHex,
    signatures: [...signatures],
    handles: [...handlesBytes32Hex],
    extraData,
  });

  return inputProof;
}

export function createInputProofFromRawBytes(
  proofBytes: Uint8Array,
): InputProof {
  assertIsBytes(proofBytes, {});

  if (proofBytes.length < 2) {
    throw new InputProofError({
      message: `Invalid proof: too short`,
    });
  }

  const numHandles = proofBytes[0];
  const numSignatures = proofBytes[1];

  const HANDLE_SIZE = 32;
  const SIGNATURE_SIZE = 65;
  const HEADER_SIZE = 2;

  const handlesStart = HEADER_SIZE;
  const handlesEnd = handlesStart + numHandles * HANDLE_SIZE;
  const signaturesStart = handlesEnd;
  const signaturesEnd = signaturesStart + numSignatures * SIGNATURE_SIZE;
  const extraDataStart = signaturesEnd;

  if (proofBytes.length < signaturesEnd) {
    throw new InputProofError({
      message: `Invalid proof: expected at least ${signaturesEnd} bytes, got ${proofBytes.length}`,
    });
  }

  // Extract handles
  const handles: Bytes32Hex[] = [];
  for (let i = 0; i < numHandles; i++) {
    const start = handlesStart + i * HANDLE_SIZE;
    const end = start + HANDLE_SIZE;
    const handleBytes = proofBytes.slice(start, end);
    const handleBytes32Hex = bytes32ToHex(handleBytes);
    handles.push(handleBytes32Hex);
  }

  // Extract signatures
  const signatures: Bytes65Hex[] = [];
  for (let i = 0; i < numSignatures; i++) {
    const start = signaturesStart + i * SIGNATURE_SIZE;
    const end = start + SIGNATURE_SIZE;
    const signatureBytes = proofBytes.slice(start, end);
    const signatureBytes65Hex = bytes65ToHex(signatureBytes);
    signatures.push(signatureBytes65Hex);
  }

  // Extract extra data
  const extraDataBytes = proofBytes.slice(extraDataStart);
  const extraData = bytesToHex(extraDataBytes);

  const inputProof = createInputProofFromSignatures({
    signatures,
    handles,
    extraData,
  });

  /// Debug TO BE REMOVED
  assert(bytesToHex(proofBytes) === inputProof.proof);
  //////////

  return inputProof;
}

/**
 * Validates that the provided handles and inputProof bytes match this InputProof.
 * Use this as a sanity check to ensure handles correspond to the proof data.
 */
export function inputProofBytesEquals(
  bytesA: InputProofBytes,
  bytesB: InputProofBytes,
): boolean {
  if (bytesA.handles.length !== bytesB.handles.length) {
    return false;
  }
  for (let i = 0; i < bytesA.handles.length; ++i) {
    const a = bytesA.handles[i];
    const b = bytesB.handles[i];
    if (!unsafeBytesEquals(a, b)) {
      return false;
    }
  }
  return unsafeBytesEquals(bytesA.inputProof, bytesB.inputProof);
}
