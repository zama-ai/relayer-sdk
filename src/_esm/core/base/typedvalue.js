var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _TypedValueImpl_type, _TypedValueImpl_value, _TypedValueArrayBuilder_instances, _TypedValueArrayBuilder_arr, _TypedValueArrayBuilder_push;
import { asAddress } from "./address.js";
import { toBoolean } from "./boolean.js";
import { InvalidTypeError } from "./errors/InvalidTypeError.js";
import { asUintForType, normalizeUintForType } from "./uint.js";
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
class TypedValueImpl {
    constructor(value, type) {
        _TypedValueImpl_type.set(this, void 0);
        _TypedValueImpl_value.set(this, void 0);
        __classPrivateFieldSet(this, _TypedValueImpl_value, value, "f");
        __classPrivateFieldSet(this, _TypedValueImpl_type, type, "f");
    }
    get type() {
        return __classPrivateFieldGet(this, _TypedValueImpl_type, "f");
    }
    get value() {
        return __classPrivateFieldGet(this, _TypedValueImpl_value, "f");
    }
    /**
     * Safe string representation that does not expose the value.
     */
    toString() {
        return `TypedValue<${__classPrivateFieldGet(this, _TypedValueImpl_type, "f")}>`;
    }
    /**
     * Safe JSON serialization that does not expose the value.
     */
    toJson() {
        return { type: __classPrivateFieldGet(this, _TypedValueImpl_type, "f") };
    }
}
_TypedValueImpl_type = new WeakMap(), _TypedValueImpl_value = new WeakMap();
Object.freeze(TypedValueImpl.prototype);
export function isTypedValue(value, options) {
    if (!(value instanceof TypedValueImpl)) {
        return false;
    }
    if (options?.type !== undefined) {
        return value.type === options.type;
    }
    return true;
}
export function assertIsTypedValue(value, options) {
    const expectedType = options.type !== undefined ? `TypedValue<${options.type}>` : "TypedValue";
    const isValid = options.type !== undefined
        ? isTypedValue(value, { type: options.type })
        : isTypedValue(value);
    if (!isValid) {
        throw new InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType,
        }, options);
    }
}
/**
 * Asserts that `values` is an array where every element was created
 * via {@link createTypedValue}.
 *
 * @throws {InvalidTypeError} If the value is not an array, or if any
 * element is not a `TypedValue` instance (error includes the index).
 */
export function assertIsTypedValueArray(values, options) {
    if (!Array.isArray(values)) {
        throw new InvalidTypeError({
            subject: options.subject,
            type: typeof values,
            expectedType: "TypedValue[]",
        }, options);
    }
    for (let i = 0; i < values.length; ++i) {
        if (!isTypedValue(values[i])) {
            throw new InvalidTypeError({
                subject: options.subject,
                index: i,
                type: typeof values[i],
                expectedType: "TypedValue",
            }, options);
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
export function createTypedValue(input) {
    if (input == null || typeof input !== "object") {
        throw new InvalidTypeError({
            subject: "input",
            type: typeof input,
            expectedType: "InputTypedValue ({ type, value })",
        }, {});
    }
    if (isTypedValue(input)) {
        return input;
    }
    const expectedType = input.type;
    let validatedValue;
    if (expectedType === "bool") {
        validatedValue = toBoolean(input.value, {});
    }
    else if (expectedType === "address") {
        validatedValue = asAddress(input.value);
    }
    else {
        validatedValue = normalizeUintForType(asUintForType(input.value, expectedType, {}), expectedType);
    }
    const v = new TypedValueImpl(validatedValue, expectedType);
    Object.freeze(v);
    return v;
}
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
export function createTypedValueArray(inputs) {
    return inputs.map(createTypedValue);
}
/**
 * Returns `true` if every element was created via {@link createTypedValue}.
 */
export function isTypedValueArray(arr) {
    return arr.every((v) => isTypedValue(v));
}
export class TypedValueArrayBuilder {
    constructor() {
        _TypedValueArrayBuilder_instances.add(this);
        _TypedValueArrayBuilder_arr.set(this, []);
    }
    addBool(value) {
        return __classPrivateFieldGet(this, _TypedValueArrayBuilder_instances, "m", _TypedValueArrayBuilder_push).call(this, "bool", value);
    }
    addUint8(value) {
        return __classPrivateFieldGet(this, _TypedValueArrayBuilder_instances, "m", _TypedValueArrayBuilder_push).call(this, "uint8", value);
    }
    addUint16(value) {
        return __classPrivateFieldGet(this, _TypedValueArrayBuilder_instances, "m", _TypedValueArrayBuilder_push).call(this, "uint16", value);
    }
    addUint32(value) {
        return __classPrivateFieldGet(this, _TypedValueArrayBuilder_instances, "m", _TypedValueArrayBuilder_push).call(this, "uint32", value);
    }
    addUint64(value) {
        return __classPrivateFieldGet(this, _TypedValueArrayBuilder_instances, "m", _TypedValueArrayBuilder_push).call(this, "uint64", value);
    }
    addUint128(value) {
        return __classPrivateFieldGet(this, _TypedValueArrayBuilder_instances, "m", _TypedValueArrayBuilder_push).call(this, "uint128", value);
    }
    addUint256(value) {
        return __classPrivateFieldGet(this, _TypedValueArrayBuilder_instances, "m", _TypedValueArrayBuilder_push).call(this, "uint256", value);
    }
    addAddress(value) {
        return __classPrivateFieldGet(this, _TypedValueArrayBuilder_instances, "m", _TypedValueArrayBuilder_push).call(this, "address", value);
    }
    addTypedValue(typedValue) {
        if (!isTypedValue(typedValue)) {
            throw new InvalidTypeError({
                subject: "typedValue",
                type: typeof typedValue,
                expectedType: "TypedValue",
            }, {});
        }
        __classPrivateFieldGet(this, _TypedValueArrayBuilder_arr, "f").push(typedValue);
        return this;
    }
    build() {
        return Object.freeze([...__classPrivateFieldGet(this, _TypedValueArrayBuilder_arr, "f")]);
    }
}
_TypedValueArrayBuilder_arr = new WeakMap(), _TypedValueArrayBuilder_instances = new WeakSet(), _TypedValueArrayBuilder_push = function _TypedValueArrayBuilder_push(typeName, value) {
    if (isTypedValue(value, { type: typeName })) {
        __classPrivateFieldGet(this, _TypedValueArrayBuilder_arr, "f").push(value);
    }
    else if (typeof value === "object" && value !== null) {
        const tv = value;
        if (tv.type !== typeName) {
            throw new InvalidTypeError({
                subject: "value",
                type: tv.type,
                expectedType: typeName,
            }, {});
        }
        __classPrivateFieldGet(this, _TypedValueArrayBuilder_arr, "f").push(createTypedValue({ type: typeName, value: tv.value }));
    }
    else {
        __classPrivateFieldGet(this, _TypedValueArrayBuilder_arr, "f").push(createTypedValue({ type: typeName, value }));
    }
    return this;
};
//# sourceMappingURL=typedvalue.js.map