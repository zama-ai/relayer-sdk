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
var _InputProofImpl_inputProofBytesHex, _InputProofImpl_externalHandles, _InputProofImpl_coprocessorSignatures, _InputProofImpl_extraData, _InputProofImpl_coprocessorSignedParams;
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUnverifiedInputProofFromComponents = createUnverifiedInputProofFromComponents;
exports.createInputProofFromComponents = createInputProofFromComponents;
exports.createUnverifiedInputProofFromRawBytes = createUnverifiedInputProofFromRawBytes;
exports.createInputProofFromRawBytes = createInputProofFromRawBytes;
exports.inputProofBytesEquals = inputProofBytesEquals;
exports.isInputProof = isInputProof;
exports.assertIsInputProof = assertIsInputProof;
exports.isVerifiedInputProof = isVerifiedInputProof;
exports.assertIsVerifiedInputProof = assertIsVerifiedInputProof;
exports.toInputProofBytes = toInputProofBytes;
const uint_js_1 = require("../base/uint.js");
const bytes_js_1 = require("../base/bytes.js");
const InternalError_js_1 = require("../base/errors/InternalError.js");
const string_js_1 = require("../base/string.js");
const InputProofError_js_1 = require("../errors/InputProofError.js");
const FhevmHandle_js_1 = require("../handle/FhevmHandle.js");
const address_js_1 = require("../base/address.js");
const InvalidTypeError_js_1 = require("../base/errors/InvalidTypeError.js");
const PRIVATE_TOKEN = Symbol("InputProof.token");
class InputProofImpl {
    constructor(privateToken, parameters) {
        _InputProofImpl_inputProofBytesHex.set(this, void 0);
        _InputProofImpl_externalHandles.set(this, void 0);
        _InputProofImpl_coprocessorSignatures.set(this, void 0);
        _InputProofImpl_extraData.set(this, void 0);
        _InputProofImpl_coprocessorSignedParams.set(this, void 0);
        if (privateToken !== PRIVATE_TOKEN) {
            throw new Error("Unauthorized");
        }
        const { inputProofBytesHex, coprocessorSignatures, externalHandles, extraData, coprocessorSignedParams, } = parameters;
        (0, InternalError_js_1.assert)(externalHandles.length > 0);
        (0, InternalError_js_1.assert)(coprocessorSignatures.length > 0);
        __classPrivateFieldSet(this, _InputProofImpl_inputProofBytesHex, inputProofBytesHex, "f");
        __classPrivateFieldSet(this, _InputProofImpl_coprocessorSignatures, coprocessorSignatures, "f");
        __classPrivateFieldSet(this, _InputProofImpl_externalHandles, externalHandles, "f");
        __classPrivateFieldSet(this, _InputProofImpl_extraData, extraData, "f");
        if (coprocessorSignedParams !== undefined) {
            __classPrivateFieldSet(this, _InputProofImpl_coprocessorSignedParams, { ...coprocessorSignedParams }, "f");
        }
        Object.freeze(__classPrivateFieldGet(this, _InputProofImpl_coprocessorSignatures, "f"));
        Object.freeze(__classPrivateFieldGet(this, _InputProofImpl_externalHandles, "f"));
        Object.freeze(__classPrivateFieldGet(this, _InputProofImpl_coprocessorSignedParams, "f"));
    }
    get bytesHex() {
        return __classPrivateFieldGet(this, _InputProofImpl_inputProofBytesHex, "f");
    }
    get coprocessorSignatures() {
        return __classPrivateFieldGet(this, _InputProofImpl_coprocessorSignatures, "f");
    }
    get externalHandles() {
        return __classPrivateFieldGet(this, _InputProofImpl_externalHandles, "f");
    }
    get extraData() {
        return __classPrivateFieldGet(this, _InputProofImpl_extraData, "f");
    }
    get verified() {
        return __classPrivateFieldGet(this, _InputProofImpl_coprocessorSignedParams, "f") !== undefined;
    }
    get coprocessorSignedParams() {
        return __classPrivateFieldGet(this, _InputProofImpl_coprocessorSignedParams, "f");
    }
}
_InputProofImpl_inputProofBytesHex = new WeakMap(), _InputProofImpl_externalHandles = new WeakMap(), _InputProofImpl_coprocessorSignatures = new WeakMap(), _InputProofImpl_extraData = new WeakMap(), _InputProofImpl_coprocessorSignedParams = new WeakMap();
function createUnverifiedInputProofFromComponents(args) {
    return createInputProofFromComponents(args);
}
function createInputProofFromComponents({ coprocessorEIP712Signatures, externalHandles, extraData, coprocessorSignedParams, }) {
    if (externalHandles.length === 0) {
        throw new InputProofError_js_1.InputProofError({
            message: `Input proof must contain at least one external handle`,
        });
    }
    if (coprocessorSignedParams !== undefined) {
        (0, address_js_1.assertIsChecksummedAddress)(coprocessorSignedParams.userAddress, {});
        (0, address_js_1.assertIsChecksummedAddress)(coprocessorSignedParams.contractAddress, {});
    }
    const externalFhevmHandles = externalHandles.map(FhevmHandle_js_1.toExternalFhevmHandle);
    (0, bytes_js_1.assertIsBytes65HexArray)(coprocessorEIP712Signatures, {});
    (0, bytes_js_1.assertIsBytesHex)(extraData, {});
    const numberOfHandles = externalHandles.length;
    const numberOfSignatures = coprocessorEIP712Signatures.length;
    if (numberOfHandles > uint_js_1.MAX_UINT8) {
        throw new InputProofError_js_1.TooManyHandlesError({ numberOfHandles });
    }
    (0, InternalError_js_1.assert)(numberOfSignatures <= uint_js_1.MAX_UINT8);
    const numHandlesHexByte1 = (0, uint_js_1.uintToBytesHexNo0x)(numberOfHandles);
    const numSignaturesHexByte1 = (0, uint_js_1.uintToBytesHexNo0x)(numberOfHandles);
    (0, InternalError_js_1.assert)(numHandlesHexByte1.length === 2);
    (0, InternalError_js_1.assert)(numSignaturesHexByte1.length === 2);
    let proof = "";
    proof += (0, uint_js_1.uintToBytesHexNo0x)(externalHandles.length);
    proof += (0, uint_js_1.uintToBytesHexNo0x)(coprocessorEIP712Signatures.length);
    externalFhevmHandles.map((h) => (proof += h.bytes32HexNo0x));
    coprocessorEIP712Signatures.map((signatureBytesHex) => (proof += (0, string_js_1.remove0x)(signatureBytesHex)));
    proof += (0, string_js_1.remove0x)(extraData);
    (0, InternalError_js_1.assert)(proof.length ===
        (1 + 1 + numberOfHandles * 32 + numberOfSignatures * 65) * 2 +
            (extraData.length - 2));
    const inputProof = new InputProofImpl(PRIVATE_TOKEN, {
        inputProofBytesHex: `0x${proof}`,
        coprocessorSignatures: [...coprocessorEIP712Signatures],
        externalHandles: externalFhevmHandles,
        extraData,
        coprocessorSignedParams,
    });
    return inputProof;
}
function createUnverifiedInputProofFromRawBytes(inputProofBytes) {
    return createInputProofFromRawBytes({
        inputProofBytes,
    });
}
function createInputProofFromRawBytes({ inputProofBytes, coprocessorSignedParams, }) {
    (0, bytes_js_1.assertIsBytes)(inputProofBytes, {});
    if (inputProofBytes.length < 2) {
        throw new InputProofError_js_1.InputProofError({
            message: `Invalid proof: too short`,
        });
    }
    const numHandles = inputProofBytes[0];
    if (numHandles === 0 || numHandles === undefined) {
        throw new InputProofError_js_1.InputProofError({
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
        throw new InputProofError_js_1.InputProofError({
            message: `Invalid proof: expected at least ${signaturesEnd} bytes, got ${inputProofBytes.length}`,
        });
    }
    const handles = [];
    for (let i = 0; i < numHandles; i++) {
        const start = handlesStart + i * HANDLE_SIZE;
        const end = start + HANDLE_SIZE;
        const handleBytes = inputProofBytes.slice(start, end);
        const handleBytes32Hex = (0, bytes_js_1.bytes32ToHex)(handleBytes);
        handles.push(handleBytes32Hex);
    }
    const signatures = [];
    for (let i = 0; i < numSignatures; i++) {
        const start = signaturesStart + i * SIGNATURE_SIZE;
        const end = start + SIGNATURE_SIZE;
        const signatureBytes = inputProofBytes.slice(start, end);
        const signatureBytes65Hex = (0, bytes_js_1.bytes65ToHex)(signatureBytes);
        signatures.push(signatureBytes65Hex);
    }
    const extraDataBytes = inputProofBytes.slice(extraDataStart);
    const extraData = (0, bytes_js_1.bytesToHex)(extraDataBytes);
    const inputProof = createInputProofFromComponents({
        coprocessorEIP712Signatures: signatures,
        externalHandles: handles,
        extraData,
        coprocessorSignedParams,
    });
    (0, InternalError_js_1.assert)((0, bytes_js_1.bytesToHex)(inputProofBytes) === inputProof.bytesHex);
    return inputProof;
}
function inputProofBytesEquals(bytesA, bytesB) {
    if (bytesA.handles.length !== bytesB.handles.length) {
        return false;
    }
    for (let i = 0; i < bytesA.handles.length; ++i) {
        const a = bytesA.handles[i];
        const b = bytesB.handles[i];
        if (!(0, bytes_js_1.unsafeBytesEquals)(a, b)) {
            return false;
        }
    }
    return (0, bytes_js_1.unsafeBytesEquals)(bytesA.inputProof, bytesB.inputProof);
}
function isInputProof(value) {
    return value instanceof InputProofImpl;
}
function assertIsInputProof(value, options) {
    if (!isInputProof(value)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "InputProof",
        }, options);
    }
}
function isVerifiedInputProof(value) {
    return isInputProof(value) && value.coprocessorSignedParams !== undefined;
}
function assertIsVerifiedInputProof(value, options) {
    if (!isVerifiedInputProof(value)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "VerifiedInputProof",
        }, options);
    }
}
function toInputProofBytes(inputProof) {
    if (!(inputProof instanceof InputProofImpl)) {
        throw new InputProofError_js_1.InputProofError({ message: "Invalid inputProof object" });
    }
    return {
        handles: inputProof.externalHandles.map((h) => h.bytes32),
        inputProof: (0, bytes_js_1.hexToBytes)(inputProof.bytesHex),
    };
}
//# sourceMappingURL=InputProof-p.js.map