"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypedValueArrayBuilder = void 0;
exports.isTypedValue = isTypedValue;
exports.assertIsTypedValue = assertIsTypedValue;
exports.assertIsTypedValueArray = assertIsTypedValueArray;
exports.createTypedValue = createTypedValue;
exports.createTypedValueArray = createTypedValueArray;
exports.isTypedValueArray = isTypedValueArray;
const address_js_1 = require("./address.js");
const boolean_js_1 = require("./boolean.js");
const InvalidTypeError_js_1 = require("./errors/InvalidTypeError.js");
const uint_js_1 = require("./uint.js");
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
    toString() {
        return `TypedValue<${__classPrivateFieldGet(this, _TypedValueImpl_type, "f")}>`;
    }
    toJson() {
        return { type: __classPrivateFieldGet(this, _TypedValueImpl_type, "f") };
    }
}
_TypedValueImpl_type = new WeakMap(), _TypedValueImpl_value = new WeakMap();
Object.freeze(TypedValueImpl.prototype);
function isTypedValue(value, options) {
    if (!(value instanceof TypedValueImpl)) {
        return false;
    }
    if (options?.type !== undefined) {
        return value.type === options.type;
    }
    return true;
}
function assertIsTypedValue(value, options) {
    const expectedType = options.type !== undefined ? `TypedValue<${options.type}>` : "TypedValue";
    const isValid = options.type !== undefined
        ? isTypedValue(value, { type: options.type })
        : isTypedValue(value);
    if (!isValid) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType,
        }, options);
    }
}
function assertIsTypedValueArray(values, options) {
    if (!Array.isArray(values)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof values,
            expectedType: "TypedValue[]",
        }, options);
    }
    for (let i = 0; i < values.length; ++i) {
        if (!isTypedValue(values[i])) {
            throw new InvalidTypeError_js_1.InvalidTypeError({
                subject: options.subject,
                index: i,
                type: typeof values[i],
                expectedType: "TypedValue",
            }, options);
        }
    }
}
function createTypedValue(input) {
    if (input == null || typeof input !== "object") {
        throw new InvalidTypeError_js_1.InvalidTypeError({
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
        validatedValue = (0, boolean_js_1.toBoolean)(input.value, {});
    }
    else if (expectedType === "address") {
        validatedValue = (0, address_js_1.asAddress)(input.value);
    }
    else {
        validatedValue = (0, uint_js_1.normalizeUintForType)((0, uint_js_1.asUintForType)(input.value, expectedType, {}), expectedType);
    }
    const v = new TypedValueImpl(validatedValue, expectedType);
    Object.freeze(v);
    return v;
}
function createTypedValueArray(inputs) {
    return inputs.map(createTypedValue);
}
function isTypedValueArray(arr) {
    return arr.every((v) => isTypedValue(v));
}
class TypedValueArrayBuilder {
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
            throw new InvalidTypeError_js_1.InvalidTypeError({
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
exports.TypedValueArrayBuilder = TypedValueArrayBuilder;
_TypedValueArrayBuilder_arr = new WeakMap(), _TypedValueArrayBuilder_instances = new WeakSet(), _TypedValueArrayBuilder_push = function _TypedValueArrayBuilder_push(typeName, value) {
    if (isTypedValue(value, { type: typeName })) {
        __classPrivateFieldGet(this, _TypedValueArrayBuilder_arr, "f").push(value);
    }
    else if (typeof value === "object" && value !== null) {
        const tv = value;
        if (tv.type !== typeName) {
            throw new InvalidTypeError_js_1.InvalidTypeError({
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