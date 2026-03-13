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
import { MAX_UINT8, uintToBytesHexNo0x } from "../base/uint.js";
import { assertIsBytes, assertIsBytes65HexArray, assertIsBytesHex, bytes32ToHex, bytes65ToHex, bytesToHex, hexToBytes, unsafeBytesEquals, } from "../base/bytes.js";
import { assert } from "../base/errors/InternalError.js";
import { remove0x } from "../base/string.js";
import { InputProofError, TooManyHandlesError, } from "../errors/InputProofError.js";
import { toExternalFhevmHandle } from "../handle/FhevmHandle.js";
import { assertIsChecksummedAddress } from "../base/address.js";
import { InvalidTypeError } from "../base/errors/InvalidTypeError.js";
////////////////////////////////////////////////////////////////////////////////
const PRIVATE_TOKEN = Symbol("InputProof.token");
////////////////////////////////////////////////////////////////////////////////
// Private class InputProof
////////////////////////////////////////////////////////////////////////////////
class InputProofImpl {
    constructor(privateToken, parameters) {
        _InputProofImpl_inputProofBytesHex.set(this, void 0);
        // Components of the proof
        _InputProofImpl_externalHandles.set(this, void 0);
        _InputProofImpl_coprocessorSignatures.set(this, void 0);
        _InputProofImpl_extraData.set(this, void 0);
        _InputProofImpl_coprocessorSignedParams.set(this, void 0);
        if (privateToken !== PRIVATE_TOKEN) {
            throw new Error("Unauthorized");
        }
        const { inputProofBytesHex, coprocessorSignatures, externalHandles, extraData, coprocessorSignedParams, } = parameters;
        // Note: it is not possible to create a ZKProof with zero values.
        // consequently, the handles array cannot be empty
        assert(externalHandles.length > 0);
        assert(coprocessorSignatures.length > 0);
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
////////////////////////////////////////////////////////////////////////////////
// Public API
////////////////////////////////////////////////////////////////////////////////
export function createUnverifiedInputProofFromComponents(args) {
    return createInputProofFromComponents(args);
}
////////////////////////////////////////////////////////////////////////////////
export function createInputProofFromComponents({ coprocessorEIP712Signatures, externalHandles, extraData, coprocessorSignedParams, }) {
    if (externalHandles.length === 0) {
        throw new InputProofError({
            message: `Input proof must contain at least one external handle`,
        });
    }
    if (coprocessorSignedParams !== undefined) {
        assertIsChecksummedAddress(coprocessorSignedParams.userAddress, {});
        assertIsChecksummedAddress(coprocessorSignedParams.contractAddress, {});
    }
    const externalFhevmHandles = externalHandles.map(toExternalFhevmHandle);
    assertIsBytes65HexArray(coprocessorEIP712Signatures, {});
    assertIsBytesHex(extraData, {});
    const numberOfHandles = externalHandles.length;
    const numberOfSignatures = coprocessorEIP712Signatures.length;
    if (numberOfHandles > MAX_UINT8) {
        throw new TooManyHandlesError({ numberOfHandles });
    }
    assert(numberOfSignatures <= MAX_UINT8);
    const numHandlesHexByte1 = uintToBytesHexNo0x(numberOfHandles);
    const numSignaturesHexByte1 = uintToBytesHexNo0x(numberOfHandles);
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
    let proof = "";
    // Add number of handles (uint8 | Byte1)
    proof += uintToBytesHexNo0x(externalHandles.length);
    // Add number of signatures (uint8 | Byte1)
    proof += uintToBytesHexNo0x(coprocessorEIP712Signatures.length);
    // Add handles: (uint256 | Byte32) x numHandles
    externalFhevmHandles.map((h) => (proof += h.bytes32HexNo0x));
    // Add signatures: (uint256 | Byte32) x numSignatures
    coprocessorEIP712Signatures.map((signatureBytesHex) => (proof += remove0x(signatureBytesHex)));
    // Append the extra data to the input proof
    proof += remove0x(extraData);
    // Make sure we get the right size
    assert(proof.length ===
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
////////////////////////////////////////////////////////////////////////////////
export function createUnverifiedInputProofFromRawBytes(inputProofBytes) {
    return createInputProofFromRawBytes({
        inputProofBytes,
    });
}
////////////////////////////////////////////////////////////////////////////////
export function createInputProofFromRawBytes({ inputProofBytes, coprocessorSignedParams, }) {
    assertIsBytes(inputProofBytes, {});
    if (inputProofBytes.length < 2) {
        throw new InputProofError({
            message: `Invalid proof: too short`,
        });
    }
    const numHandles = inputProofBytes[0];
    if (numHandles === 0 || numHandles === undefined) {
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
    const handles = [];
    for (let i = 0; i < numHandles; i++) {
        const start = handlesStart + i * HANDLE_SIZE;
        const end = start + HANDLE_SIZE;
        const handleBytes = inputProofBytes.slice(start, end);
        const handleBytes32Hex = bytes32ToHex(handleBytes);
        handles.push(handleBytes32Hex);
    }
    // Extract signatures
    const signatures = [];
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
    const inputProof = createInputProofFromComponents({
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
/**
 * Validates that the provided handles and inputProof bytes match this InputProof.
 * Use this as a sanity check to ensure handles correspond to the proof data.
 */
export function inputProofBytesEquals(bytesA, bytesB) {
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
export function isInputProof(value) {
    return value instanceof InputProofImpl;
}
////////////////////////////////////////////////////////////////////////////////
export function assertIsInputProof(value, options) {
    if (!isInputProof(value)) {
        throw new InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "InputProof",
        }, options);
    }
}
////////////////////////////////////////////////////////////////////////////////
export function isVerifiedInputProof(value) {
    return isInputProof(value) && value.coprocessorSignedParams !== undefined;
}
////////////////////////////////////////////////////////////////////////////////
export function assertIsVerifiedInputProof(value, options) {
    if (!isVerifiedInputProof(value)) {
        throw new InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "VerifiedInputProof",
        }, options);
    }
}
////////////////////////////////////////////////////////////////////////////////
export function toInputProofBytes(inputProof) {
    if (!(inputProof instanceof InputProofImpl)) {
        throw new InputProofError({ message: "Invalid inputProof object" });
    }
    return {
        handles: inputProof.externalHandles.map((h) => h.bytes32),
        inputProof: hexToBytes(inputProof.bytesHex),
    };
}
//# sourceMappingURL=InputProof-p.js.map