import type {
  FheType,
  ClearValueType,
  FheTypeToValueTypeNameMap,
} from "./fheType.js";
import type { Bytes32, Bytes32Hex, Bytes32HexAble } from "./primitives.js";
import type {
  ComputedEncryptedValueOfTypeBase,
  ExternalEncryptedValueOfTypeBase,
} from "./encryptedTypes-p.js";

////////////////////////////////////////////////////////////////////////////////
// Public types
////////////////////////////////////////////////////////////////////////////////

/**
 * An encrypted FHE value (`handle` in `FHE.sol` / FHEVM whitepaper).
 * Either a {@link ComputedEncryptedValue} (verified, on-chain) or an
 * {@link ExternalEncryptedValue} (unverified input). Narrowable via `isExternal`.
 */
export type EncryptedValue<T extends FheType = FheType> =
  | ComputedEncryptedValue<T>
  | ExternalEncryptedValue<T>;

/** A computed encrypted value — verified on-chain, result of an FHE operation. */
export type ComputedEncryptedValue<T extends FheType = FheType> = {
  [K in T]: ComputedEncryptedValueOfTypeBase<K>;
}[T];

/** An unverified encrypted value (`inputHandle` in `FHE.sol`). */
export type ExternalEncryptedValue<T extends FheType = FheType> = {
  [K in T]: ExternalEncryptedValueOfTypeBase<K>;
}[T];

/**
 * Alias for {@link EncryptedValue} using `FHE.sol` terminology.
 * In `FHE.sol`, a `handle` is the `bytes32` reference to any encrypted value.
 */
export type Handle<T extends FheType = FheType> = EncryptedValue<T>;

/**
 * Alias for {@link ExternalEncryptedValue} using `FHE.sol` terminology.
 * In `FHE.sol`, an `inputHandle` is an encrypted value that has not yet been
 * verified on-chain via `InputVerifier.sol`.
 */
export type InputHandle<T extends FheType = FheType> =
  ExternalEncryptedValue<T>;

/** Alias for {@link ComputedEncryptedValue} using `FHE.sol` terminology. */
export type ComputedHandle<T extends FheType = FheType> =
  ComputedEncryptedValue<T>;

////////////////////////////////////////////////////////////////////////////////
// Typed shortcuts
////////////////////////////////////////////////////////////////////////////////

/** Encrypted boolean (`ebool` in Solidity). */
export type Ebool = EncryptedValue<"ebool">;
/** Encrypted unsigned 8-bit integer (`euint8` in Solidity). */
export type Euint8 = EncryptedValue<"euint8">;
/** Encrypted unsigned 16-bit integer (`euint16` in Solidity). */
export type Euint16 = EncryptedValue<"euint16">;
/** Encrypted unsigned 32-bit integer (`euint32` in Solidity). */
export type Euint32 = EncryptedValue<"euint32">;
/** Encrypted unsigned 64-bit integer (`euint64` in Solidity). */
export type Euint64 = EncryptedValue<"euint64">;
/** Encrypted unsigned 128-bit integer (`euint128` in Solidity). */
export type Euint128 = EncryptedValue<"euint128">;
/** Encrypted unsigned 256-bit integer (`euint256` in Solidity). */
export type Euint256 = EncryptedValue<"euint256">;
/** Encrypted address (`eaddress` in Solidity). */
export type Eaddress = EncryptedValue<"eaddress">;

/** Unverified encrypted boolean (`externalEbool` in Solidity). Requires on-chain verification before use. */
export type ExternalEbool = ExternalEncryptedValue<"ebool">;
/** Unverified encrypted unsigned 8-bit integer (`externalEuint8` in Solidity). */
export type ExternalEuint8 = ExternalEncryptedValue<"euint8">;
/** Unverified encrypted unsigned 16-bit integer (`externalEuint16` in Solidity). */
export type ExternalEuint16 = ExternalEncryptedValue<"euint16">;
/** Unverified encrypted unsigned 32-bit integer (`externalEuint32` in Solidity). */
export type ExternalEuint32 = ExternalEncryptedValue<"euint32">;
/** Unverified encrypted unsigned 64-bit integer (`externalEuint64` in Solidity). */
export type ExternalEuint64 = ExternalEncryptedValue<"euint64">;
/** Unverified encrypted unsigned 128-bit integer (`externalEuint128` in Solidity). */
export type ExternalEuint128 = ExternalEncryptedValue<"euint128">;
/** Unverified encrypted unsigned 256-bit integer (`externalEuint256` in Solidity). */
export type ExternalEuint256 = ExternalEncryptedValue<"euint256">;
/** Unverified encrypted address (`externalEaddress` in Solidity). */
export type ExternalEaddress = ExternalEncryptedValue<"eaddress">;

////////////////////////////////////////////////////////////////////////////////

/** Accepts raw bytes or a parsed encrypted value. */
export type EncryptedValueLike =
  | Uint8Array
  | string
  | { readonly bytes32Hex: string }
  | EncryptedValue;

export type HandleLike = EncryptedValueLike;

export type ExternalEncryptedValueLike =
  | Bytes32
  | Bytes32Hex
  | Bytes32HexAble
  | ExternalEncryptedValue;

export type InputHandleLike = ExternalEncryptedValueLike;

////////////////////////////////////////////////////////////////////////////////

export type ClearValueOfType<T extends FheType> = {
  readonly value: ClearValueType<T>;
  readonly encryptedValue: EncryptedValue<T>;
  readonly fheType: T;
  readonly valueType: ClearValueTypeName<T>;
};

export type ClearValue<T extends FheType = FheType> = {
  [K in T]: ClearValueOfType<K>;
}[T];

export type ClearValueTypeName<T extends FheType = FheType> =
  FheTypeToValueTypeNameMap[T];

export type ClearBool = ClearValue<"ebool">;
export type ClearUint8 = ClearValue<"euint8">;
export type ClearUint16 = ClearValue<"euint16">;
export type ClearUint32 = ClearValue<"euint32">;
export type ClearUint64 = ClearValue<"euint64">;
export type ClearUint128 = ClearValue<"euint128">;
export type ClearUint256 = ClearValue<"euint256">;
export type ClearAddress = ClearValue<"eaddress">;
