import { asAddress } from './address';
import { asBoolean } from './boolean';
import type { ErrorMetadataParams } from './errors/ErrorBase';
import { InvalidTypeError } from './errors/InvalidTypeError';
import type {
  Address,
  Uint128,
  Uint16,
  Uint256,
  Uint32,
  Uint64,
  Uint8,
  UintXXType,
  UintXXTypeName,
} from './types/primitives';
import { asUintForType } from './uint';

// ============================================================================
// Public API
// ============================================================================

export type TypeName = UintXXTypeName | 'bool' | 'address';

export type TypedValueLike<T extends TypeName, V> = Readonly<{
  value: V;
  type: T;
}>;

export type BoolValueLike = TypedValueLike<'bool', boolean>;
export type Uint8ValueLike = TypedValueLike<'uint8', number | bigint>;
export type Uint16ValueLike = TypedValueLike<'uint16', number | bigint>;
export type Uint32ValueLike = TypedValueLike<'uint32', number | bigint>;
export type Uint64ValueLike = TypedValueLike<'uint64', number | bigint>;
export type Uint128ValueLike = TypedValueLike<'uint128', number | bigint>;
export type Uint256ValueLike = TypedValueLike<'uint256', number | bigint>;
export type AddressValueLike = TypedValueLike<'address', string>;

export type InputTypedValue =
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
export interface TypedValueOf<T extends TypeName, V> {
  readonly type: T;
  readonly value: V;
}

export type TypedValue = TypedValueMap[TypeName];
export type BoolValue = TypedValueOf<'bool', boolean>;
export type Uint8Value = TypedValueOf<'uint8', Uint8>;
export type Uint16Value = TypedValueOf<'uint16', Uint16>;
export type Uint32Value = TypedValueOf<'uint32', Uint32>;
export type Uint64Value = TypedValueOf<'uint64', Uint64>;
export type Uint128Value = TypedValueOf<'uint128', Uint128>;
export type Uint256Value = TypedValueOf<'uint256', Uint256>;
export type AddressValue = TypedValueOf<'address', Address>;

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

/**
 * Resolves an input typed-value to its validated counterpart via
 * {@link TypedValueMap} lookup.
 * @internal
 */
type TypedValueFrom<T extends InputTypedValue> = TypedValueMap[T['type']];

/**
 * Union of all valid value types for TypedValue.
 * @internal
 */
type ValueType = UintXXType | boolean | Address;

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
class TypedValueImpl<T extends TypeName, V extends ValueType>
  implements TypedValueOf<T, V>
{
  readonly #type: T;
  readonly #value: V;

  constructor(value: V, type: T) {
    this.#value = value;
    this.#type = type;
  }

  public get type(): T {
    return this.#type;
  }

  public get value(): V {
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
export function isTypedValue(value: unknown): value is TypedValue {
  return value instanceof TypedValueImpl;
}

/**
 * Asserts that `value` was created via {@link createTypedValue}.
 *
 * @throws {InvalidTypeError} If the value is not a `TypedValue` instance.
 */
export function assertIsTypedValue(
  value: unknown,
  options: { subject?: string } & ErrorMetadataParams,
): asserts value is TypedValueOf<TypeName, ValueType> {
  if (!isTypedValue(value)) {
    throw new InvalidTypeError(
      {
        subject: options.subject,
        type: typeof value,
        expectedType: 'Custom',
        expectedCustomType: 'TypedValue',
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
): asserts values is ReadonlyArray<TypedValueOf<TypeName, ValueType>> {
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
export function createTypedValue<InputType extends InputTypedValue>(
  input: InputType,
): TypedValueFrom<InputType> {
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

  const expectedType = input.type;

  let validatedValue: ValueType;

  if (expectedType === 'bool') {
    validatedValue = asBoolean(input.value);
  } else if (expectedType === 'address') {
    validatedValue = asAddress(input.value);
  } else {
    validatedValue = asUintForType(input.value, {
      typeName: expectedType,
    });
  }

  const v: TypedValueOf<typeof expectedType, ValueType> = new TypedValueImpl(
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
type TypedValuesFrom<T extends readonly InputTypedValue[]> = {
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
export function createTypedValueArray<T extends readonly InputTypedValue[]>(
  inputs: [...T],
): TypedValuesFrom<T> {
  return inputs.map(createTypedValue) as unknown as TypedValuesFrom<T>;
}

/**
 * Returns `true` if every element was created via {@link createTypedValue}.
 */
export function isTypedValueArray(
  values: readonly unknown[],
): values is ReadonlyArray<TypedValueOf<TypeName, ValueType>> {
  return values.every(isTypedValue);
}
