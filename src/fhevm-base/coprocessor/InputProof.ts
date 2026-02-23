import type {
  Bytes,
  Bytes32,
  Bytes32Hex,
  Bytes32HexAble,
  Bytes65Hex,
  BytesHex,
  ChecksummedAddress,
  Uint,
} from '@base/types/primitives';
import type {
  BaseInputProof,
  ExternalFhevmHandle,
  FhevmHandle,
  InputProof,
  InputProofBytes,
  InputVerifierContractData,
  UnverifiedInputProof,
  VerifiedInputProof,
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
} from '../FhevmHandle';
import type { EIP712Lib } from '@fhevm-base-types/public-api';
import type { ErrorMetadataParams } from '@base/errors/ErrorBase';
import type { RelayerFetchOptions, RelayerLib } from '../types/libs';
import { verifyHandlesCoprocessorSignatures } from './verifyCoprocessorSignatures';
import { assertIsChecksummedAddress } from '@base/address';
import { InvalidTypeError } from '@base/errors/InvalidTypeError';

////////////////////////////////////////////////////////////////////////////////
// Private class InputProof
////////////////////////////////////////////////////////////////////////////////

class InputProofImpl implements BaseInputProof {
  readonly #inputProofBytesHex: BytesHex;

  // Components of the proof
  readonly #externalHandles: readonly ExternalFhevmHandle[];
  readonly #coprocessorSignatures: readonly Bytes65Hex[];
  readonly #extraData: BytesHex;
  readonly #coprocessorSignedParams?: {
    readonly userAddress: ChecksummedAddress;
    readonly contractAddress: ChecksummedAddress;
  };

  constructor({
    inputProofBytesHex,
    coprocessorSignatures,
    externalHandles,
    extraData,
    coprocessorSignedParams,
  }: {
    readonly inputProofBytesHex: BytesHex;
    readonly coprocessorSignatures: readonly Bytes65Hex[];
    readonly externalHandles: readonly ExternalFhevmHandle[];
    readonly extraData: BytesHex;
    readonly coprocessorSignedParams?:
      | {
          readonly userAddress: ChecksummedAddress;
          readonly contractAddress: ChecksummedAddress;
        }
      | undefined;
  }) {
    // Note: it is not possible to create a ZKProof with zero values.
    // consequently, the handles array cannot be empty
    assert(externalHandles.length > 0);
    assert(coprocessorSignatures.length > 0);

    this.#inputProofBytesHex = inputProofBytesHex;
    this.#coprocessorSignatures = coprocessorSignatures;
    this.#externalHandles = externalHandles;
    this.#extraData = extraData;
    if (coprocessorSignedParams !== undefined) {
      this.#coprocessorSignedParams = { ...coprocessorSignedParams };
    }

    Object.freeze(this.#coprocessorSignatures);
    Object.freeze(this.#externalHandles);
    Object.freeze(this.#coprocessorSignedParams);
  }

  public get bytesHex(): BytesHex {
    return this.#inputProofBytesHex;
  }

  public get coprocessorSignatures(): readonly Bytes65Hex[] {
    return this.#coprocessorSignatures;
  }

  public get externalHandles(): readonly ExternalFhevmHandle[] {
    return this.#externalHandles;
  }

  public get extraData(): BytesHex {
    return this.#extraData;
  }

  public get coprocessorSignedParams():
    | {
        readonly contractAddress: ChecksummedAddress;
        readonly userAddress: ChecksummedAddress;
      }
    | undefined {
    return this.#coprocessorSignedParams;
  }

  public toBytes(): InputProofBytes {
    return {
      handles: this.#externalHandles.map((h) => h.bytes32),
      inputProof: hexToBytes(this.#inputProofBytesHex),
    };
  }
}

////////////////////////////////////////////////////////////////////////////////
// Public API
////////////////////////////////////////////////////////////////////////////////

export async function createVerifiedInputProofFromComponents(
  fhevm: {
    readonly libs: { readonly eip712Lib: EIP712Lib };
    readonly config: { readonly inputVerifier: InputVerifierContractData };
  },
  args: {
    readonly coprocessorEIP712Signatures: readonly Bytes65Hex[];
    readonly externalHandles:
      | readonly Bytes32Hex[]
      | readonly Bytes32[]
      | readonly Bytes32HexAble[];
    readonly extraData: BytesHex;
    readonly coprocessorSignedParams: {
      readonly userAddress: ChecksummedAddress;
      readonly contractAddress: ChecksummedAddress;
    };
  },
): Promise<VerifiedInputProof> {
  const inputProof = _createInputProofFromComponents(args);
  return await verifyInputProof(fhevm, { inputProof });
}

export function createUnverifiedInputProofFromComponents(args: {
  readonly coprocessorEIP712Signatures: readonly Bytes65Hex[];
  readonly externalHandles:
    | readonly Bytes32Hex[]
    | readonly Bytes32[]
    | readonly Bytes32HexAble[];
  readonly extraData: BytesHex;
}): UnverifiedInputProof {
  return _createInputProofFromComponents(args) as UnverifiedInputProof;
}

function _createInputProofFromComponents({
  coprocessorEIP712Signatures,
  externalHandles,
  extraData,
  coprocessorSignedParams,
}: {
  readonly coprocessorEIP712Signatures: readonly Bytes65Hex[];
  readonly externalHandles:
    | readonly Bytes32Hex[]
    | readonly Bytes32[]
    | readonly Bytes32HexAble[];
  readonly extraData: BytesHex;
  readonly coprocessorSignedParams?:
    | {
        readonly userAddress: ChecksummedAddress;
        readonly contractAddress: ChecksummedAddress;
      }
    | undefined;
}): BaseInputProof {
  if (externalHandles.length === 0) {
    throw new InputProofError({
      message: `Input proof must contain at least one external handle`,
    });
  }

  if (coprocessorSignedParams !== undefined) {
    assertIsChecksummedAddress(coprocessorSignedParams.userAddress, {});
    assertIsChecksummedAddress(coprocessorSignedParams.contractAddress, {});
  }

  const externalFhevmHandles: ExternalFhevmHandle[] = externalHandles.map(
    toExternalFhevmHandle,
  );

  assertIsBytes65HexArray(coprocessorEIP712Signatures, {});
  assertIsBytesHex(extraData, {});

  const numberOfHandles = externalHandles.length;
  const numberOfSignatures = coprocessorEIP712Signatures.length;

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
  proof += uintToBytesHexNo0x(externalHandles.length as Uint);

  // Add number of signatures (uint8 | Byte1)
  proof += uintToBytesHexNo0x(coprocessorEIP712Signatures.length as Uint);

  // Add handles: (uint256 | Byte32) x numHandles
  externalFhevmHandles.map((h) => (proof += h.bytes32HexNo0x));

  // Add signatures: (uint256 | Byte32) x numSignatures
  coprocessorEIP712Signatures.map(
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
    inputProofBytesHex: `0x${proof}` as BytesHex,
    coprocessorSignatures: [...coprocessorEIP712Signatures],
    externalHandles: externalFhevmHandles,
    extraData,
    coprocessorSignedParams,
  });

  return inputProof;
}

////////////////////////////////////////////////////////////////////////////////

export function createUnverifiedInputProofFromRawBytes(
  inputProofBytes: Bytes,
): UnverifiedInputProof {
  return _createInputProofFromRawBytes({
    inputProofBytes,
  }) as UnverifiedInputProof;
}

export async function createVerifiedInputProofFromRawBytes(
  fhevm: {
    readonly libs: { readonly eip712Lib: EIP712Lib };
    readonly config: { readonly inputVerifier: InputVerifierContractData };
  },
  args: {
    readonly inputProofBytes: Bytes;
    readonly coprocessorSignedParams: {
      readonly userAddress: ChecksummedAddress;
      readonly contractAddress: ChecksummedAddress;
    };
  },
): Promise<VerifiedInputProof> {
  const inputProof = _createInputProofFromRawBytes(args);
  return await verifyInputProof(fhevm, { inputProof });
}

////////////////////////////////////////////////////////////////////////////////

function _createInputProofFromRawBytes({
  inputProofBytes,
  coprocessorSignedParams,
}: {
  readonly inputProofBytes: Bytes;
  readonly coprocessorSignedParams?: {
    readonly userAddress: ChecksummedAddress;
    readonly contractAddress: ChecksummedAddress;
  };
}): BaseInputProof {
  assertIsBytes(inputProofBytes, {});

  if (inputProofBytes.length < 2) {
    throw new InputProofError({
      message: `Invalid proof: too short`,
    });
  }

  const numHandles = inputProofBytes[0];

  if (numHandles === 0) {
    throw new InputProofError({
      message: `Input proof must contain at least one external handle`,
    });
  }

  const numSignatures = inputProofBytes[1];

  const HANDLE_SIZE = 32;
  const SIGNATURE_SIZE = 65;
  const HEADER_SIZE = 2;

  const handlesStart = HEADER_SIZE;
  const handlesEnd = handlesStart + numHandles * HANDLE_SIZE;
  const signaturesStart = handlesEnd;
  const signaturesEnd = signaturesStart + numSignatures * SIGNATURE_SIZE;
  const extraDataStart = signaturesEnd;

  if (inputProofBytes.length < signaturesEnd) {
    throw new InputProofError({
      message: `Invalid proof: expected at least ${signaturesEnd} bytes, got ${inputProofBytes.length}`,
    });
  }

  // Extract handles
  const handles: Bytes32Hex[] = [];
  for (let i = 0; i < numHandles; i++) {
    const start = handlesStart + i * HANDLE_SIZE;
    const end = start + HANDLE_SIZE;
    const handleBytes = inputProofBytes.slice(start, end);
    const handleBytes32Hex = bytes32ToHex(handleBytes);
    handles.push(handleBytes32Hex);
  }

  // Extract signatures
  const signatures: Bytes65Hex[] = [];
  for (let i = 0; i < numSignatures; i++) {
    const start = signaturesStart + i * SIGNATURE_SIZE;
    const end = start + SIGNATURE_SIZE;
    const signatureBytes = inputProofBytes.slice(start, end);
    const signatureBytes65Hex = bytes65ToHex(signatureBytes);
    signatures.push(signatureBytes65Hex);
  }

  // Extract extra data
  const extraDataBytes = inputProofBytes.slice(extraDataStart);
  const extraData = bytesToHex(extraDataBytes);

  const inputProof = _createInputProofFromComponents({
    coprocessorEIP712Signatures: signatures,
    externalHandles: handles,
    extraData,
    coprocessorSignedParams,
  });

  /// Debug TO BE REMOVED
  assert(bytesToHex(inputProofBytes) === inputProof.bytesHex);
  //////////

  return inputProof;
}

////////////////////////////////////////////////////////////////////////////////

export async function fetchInputProof(
  fhevm: {
    readonly config: {
      readonly inputVerifier: InputVerifierContractData;
    };
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
): Promise<VerifiedInputProof> {
  const { zkProof, extraData, options } = args;

  // 1. extract FhevmHandles from the given ZK proof
  const fhevmHandles: readonly FhevmHandle[] = zkProof.getFhevmHandles();

  if (fhevmHandles.length === 0) {
    throw new InputProofError({
      message: `Input proof must contain at least one external handle`,
    });
  }

  // 2. Request coprocessor signatures from the relayer for the given ZK proof
  const {
    handles: coprocessorSignedHandles,
    coprocessorEIP712Signatures: coprocessorSignatures,
  } = await fhevm.libs.relayerLib.fetchCoprocessorSignatures(
    fhevm.relayerUrl,
    {
      zkProof,
      extraData,
    },
    options,
  );

  // 3. Check that the handles and the one in the fetch result
  // Note: this check is theoretically unecessary
  // We prefer to perform this test since we do not trust the relayer
  // The purpose is to check if the relayer is possibly malicious
  assertFhevmHandleArrayEquals(fhevmHandles, coprocessorSignedHandles);

  // 4. Verify ZK proof and Compute the final Input proof
  return await createVerifiedInputProofFromComponents(fhevm, {
    coprocessorEIP712Signatures: coprocessorSignatures,
    externalHandles: fhevmHandles,
    extraData: extraData,
    coprocessorSignedParams: {
      userAddress: zkProof.userAddress,
      contractAddress: zkProof.contractAddress,
    },
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

export async function verifyInputProof(
  fhevm: {
    readonly libs: { readonly eip712Lib: EIP712Lib };
    readonly config: { readonly inputVerifier: InputVerifierContractData };
  },
  args: {
    readonly inputProof: InputProof;
    readonly coprocessorSignedParams?: {
      readonly userAddress: ChecksummedAddress;
      readonly contractAddress: ChecksummedAddress;
    };
  },
): Promise<VerifiedInputProof> {
  const coprocessorSignedParams =
    args.coprocessorSignedParams ?? args.inputProof.coprocessorSignedParams;
  if (coprocessorSignedParams === undefined) {
    throw new InputProofError({
      message: 'Missing coprocessorSignedParams argument.',
    });
  }

  const chainId = args.inputProof.externalHandles[0].chainId;
  await verifyHandlesCoprocessorSignatures(fhevm, {
    chainId,
    coprocessorSignatures: args.inputProof.coprocessorSignatures,
    extraData: args.inputProof.extraData,
    handles: args.inputProof.externalHandles,
    userAddress: coprocessorSignedParams.userAddress,
    contractAddress: coprocessorSignedParams.contractAddress,
  });

  return args.inputProof as VerifiedInputProof;
}

export function isInputProof(value: unknown): value is InputProof {
  return value instanceof InputProofImpl;
}

export function assertIsInputProof(
  value: unknown,
  options: { subject?: string } & ErrorMetadataParams,
): asserts value is InputProof {
  if (!isInputProof(value)) {
    throw new InvalidTypeError(
      {
        subject: options.subject,
        type: typeof value,
        expectedType: 'Custom',
        expectedCustomType: 'InputProof',
      },
      options,
    );
  }
}

export function isVerifiedInputProof(
  value: unknown,
): value is VerifiedInputProof & {
  readonly coprocessorSignedParams: {
    readonly userAddress: ChecksummedAddress;
    readonly contractAddress: ChecksummedAddress;
  };
} {
  return isInputProof(value) && value.coprocessorSignedParams !== undefined;
}

export function assertIsVerifiedInputProof(
  value: unknown,
  options: { subject?: string } & ErrorMetadataParams,
): asserts value is VerifiedInputProof {
  if (!isVerifiedInputProof(value)) {
    throw new InvalidTypeError(
      {
        subject: options.subject,
        type: typeof value,
        expectedType: 'Custom',
        expectedCustomType: 'VerifiedInputProof',
      },
      options,
    );
  }
}
