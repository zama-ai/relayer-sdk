import type {
  Bytes32,
  Bytes32Hex,
  Bytes32HexAble,
  Bytes65Hex,
  BytesHex,
  Uint,
} from '@base/types/primitives';
import type {
  ExternalFhevmHandle,
  FhevmConfig,
  FhevmHandle,
  InputProof,
  InputProofBytes,
  ZKProof,
} from '../types/public-api';
import { MAX_UINT8, uintToBytesHexNo0x } from '@base/uint';
import {
  assertIsBytes,
  assertIsBytes65HexArray,
  assertIsBytesHex,
  bytes32ToHex,
  bytes65ToHex,
  bytesToHex,
  hexToBytes,
  unsafeBytesEquals,
} from '@base/bytes';
import { assert } from '@base/errors/InternalError';
import { remove0x } from '@base/string';
import {
  InputProofError,
  TooManyHandlesError,
} from '../errors/InputProofError';
import {
  assertFhevmHandleArrayEquals,
  toExternalFhevmHandle,
} from '@fhevm-base/FhevmHandle';
import type { EIP712Lib } from '@fhevm-base-types/public-api';
import type { RelayerFetchOptions, RelayerLib } from '@fhevm-base/types/libs';
import { verifyZKProofCoprocessorSignatures } from './verifyCoprocessorSignatures';

////////////////////////////////////////////////////////////////////////////////
// Private class InputProof
////////////////////////////////////////////////////////////////////////////////

class InputProofImpl implements InputProof {
  readonly #handles: ExternalFhevmHandle[];
  readonly #proof: BytesHex;
  readonly #coprocessorSignatures: Bytes65Hex[];
  readonly #extraData: BytesHex;

  constructor({
    proof,
    coprocessorSignatures,
    handles,
    extraData,
  }: {
    proof: BytesHex;
    coprocessorSignatures: Bytes65Hex[];
    handles: ExternalFhevmHandle[];
    extraData: BytesHex;
  }) {
    this.#proof = proof;
    this.#coprocessorSignatures = coprocessorSignatures;
    this.#handles = handles;
    this.#extraData = extraData;

    Object.freeze(this.#coprocessorSignatures);
    Object.freeze(this.#handles);
  }

  public get proof(): BytesHex {
    return this.#proof;
  }

  public get coprocessorSignatures(): Bytes65Hex[] {
    return this.#coprocessorSignatures;
  }

  public get handles(): readonly ExternalFhevmHandle[] {
    return this.#handles;
  }

  public get extraData(): BytesHex {
    return this.#extraData;
  }

  public toBytes(): InputProofBytes {
    return {
      handles: this.#handles.map((h) => h.bytes32),
      inputProof: hexToBytes(this.#proof),
    };
  }
}

////////////////////////////////////////////////////////////////////////////////
// Public API
////////////////////////////////////////////////////////////////////////////////

export function createInputProofFromCoprocessorSignatures({
  coprocessorSignatures,
  handles,
  extraData,
}: {
  readonly coprocessorSignatures: readonly Bytes65Hex[];
  readonly handles:
    | readonly Bytes32Hex[]
    | readonly Bytes32[]
    | readonly Bytes32HexAble[];
  readonly extraData: BytesHex;
}): InputProof {
  const fhevmHandles: ExternalFhevmHandle[] = handles.map(
    toExternalFhevmHandle,
  );

  assertIsBytes65HexArray(coprocessorSignatures, {});
  assertIsBytesHex(extraData, {});

  const numberOfHandles = handles.length;
  const numberOfSignatures = coprocessorSignatures.length;

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
  proof += uintToBytesHexNo0x(coprocessorSignatures.length as Uint);

  // Add handles: (uint256 | Byte32) x numHandles
  fhevmHandles.map((h) => (proof += h.bytes32HexNo0x));

  // Add signatures: (uint256 | Byte32) x numSignatures
  coprocessorSignatures.map(
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
    coprocessorSignatures: [...coprocessorSignatures],
    handles: fhevmHandles,
    extraData,
  });

  return inputProof;
}

////////////////////////////////////////////////////////////////////////////////

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

  const inputProof = createInputProofFromCoprocessorSignatures({
    coprocessorSignatures: signatures,
    handles,
    extraData,
  });

  /// Debug TO BE REMOVED
  assert(bytesToHex(proofBytes) === inputProof.proof);
  //////////

  return inputProof;
}

////////////////////////////////////////////////////////////////////////////////

export async function fetchInputProof(
  fhevm: {
    readonly config: FhevmConfig;
    readonly relayerUrl: string;
    readonly libs: {
      readonly relayerLib: RelayerLib;
      readonly eip712Lib: EIP712Lib;
    };
  },
  args: {
    readonly zkProof: ZKProof;
    readonly extraData: BytesHex;
    readonly options?: RelayerFetchOptions;
  },
): Promise<InputProof> {
  const { zkProof, extraData, options } = args;

  // 1. Request coprocessor signatures from the relayer for the given ZK proof
  const fetchResult = await fhevm.libs.relayerLib.fetchCoprocessorSignatures(
    fhevm.relayerUrl,
    {
      zkProof,
      extraData: args.extraData,
    },
    options,
  );

  // 2. extract FhevmHandles from the given ZK proof
  const fhevmHandles: readonly FhevmHandle[] = zkProof.getFhevmHandles();

  // 3. Check that the handles and the one in the fetch result
  // Note: this check is theoretically unecessary
  // We prefer to perform this test since we do not trust the relayer
  // The purpose is to check if the relayer is possibly malicious
  assertFhevmHandleArrayEquals(fhevmHandles, fetchResult.handles);

  // 2. Verify ZK proof and compute the final Input proof
  return _createInputProofFromZKProof(fhevm, {
    zkProof,
    coprocessorSignatures: fetchResult.signatures,
    extraData,
  });
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

////////////////////////////////////////////////////////////////////////////////
// Private Helpers
////////////////////////////////////////////////////////////////////////////////

async function _createInputProofFromZKProof(
  fhevm: {
    readonly libs: { readonly eip712Lib: EIP712Lib };
    readonly config: FhevmConfig;
  },
  args: {
    readonly zkProof: ZKProof;
    readonly coprocessorSignatures: readonly Bytes65Hex[];
    readonly extraData: BytesHex;
  },
): Promise<InputProof> {
  const fhevmHandles: readonly FhevmHandle[] = args.zkProof.getFhevmHandles();

  // Throws exception if message properties are invalid
  await verifyZKProofCoprocessorSignatures(fhevm, args);

  return createInputProofFromCoprocessorSignatures({
    coprocessorSignatures: args.coprocessorSignatures,
    handles: fhevmHandles,
    extraData: args.extraData,
  });
}
