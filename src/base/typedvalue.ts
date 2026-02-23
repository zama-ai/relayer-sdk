import { asAddress } from './address';
import { toBoolean } from './boolean';
import type { ErrorMetadataParams } from './errors/ErrorBase';
import { InvalidTypeError } from './errors/InvalidTypeError';
import type { Address, UintNormalizedMap } from './types/primitives';
import type { Prettify } from './types/utils';
import { asUintForType, normalizeUintForType } from './uint';

// ============================================================================
// Public API
// ============================================================================

export type TypeName = Prettify<keyof ValueTypeMap>;

export type TypedValueLikeOf<T extends TypeName> = Readonly<{
  value: ValueLikeMap[T];
  type: T;
}>;

export type BoolValueLike = TypedValueLikeOf<'bool'>;
export type Uint8ValueLike = TypedValueLikeOf<'uint8'>;
export type Uint16ValueLike = TypedValueLikeOf<'uint16'>;
export type Uint32ValueLike = TypedValueLikeOf<'uint32'>;
export type Uint64ValueLike = TypedValueLikeOf<'uint64'>;
export type Uint128ValueLike = TypedValueLikeOf<'uint128'>;
export type Uint256ValueLike = TypedValueLikeOf<'uint256'>;
export type AddressValueLike = TypedValueLikeOf<'address'>;

export type TypedValueLike =
  | BoolValueLike
  | Uint8ValueLike
  | Uint16ValueLike
  | Uint32ValueLike
  | Uint64ValueLike
  | Uint128ValueLike
  | Uint256ValueLike
  | AddressValueLike;

/**
 * A validated, immutable typed value.
 *
 * Instances are created via {@link createTypedValue} and can be checked
 * with {@link isTypedValue}. Direct construction is not possible.
 *
 * @template T - The type name literal ('uint8', 'bool', 'address', etc.)
 * @template V - The validated value type (Uint8, boolean, ChecksummedAddress, etc.)
 */
export interface TypedValueOf<T extends TypeName> {
  readonly type: T;
  readonly value: ValueTypeMap[T];
}

export type TypedValue = TypedValueMap[TypeName];
export type BoolValue = TypedValueOf<'bool'>;
export type Uint8Value = TypedValueOf<'uint8'>;
export type Uint16Value = TypedValueOf<'uint16'>;
export type Uint32Value = TypedValueOf<'uint32'>;
export type Uint64Value = TypedValueOf<'uint64'>;
export type Uint128Value = TypedValueOf<'uint128'>;
export type Uint256Value = TypedValueOf<'uint256'>;
export type AddressValue = TypedValueOf<'address'>;

export type ValueType = ValueTypeMap[TypeName];

// ============================================================================
// Private API
// ============================================================================

/**
 * Maps each {@link TypeName} to its validated {@link TypedValueOf} counterpart.
 * @internal
 */
interface TypedValueMap {
  bool: BoolValue;
  uint8: Uint8Value;
  uint16: Uint16Value;
  uint32: Uint32Value;
  uint64: Uint64Value;
  uint128: Uint128Value;
  uint256: Uint256Value;
  address: AddressValue;
}

interface ValueTypeMap extends UintNormalizedMap {
  bool: boolean;
  address: Address;
}

interface ValueLikeMap {
  bool: boolean | number | bigint;
  uint8: number | bigint;
  uint16: number | bigint;
  uint32: number | bigint;
  uint64: number | bigint;
  uint128: number | bigint;
  uint256: number | bigint;
  address: string;
}

/**
 * Resolves an input typed-value to its validated counterpart via
 * {@link TypedValueMap} lookup.
 * @internal
 */
type TypedValueFrom<T extends TypedValueLike> = TypedValueMap[T['type']];

////////////////////////////////////////////////////////////////////////////////

/**
 * Internal implementation. Not exported — external code cannot instantiate.
 *
 * Security relies on:
 * - Class not being exported (no `new` from outside)
 * - `Object.freeze` on every instance (immutability)
 * - Private fields (`#type`, `#value`) inaccessible from outside
 * - `Object.freeze` on prototype (no prototype pollution)
 */
class TypedValueImpl<T extends TypeName> implements TypedValueOf<T> {
  readonly #type: T;
  readonly #value: ValueTypeMap[T];

  constructor(value: ValueTypeMap[T], type: T) {
    this.#value = value;
    this.#type = type;
  }

  public get type(): T {
    return this.#type;
  }

  public get value(): ValueTypeMap[T] {
    return this.#value;
  }

  /**
   * Safe string representation that does not expose the value.
   */
  public toString(): string {
    return `TypedValue<${this.#type}>`;
  }

  /**
   * Safe JSON serialization that does not expose the value.
   */
  public toJSON(): { type: T } {
    return { type: this.#type };
  }
}

Object.freeze(TypedValueImpl.prototype);

////////////////////////////////////////////////////////////////////////////////

/**
 * Returns `true` if `value` was created via {@link createTypedValue}.
 *
 * Uses `instanceof` against the non-exported `TypedValueImpl` class,
 * which is unforgeable in same-realm contexts.
 */
export function isTypedValue<T extends TypeName>(
  value: unknown,
  options: { type: T },
): value is TypedValue & { readonly type: T };
export function isTypedValue(value: unknown): value is TypedValue;
export function isTypedValue(
  value: unknown,
  options?: { type: TypeName },
): value is TypedValue {
  if (!(value instanceof TypedValueImpl)) {
    return false;
  }
  if (options?.type !== undefined) {
    return value.type === options.type;
  }
  return true;
}

/**
 * Asserts that `value` was created via {@link createTypedValue}.
 *
 * @throws {InvalidTypeError} If the value is not a `TypedValue` instance.
 */
export function assertIsTypedValue<T extends TypeName>(
  value: unknown,
  options: { type: T; subject?: string } & ErrorMetadataParams,
): asserts value is TypedValue & { readonly type: T };
export function assertIsTypedValue(
  value: unknown,
  options: { subject?: string } & ErrorMetadataParams,
): asserts value is TypedValue;
export function assertIsTypedValue(
  value: unknown,
  options: { type?: TypeName; subject?: string } & ErrorMetadataParams,
): asserts value is TypedValue {
  const expectedType =
    options.type !== undefined ? `TypedValue<${options.type}>` : 'TypedValue';

  const isValid =
    options.type !== undefined
      ? isTypedValue(value, { type: options.type })
      : isTypedValue(value);

  if (!isValid) {
    throw new InvalidTypeError(
      {
        subject: options.subject,
        type: typeof value,
        expectedType: 'Custom',
        expectedCustomType: expectedType,
      },
      options,
    );
  }
}

/**
 * Asserts that `values` is an array where every element was created
 * via {@link createTypedValue}.
 *
 * @throws {InvalidTypeError} If the value is not an array, or if any
 * element is not a `TypedValue` instance (error includes the index).
 */
export function assertIsTypedValueArray(
  values: unknown,
  options: { subject?: string } & ErrorMetadataParams,
): asserts values is ReadonlyArray<TypedValueOf<TypeName>> {
  if (!Array.isArray(values)) {
    throw new InvalidTypeError(
      {
        subject: options.subject,
        type: typeof values,
        expectedType: 'Custom',
        expectedCustomType: 'TypedValue[]',
      },
      options,
    );
  }
  for (let i = 0; i < values.length; ++i) {
    if (!isTypedValue(values[i])) {
      throw new InvalidTypeError(
        {
          subject: options.subject,
          index: i,
          type: typeof values[i],
          expectedType: 'Custom',
          expectedCustomType: 'TypedValue',
        },
        options,
      );
    }
  }
}

/**
 * Creates a validated and immutable {@link TypedValueOf}.
 *
 * Validation steps:
 * 1. **Boolean values:** Validated via `asBoolean()`
 * 2. **Addresses:** Validated and checksummed via `asChecksummedAddress()` (EIP-55)
 * 3. **Uint values:** Validated via `asUintForType()` (range check)
 *
 * @param input - The loose typed value to validate
 * @returns A validated and frozen `TypedValue` with proper type narrowing
 * @throws {InvalidTypeError} If validation fails
 *
 * @example
 * ```typescript
 * const uint8 = createTypedValue({ type: 'uint8', value: 42 });
 * // Type: TypedValue<'uint8', Uint8>
 *
 * const addr = createTypedValue({
 *   type: 'address',
 *   value: '0x742d35cc6634c0532925a3b844bc9e7595f0beb'
 * });
 * // Type: TypedValue<'address', ChecksummedAddress>
 * ```
 */
export function createTypedValue<InputType extends TypedValueLike>(
  input: InputType,
): TypedValue & { readonly type: InputType['type'] } {
  if ((input as unknown) == null || typeof input !== 'object') {
    throw new InvalidTypeError(
      {
        subject: 'input',
        type: typeof input,
        expectedType: 'Custom',
        expectedCustomType: 'InputTypedValue ({ type, value })',
      },
      {},
    );
  }

  if (isTypedValue(input)) {
    return input;
  }

  const expectedType = input.type;

  let validatedValue: ValueType;

  if (expectedType === 'bool') {
    validatedValue = toBoolean(input.value, {});
  } else if (expectedType === 'address') {
    validatedValue = asAddress(input.value);
  } else {
    validatedValue = normalizeUintForType(
      asUintForType(input.value, expectedType, {}),
      expectedType,
    );
  }

  const v: TypedValueOf<typeof expectedType> = new TypedValueImpl(
    validatedValue,
    expectedType,
  );
  Object.freeze(v);
  return v as TypedValueFrom<InputType>;
}

/**
 * Mapped tuple type that preserves per-element type narrowing.
 * @internal
 */
type TypedValueArrayFrom<T extends readonly TypedValueLike[]> = {
  [K in keyof T]: TypedValueFrom<T[K]>;
};

/**
 * Creates an array of validated {@link TypedValueOf}s from a tuple of inputs.
 *
 * Preserves per-element type narrowing:
 * ```typescript
 * const [b, n] = createTypedValueArray([
 *   { type: 'bool', value: true },
 *   { type: 'uint8', value: 42 },
 * ]);
 * // b: BoolValue, n: Uint8Value
 * ```
 */
export function createTypedValueArray<T extends readonly TypedValueLike[]>(
  inputs: [...T],
): TypedValueArrayFrom<T> {
  return inputs.map(createTypedValue) as unknown as TypedValueArrayFrom<T>;
}

/**
 * Returns `true` if every element was created via {@link createTypedValue}.
 */
export function isTypedValueArray(
  arr: readonly unknown[],
): arr is ReadonlyArray<TypedValueOf<TypeName>> {
  return arr.every((v) => isTypedValue(v));
}

export class TypedValueArrayBuilder {
  readonly #arr: TypedValue[] = [];

  public addBool(value: boolean | number | bigint | BoolValueLike): this {
    return this.#push('bool', value);
  }

  public addUint8(value: number | bigint | Uint8ValueLike): this {
    return this.#push('uint8', value);
  }

  public addUint16(value: number | bigint | Uint16ValueLike): this {
    return this.#push('uint16', value);
  }

  public addUint32(value: number | bigint | Uint32ValueLike): this {
    return this.#push('uint32', value);
  }

  public addUint64(value: number | bigint | Uint64ValueLike): this {
    return this.#push('uint64', value);
  }

  public addUint128(value: number | bigint | Uint128ValueLike): this {
    return this.#push('uint128', value);
  }

  public addUint256(value: number | bigint | Uint256ValueLike): this {
    return this.#push('uint256', value);
  }

  public addAddress(value: string | AddressValueLike): this {
    return this.#push('address', value);
  }

  public addTypedValue(typedValue: TypedValue): this {
    if (!isTypedValue(typedValue)) {
      throw new InvalidTypeError(
        {
          subject: 'typedValue',
          type: typeof typedValue,
          expectedType: 'Custom',
          expectedCustomType: 'TypedValue',
        },
        {},
      );
    }
    this.#arr.push(typedValue);
    return this;
  }

  #push(typeName: TypeName, value: unknown): this {
    if (isTypedValue(value, { type: typeName })) {
      this.#arr.push(value);
    } else if (typeof value === 'object' && value !== null) {
      const tv = value as TypedValueLikeOf<TypeName>;
      if (tv.type !== typeName) {
        throw new InvalidTypeError(
          {
            subject: 'value',
            type: tv.type,
            expectedType: 'Custom',
            expectedCustomType: typeName,
          },
          {},
        );
      }
      this.#arr.push(
        createTypedValue({ type: typeName, value: tv.value } as TypedValueLike),
      );
    } else {
      this.#arr.push(
        createTypedValue({ type: typeName, value } as TypedValueLike),
      );
    }
    return this;
  }

  public build(): readonly TypedValue[] {
    return Object.freeze([...this.#arr]);
  }
}
