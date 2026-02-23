import type { ErrorMetadataParams } from '@base/errors/ErrorBase';
import type {
  Bytes21Hex,
  Bytes32,
  Bytes32Hex,
  Uint64BigInt,
  Uint8Number,
} from '@base/types/primitives';
import type {
  EncryptionBits,
  ExternalFhevmHandle,
  FheTypeId,
  FheTypeName,
  FhevmHandle,
  FhevmHandleBytes32,
  FhevmHandleBytes32Hex,
  FhevmHandleBytes32HexNo0x,
  FhevmHandleLike,
  SolidityPrimitiveTypeName,
} from './types/public-api';
import type { Prettify } from '@base/types/utils';
import { FhevmHandleError } from './errors/FhevmHandleError';
import {
  asBytes21,
  assertIsBytes32,
  assertIsBytes32Hex,
  bytes32ToHex,
  bytesHexSlice,
  bytesHexUint64At,
  bytesHexUint8At,
  bytesUint8At,
  hexToBytes,
  hexToBytes32,
  isBytes32,
  isBytes32Hex,
} from '@base/bytes';
import {
  encryptionBitsFromFheTypeId,
  fheTypeNameFromId,
  isFheTypeId,
  solidityPrimitiveTypeNameFromFheTypeId,
} from './FheType';
import { remove0x } from '@base/string';
import { asUint8Number, uint64ToBytes32 } from '@base/uint';
import { InvalidTypeError } from '@base/errors/InvalidTypeError';

////////////////////////////////////////////////////////////////////////////////

export const FHEVM_HANDLE_CURRENT_CIPHERTEXT_VERSION = 0;

////////////////////////////////////////////////////////////////////////////////

const FHEVM_HANDLE_HASH21_BYTE_OFFSET = 0 as Uint8Number;
const FHEVM_HANDLE_INDEX_BYTE_OFFSET = 21 as Uint8Number;
const FHEVM_HANDLE_CHAINID_BYTE_OFFSET = 22 as Uint8Number;
const FHEVM_HANDLE_FHETYPEID_BYTE_OFFSET = 30 as Uint8Number;
const FHEVM_HANDLE_VERSION_BYTE_OFFSET = 31 as Uint8Number;

////////////////////////////////////////////////////////////////////////////////
// FhevmHandle
////////////////////////////////////////////////////////////////////////////////

class FhevmHandleImpl implements FhevmHandle {
  //////////////////////////////////////////////////////////////////////////////
  // Instance Properties
  //////////////////////////////////////////////////////////////////////////////

  readonly #handleBytes32Hex: FhevmHandleBytes32Hex;
  #handleBytes32: Bytes32 | undefined;

  constructor(params: {
    handleBytes32Hex: FhevmHandleBytes32Hex;
    handleBytes32?: FhevmHandleBytes32;
  }) {
    this.#handleBytes32Hex = params.handleBytes32Hex;
    this.#handleBytes32 = params.handleBytes32; // takes ownership, no copy
  }

  //////////////////////////////////////////////////////////////////////////////
  // Instance Getters
  //////////////////////////////////////////////////////////////////////////////

  public get bytes32Hex(): FhevmHandleBytes32Hex {
    return this.#handleBytes32Hex;
  }

  public get bytes32HexNo0x(): FhevmHandleBytes32HexNo0x {
    return remove0x(this.#handleBytes32Hex) as FhevmHandleBytes32HexNo0x;
  }

  public get bytes32(): FhevmHandleBytes32 {
    if (this.#handleBytes32 === undefined) {
      this.#handleBytes32 = hexToBytes32(this.#handleBytes32Hex);
    }
    return new Uint8Array(this.#handleBytes32) as FhevmHandleBytes32;
  }

  public get hash21(): Bytes21Hex {
    // Extract hash21 (bytes 0-20)
    return bytesHexSlice(
      this.#handleBytes32Hex,
      FHEVM_HANDLE_HASH21_BYTE_OFFSET,
      21,
    );
  }

  public get chainId(): Uint64BigInt {
    // Extract chainId (bytes 22-29, 8 bytes as big-endian uint64)
    return bytesHexUint64At(
      this.#handleBytes32Hex,
      FHEVM_HANDLE_CHAINID_BYTE_OFFSET,
    );
  }

  public get fheTypeId(): FheTypeId {
    // Extract fheTypeId (byte 30)
    return bytesHexUint8At(
      this.#handleBytes32Hex,
      FHEVM_HANDLE_FHETYPEID_BYTE_OFFSET,
    ) as FheTypeId;
  }

  public get fheTypeName(): FheTypeName {
    return fheTypeNameFromId(this.fheTypeId);
  }

  public get version(): Uint8Number {
    // Extract version (byte 31)
    return bytesHexUint8At(
      this.#handleBytes32Hex,
      FHEVM_HANDLE_VERSION_BYTE_OFFSET,
    );
  }

  public get isComputed(): boolean {
    return this.index === undefined;
  }

  public get index(): Uint8Number | undefined {
    // Extract index (byte 21) - 255 means computed
    const indexUint8: Uint8Number = bytesHexUint8At(
      this.#handleBytes32Hex,
      FHEVM_HANDLE_INDEX_BYTE_OFFSET,
    );
    return indexUint8 === 255 /* computed */ ? undefined : indexUint8;
  }

  public get isExternal(): boolean {
    return !this.isComputed;
  }

  public get encryptionBits(): EncryptionBits {
    return encryptionBitsFromFheTypeId(this.fheTypeId);
  }

  public get solidityPrimitiveTypeName(): SolidityPrimitiveTypeName {
    return solidityPrimitiveTypeNameFromFheTypeId(this.fheTypeId);
  }

  public toString(): string {
    return this.#handleBytes32Hex;
  }

  public toJSON(): string {
    return this.#handleBytes32Hex;
  }
}

////////////////////////////////////////////////////////////////////////////////

export function assertIsFhevmHandleBytes32Hex(
  value: unknown,
  options?: { subject?: string } & ErrorMetadataParams,
): asserts value is FhevmHandleBytes32Hex {
  if (!isBytes32Hex(value)) {
    throw new FhevmHandleError({
      ...options,
      message: `FHEVM Handle is not a valid bytes32 hex.`,
    });
  }
  _assertIsFhevmHandleBytes32Hex(value, options);
}

export function assertIsFhevmHandleBytes32(
  value: unknown,
  options?: { subject?: string } & ErrorMetadataParams,
): asserts value is FhevmHandleBytes32 {
  if (!isBytes32(value)) {
    throw new FhevmHandleError({
      ...options,
      message: `FHEVM Handle is not a valid bytes32.`,
    });
  }

  _assertIsFhevmHandleBytes32(value, options);
}

export function assertIsFhevmHandle(
  value: unknown,
  options?: { subject?: string } & ErrorMetadataParams,
): asserts value is FhevmHandle {
  if (!isFhevmHandle(value)) {
    throw new FhevmHandleError({
      ...options,
      message: `Value is not a valid FhevmHandle.`,
    });
  }
}

export function assertIsExternalFhevmHandle(
  value: unknown,
  options?: { subject?: string } & ErrorMetadataParams,
): asserts value is ExternalFhevmHandle {
  if (!isExternalFhevmHandle(value)) {
    throw new FhevmHandleError({
      ...options,
      message: `Value is not a valid ExternalFhevmHandle.`,
    });
  }
}

export function assertIsFhevmHandleLike(
  value: unknown,
  options?: { subject?: string } & ErrorMetadataParams,
): asserts value is FhevmHandleLike {
  if (value instanceof FhevmHandleImpl) {
    return;
  }

  if (value !== null && typeof value === 'object' && 'bytes32Hex' in value) {
    assertIsFhevmHandleBytes32Hex(value.bytes32Hex, options);
    return;
  }

  if (typeof value === 'string') {
    assertIsFhevmHandleBytes32Hex(value, options);
    return;
  }

  assertIsFhevmHandleBytes32(value, options);
}

////////////////////////////////////////////////////////////////////////////////

export function isFhevmHandleBytes32(
  value: unknown,
): value is FhevmHandleBytes32 {
  try {
    assertIsFhevmHandleBytes32(value);
    return true;
  } catch {
    return false;
  }
}

export function isFhevmHandleBytes32Hex(
  value: unknown,
): value is FhevmHandleBytes32Hex {
  try {
    assertIsFhevmHandleBytes32Hex(value);
    return true;
  } catch {
    return false;
  }
}

export function isFhevmHandleLike(value: unknown): value is FhevmHandleLike {
  try {
    assertIsFhevmHandleLike(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a value is a `FhevmHandle` instance.
 *
 * **Same-realm only**: Uses `instanceof` which only works when the value
 * was created in the same JavaScript realm (same module instance).
 * Will return `false` for handles from:
 * - Different package versions (duplicate node_modules)
 * - Different bundler outputs
 * - Cross-realm contexts (iframes, workers)
 *
 * @param value - The value to check
 * @returns `true` if value is a `FhevmHandle` instance from the same realm
 */
export function isFhevmHandle(value: unknown): value is FhevmHandle {
  return value instanceof FhevmHandleImpl;
}

export function isExternalFhevmHandle(
  value: unknown,
): value is ExternalFhevmHandle {
  return (
    isFhevmHandle(value) &&
    value.isExternal &&
    value.index !== undefined &&
    !value.isComputed
  );
}

////////////////////////////////////////////////////////////////////////////////

export function asFhevmHandle(value: unknown): FhevmHandle {
  assertIsFhevmHandle(value);
  return value;
}

export function asFhevmHandleLike(value: unknown): FhevmHandleLike {
  assertIsFhevmHandleLike(value);
  return value;
}

export function asFhevmHandleBytes32(value: unknown): FhevmHandleBytes32 {
  assertIsFhevmHandleBytes32(value);
  return value;
}

export function asFhevmHandleBytes32Hex(value: unknown): FhevmHandleBytes32Hex {
  assertIsFhevmHandleBytes32Hex(value);
  return value;
}

/**
 * [Trusted] Converts a `FhevmHandleBytes32Hex` to a `FhevmHandle`.
 *
 * Trusts the type system for FhevmHandle hex format validation.
 *
 * @param handleBytes32Hex - A valid 32-byte hex string (typed as `FhevmHandleBytes32Hex`)
 * @returns A `FhevmHandle` instance
 */
export function fhevmHandleBytes32HexToFhevmHandle(
  handleBytes32Hex: FhevmHandleBytes32Hex,
): FhevmHandle {
  return new FhevmHandleImpl({
    handleBytes32Hex,
  });
}

/**
 * [Trusted] Converts a `Bytes32Hex` to a `FhevmHandle`.
 *
 * Trusts the type system for hex format validation.
 * Still validates FHEVM-specific fields (fheTypeId, version).
 *
 * @param handleBytes32Hex - A valid 32-byte hex string (typed as `Bytes32Hex`)
 * @returns A `FhevmHandle` instance
 * @throws A {@link FhevmHandleError} If fheTypeId or version is invalid
 */
export function bytes32HexToFhevmHandle(
  handleBytes32Hex: Bytes32Hex,
): FhevmHandle {
  _assertIsFhevmHandleBytes32Hex(handleBytes32Hex);

  return new FhevmHandleImpl({
    handleBytes32Hex,
  });
}

/**
 * [Trusted] Converts a `Bytes32` to a `FhevmHandle`.
 *
 * Trusts the type system for bytes format validation.
 * Still validates FHEVM-specific fields (fheTypeId, version).
 *
 * @param bytes - A valid 32-byte array (typed as `Bytes32`)
 * @returns A `FhevmHandle` instance
 * @throws A {@link FhevmHandleError} If fheTypeId or version is invalid
 */
export function bytes32ToFhevmHandle(bytes: Bytes32): FhevmHandle {
  // bytes is validated as a Bytes32
  const hex = bytes32ToHex(bytes);

  _assertIsFhevmHandleBytes32(bytes);

  return new FhevmHandleImpl({
    handleBytes32Hex: hex as FhevmHandleBytes32Hex,
    handleBytes32: new Uint8Array(bytes as Bytes32) as FhevmHandleBytes32,
  });
}

/**
 * [Trusted] Converts a `FhevmHandleLike` to a `FhevmHandle`.
 *
 * Trusts the type system for input validation.
 * Still validates FHEVM-specific fields (fheTypeId, version).
 *
 * @param fhevmHandleLike - A `FhevmHandleLike` (Bytes32, Bytes32Hex, Bytes32HexAble, or FhevmHandle)
 * @returns A `FhevmHandle` instance
 * @throws A {@link FhevmHandleError} If fheTypeId or version is invalid
 */
export function fhevmHandleLikeToFhevmHandle(
  fhevmHandleLike: FhevmHandleLike,
): FhevmHandle {
  // Already a FhevmHandle
  if (fhevmHandleLike instanceof FhevmHandleImpl) {
    return fhevmHandleLike;
  }

  // Bytes32Hex (string)
  if (typeof fhevmHandleLike === 'string') {
    return bytes32HexToFhevmHandle(fhevmHandleLike);
  }

  // Bytes32HexAble (object with bytes32Hex property)
  if ('bytes32Hex' in fhevmHandleLike) {
    return bytes32HexToFhevmHandle(fhevmHandleLike.bytes32Hex);
  }

  // Bytes32 (Uint8Array)
  return bytes32ToFhevmHandle(fhevmHandleLike);
}

////////////////////////////////////////////////////////////////////////////////
// Conversion
////////////////////////////////////////////////////////////////////////////////

/**
 * [Validated] Converts an unknown value to a `FhevmHandle`.
 *
 * Performs full runtime validation of input format and FHEVM-specific fields.
 *
 * @param value - An unknown value (string, Uint8Array, or object with bytes32Hex)
 * @returns A `FhevmHandle` instance
 * @throws A `InvalidTypeError` If value is not a valid bytes32 hex or bytes32
 * @throws A {@link FhevmHandleError} If fheTypeId or version is invalid
 */
export function toFhevmHandle(value: unknown): FhevmHandle {
  if (value instanceof FhevmHandleImpl) {
    return value;
  }

  // Object with bytes32Hex property (FhevmHandle-like)
  if (value !== null && typeof value === 'object' && 'bytes32Hex' in value) {
    assertIsBytes32Hex(value.bytes32Hex, {});
    return bytes32HexToFhevmHandle(value.bytes32Hex);
  }

  if (typeof value === 'string') {
    assertIsBytes32Hex(value, {});
    return bytes32HexToFhevmHandle(value);
  }

  assertIsBytes32(value, {});
  return bytes32ToFhevmHandle(value);
}

export function toExternalFhevmHandle(
  value: unknown,
): Prettify<ExternalFhevmHandle> {
  if (!isExternalFhevmHandle(value)) {
    throw new FhevmHandleError({
      message: 'Invalid external handle',
    });
  }
  return value;
}

/**
 * [Trusted] Compares two `FhevmHandle` instances for equality.
 *
 * @param a - First handle
 * @param b - Second handle
 * @returns `true` if both handles have the same `bytes32Hex` value
 */
export function fhevmHandleEquals(a: FhevmHandle, b: FhevmHandle): boolean {
  return a.bytes32Hex === b.bytes32Hex;
}

export function assertFhevmHandleArrayEquals(
  actual: readonly FhevmHandle[],
  expected: readonly FhevmHandleLike[],
  options?: {
    actualName?: string | undefined;
    expectedName?: string | undefined;
  },
): void {
  const actualTxt =
    options?.actualName !== undefined ? ` (${options.actualName})` : '';
  const expectedTxt =
    options?.expectedName !== undefined ? ` (${options.expectedName})` : '';

  if (actual.length !== expected.length) {
    throw new FhevmHandleError({
      message: `Unexpected handles list sizes: ${actual.length}${actualTxt} != ${expected.length}${expectedTxt}`,
    });
  }

  const expectedHandles = expected.map((h) => toFhevmHandle(h));

  for (let i = 0; i < actual.length; ++i) {
    if (actual[i].bytes32Hex !== expectedHandles[i].bytes32Hex) {
      throw new FhevmHandleError({
        message: `Unexpected handle[${i}]: ${actual[i].bytes32Hex}${actualTxt} != ${expectedHandles[i].bytes32Hex}${expectedTxt}`,
      });
    }
  }
}

export function buildFhevmHandle({
  index,
  chainId,
  hash21,
  fheTypeId,
  version,
}: {
  index?: number | undefined;
  chainId: number | bigint;
  hash21: string;
  fheTypeId: number;
  version?: number;
}): FhevmHandle {
  const theVersion = asUint8Number(
    version ?? FHEVM_HANDLE_CURRENT_CIPHERTEXT_VERSION,
  );
  const chainId32Bytes = uint64ToBytes32(chainId);
  const chainId8Bytes = chainId32Bytes.subarray(24, 32);

  const handleHash21 = asBytes21(hexToBytes(hash21));

  const handleBytes32AsBytes = new Uint8Array(32);
  handleBytes32AsBytes.set(handleHash21, 0);
  handleBytes32AsBytes[21] = asUint8Number(index ?? 255);
  handleBytes32AsBytes.set(chainId8Bytes, 22);
  handleBytes32AsBytes[30] = fheTypeId;
  handleBytes32AsBytes[31] = theVersion;

  return bytes32ToFhevmHandle(handleBytes32AsBytes as FhevmHandleBytes32);
}

export function assertIsFhevmHandleLikeArray(
  value: unknown,
  options?: { subject?: string } & ErrorMetadataParams,
): asserts value is FhevmHandleLike[] {
  if (!Array.isArray(value)) {
    throw new InvalidTypeError(
      {
        subject: options?.subject,
        type: typeof value,
        expectedCustomType: 'FhevmHandleLike[]',
        expectedType: 'Custom',
      },
      options ?? {},
    );
  }
  for (let i = 0; i < value.length; ++i) {
    if (!isFhevmHandleLike(value[i])) {
      throw new InvalidTypeError(
        {
          subject: options?.subject,
          index: i,
          type: typeof value[i],
          expectedCustomType: 'FhevmHandleLike',
          expectedType: 'Custom',
        },
        options ?? {},
      );
    }
  }
}

export function assertFhevmHandlesBelongToSameChainId(
  fhevmHandles: readonly FhevmHandle[],
  chainId?: Uint64BigInt,
): void {
  if (fhevmHandles.length === 0) {
    return;
  }
  const theChainId = chainId ?? fhevmHandles[0].chainId;
  for (let i = 0; i < fhevmHandles.length; ++i) {
    if (fhevmHandles[i].chainId !== theChainId) {
      throw new FhevmHandleError({
        message: `Handle at index ${i} (${fhevmHandles[i].bytes32Hex}) has chainId ${fhevmHandles[i].chainId}, expected ${chainId}`,
      });
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// Private Helpers
////////////////////////////////////////////////////////////////////////////////

function _assertIsValidFhevmHandleFields(
  fheTypeId: number,
  version: number,
  options?: { subject?: string } & ErrorMetadataParams,
): void {
  if (!isFheTypeId(fheTypeId)) {
    throw new FhevmHandleError({
      ...options,
      message: `FHEVM Handle is invalid. Unknown FheType: ${fheTypeId}`,
    });
  }
  if (version !== FHEVM_HANDLE_CURRENT_CIPHERTEXT_VERSION) {
    throw new FhevmHandleError({
      ...options,
      message: `FHEVM Handle is invalid. Unknown version: ${version}`,
    });
  }
}

function _assertIsFhevmHandleBytes32Hex(
  value: Bytes32Hex,
  options?: { subject?: string } & ErrorMetadataParams,
): asserts value is FhevmHandleBytes32Hex {
  _assertIsValidFhevmHandleFields(
    bytesHexUint8At(value, FHEVM_HANDLE_FHETYPEID_BYTE_OFFSET),
    bytesHexUint8At(value, FHEVM_HANDLE_VERSION_BYTE_OFFSET),
    options,
  );
}

function _assertIsFhevmHandleBytes32(
  value: Bytes32,
  options?: { subject?: string } & ErrorMetadataParams,
): asserts value is FhevmHandleBytes32 {
  _assertIsValidFhevmHandleFields(
    bytesUint8At(value, FHEVM_HANDLE_FHETYPEID_BYTE_OFFSET),
    bytesUint8At(value, FHEVM_HANDLE_VERSION_BYTE_OFFSET),
    options,
  );
}
