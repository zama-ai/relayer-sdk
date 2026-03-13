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
var _ZkProofImpl_chainId, _ZkProofImpl_aclContractAddress, _ZkProofImpl_contractAddress, _ZkProofImpl_userAddress, _ZkProofImpl_ciphertextWithZkProof, _ZkProofImpl_encryptionBits, _ZkProofImpl_fheTypeIds, _ZkProofImpl_fhevmHandles;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FHEVM_HANDLE_HASH_DOMAIN_SEPARATOR = exports.FHEVM_HANDLE_RAW_CT_HASH_DOMAIN_SEPARATOR = void 0;
exports.isZkProof = isZkProof;
exports.assertIsZkProof = assertIsZkProof;
exports.toZkProof = toZkProof;
exports.zkProofToFhevmHandles = zkProofToFhevmHandles;
exports.zkProofGetUnsafeRawBytes = zkProofGetUnsafeRawBytes;
const address_js_1 = require("../base/address.js");
const bytes_js_1 = require("../base/bytes.js");
const uint_js_1 = require("../base/uint.js");
const ZkProofError_js_1 = require("../errors/ZkProofError.js");
const FheType_js_1 = require("../handle/FheType.js");
const FhevmHandle_js_1 = require("../handle/FhevmHandle.js");
const sha3_js_1 = require("@noble/hashes/sha3.js");
const InvalidTypeError_js_1 = require("../base/errors/InvalidTypeError.js");
const PRIVATE_TOKEN = Symbol("ZkProof.token");
const GET_UNSAFE_RAW_BYTES_FUNC = Symbol("ZkProof.getUnsafeRawBytes");
exports.FHEVM_HANDLE_RAW_CT_HASH_DOMAIN_SEPARATOR = "ZK-w_rct";
exports.FHEVM_HANDLE_HASH_DOMAIN_SEPARATOR = "ZK-w_hdl";
class ZkProofImpl {
    constructor(privateToken, params) {
        _ZkProofImpl_chainId.set(this, void 0);
        _ZkProofImpl_aclContractAddress.set(this, void 0);
        _ZkProofImpl_contractAddress.set(this, void 0);
        _ZkProofImpl_userAddress.set(this, void 0);
        _ZkProofImpl_ciphertextWithZkProof.set(this, void 0);
        _ZkProofImpl_encryptionBits.set(this, void 0);
        _ZkProofImpl_fheTypeIds.set(this, void 0);
        _ZkProofImpl_fhevmHandles.set(this, void 0);
        if (privateToken !== PRIVATE_TOKEN) {
            throw new Error("Unauthorized");
        }
        __classPrivateFieldSet(this, _ZkProofImpl_chainId, params.chainId, "f");
        __classPrivateFieldSet(this, _ZkProofImpl_aclContractAddress, params.aclContractAddress, "f");
        __classPrivateFieldSet(this, _ZkProofImpl_contractAddress, params.contractAddress, "f");
        __classPrivateFieldSet(this, _ZkProofImpl_userAddress, params.userAddress, "f");
        __classPrivateFieldSet(this, _ZkProofImpl_ciphertextWithZkProof, params.ciphertextWithZkProof, "f");
        __classPrivateFieldSet(this, _ZkProofImpl_encryptionBits, Object.freeze([...params.encryptionBits]), "f");
        __classPrivateFieldSet(this, _ZkProofImpl_fheTypeIds, Object.freeze(__classPrivateFieldGet(this, _ZkProofImpl_encryptionBits, "f").map(FheType_js_1.fheTypeIdFromEncryptionBits)), "f");
        Object.freeze(this);
    }
    get chainId() {
        return __classPrivateFieldGet(this, _ZkProofImpl_chainId, "f");
    }
    get aclContractAddress() {
        return __classPrivateFieldGet(this, _ZkProofImpl_aclContractAddress, "f");
    }
    get contractAddress() {
        return __classPrivateFieldGet(this, _ZkProofImpl_contractAddress, "f");
    }
    get userAddress() {
        return __classPrivateFieldGet(this, _ZkProofImpl_userAddress, "f");
    }
    get ciphertextWithZkProof() {
        return new Uint8Array(__classPrivateFieldGet(this, _ZkProofImpl_ciphertextWithZkProof, "f"));
    }
    get encryptionBits() {
        return __classPrivateFieldGet(this, _ZkProofImpl_encryptionBits, "f");
    }
    get fheTypeIds() {
        return __classPrivateFieldGet(this, _ZkProofImpl_fheTypeIds, "f");
    }
    [(_ZkProofImpl_chainId = new WeakMap(), _ZkProofImpl_aclContractAddress = new WeakMap(), _ZkProofImpl_contractAddress = new WeakMap(), _ZkProofImpl_userAddress = new WeakMap(), _ZkProofImpl_ciphertextWithZkProof = new WeakMap(), _ZkProofImpl_encryptionBits = new WeakMap(), _ZkProofImpl_fheTypeIds = new WeakMap(), _ZkProofImpl_fhevmHandles = new WeakMap(), GET_UNSAFE_RAW_BYTES_FUNC)](token) {
        if (token !== PRIVATE_TOKEN) {
            throw new Error("Unauthorized");
        }
        return __classPrivateFieldGet(this, _ZkProofImpl_ciphertextWithZkProof, "f");
    }
    toString() {
        return `ZkProof(chainId=${String(__classPrivateFieldGet(this, _ZkProofImpl_chainId, "f"))}, contract=${__classPrivateFieldGet(this, _ZkProofImpl_contractAddress, "f")}, user=${__classPrivateFieldGet(this, _ZkProofImpl_userAddress, "f")}, types=${__classPrivateFieldGet(this, _ZkProofImpl_fheTypeIds, "f").length}, bytes=${String(__classPrivateFieldGet(this, _ZkProofImpl_ciphertextWithZkProof, "f").length)})`;
    }
    getFhevmHandles() {
        if (__classPrivateFieldGet(this, _ZkProofImpl_fhevmHandles, "f") === undefined) {
            __classPrivateFieldSet(this, _ZkProofImpl_fhevmHandles, _zkProofToFhevmHandles({
                ciphertextWithZkProof: __classPrivateFieldGet(this, _ZkProofImpl_ciphertextWithZkProof, "f"),
                aclContractAddress: __classPrivateFieldGet(this, _ZkProofImpl_aclContractAddress, "f"),
                fheTypeIds: __classPrivateFieldGet(this, _ZkProofImpl_fheTypeIds, "f"),
                chainId: __classPrivateFieldGet(this, _ZkProofImpl_chainId, "f"),
            }), "f");
            Object.freeze(__classPrivateFieldGet(this, _ZkProofImpl_fhevmHandles, "f"));
        }
        return __classPrivateFieldGet(this, _ZkProofImpl_fhevmHandles, "f");
    }
    toJson() {
        return {
            chainId: __classPrivateFieldGet(this, _ZkProofImpl_chainId, "f") <= Number.MAX_SAFE_INTEGER
                ? Number(__classPrivateFieldGet(this, _ZkProofImpl_chainId, "f"))
                : __classPrivateFieldGet(this, _ZkProofImpl_chainId, "f"),
            aclContractAddress: __classPrivateFieldGet(this, _ZkProofImpl_aclContractAddress, "f"),
            contractAddress: __classPrivateFieldGet(this, _ZkProofImpl_contractAddress, "f"),
            userAddress: __classPrivateFieldGet(this, _ZkProofImpl_userAddress, "f"),
            ciphertextWithZkProof: (0, bytes_js_1.bytesToHexLarge)(__classPrivateFieldGet(this, _ZkProofImpl_ciphertextWithZkProof, "f")),
            encryptionBits: __classPrivateFieldGet(this, _ZkProofImpl_encryptionBits, "f"),
            fheTypeIds: __classPrivateFieldGet(this, _ZkProofImpl_fheTypeIds, "f"),
        };
    }
}
Object.freeze(ZkProofImpl);
Object.freeze(ZkProofImpl.prototype);
function isZkProof(value) {
    return value instanceof ZkProofImpl;
}
function assertIsZkProof(value, options) {
    if (!isZkProof(value)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "ZkProof",
        }, options);
    }
}
async function toZkProof(zkProofLike, options) {
    if (zkProofLike instanceof ZkProofImpl) {
        return zkProofLike;
    }
    (0, uint_js_1.assertIsUint64)(zkProofLike.chainId, {});
    const chainId = BigInt(zkProofLike.chainId);
    (0, address_js_1.assertIsChecksummedAddress)(zkProofLike.aclContractAddress, {});
    (0, address_js_1.assertIsChecksummedAddress)(zkProofLike.contractAddress, {});
    (0, address_js_1.assertIsChecksummedAddress)(zkProofLike.userAddress, {});
    const ciphertextWithZkProof = (0, bytes_js_1.toBytes)(zkProofLike.ciphertextWithZkProof, {
        subject: "ciphertextWithZkProof",
        copy: options?.copy !== false,
    });
    if (ciphertextWithZkProof.length === 0) {
        throw new ZkProofError_js_1.ZkProofError({
            message: "ciphertextWithZkProof argument should not be empty",
        });
    }
    const encryptionBits = await _getOrParseEncryptionBits(zkProofLike.encryptionBits, ciphertextWithZkProof, options?.zkProofParser);
    return new ZkProofImpl(PRIVATE_TOKEN, {
        chainId,
        aclContractAddress: zkProofLike.aclContractAddress,
        contractAddress: zkProofLike.contractAddress,
        userAddress: zkProofLike.userAddress,
        ciphertextWithZkProof: ciphertextWithZkProof,
        encryptionBits,
    });
}
async function zkProofToFhevmHandles(zkProofLike, options) {
    if (zkProofLike instanceof ZkProofImpl) {
        return zkProofLike.getFhevmHandles();
    }
    (0, address_js_1.assertIsChecksummedAddress)(zkProofLike.aclContractAddress, {
        subject: "aclContractAddress",
    });
    const encryptionBits = await _getOrParseEncryptionBits(zkProofLike.encryptionBits, zkProofLike.ciphertextWithZkProof, options?.zkProofParser);
    const ciphertextWithZkProof = (0, bytes_js_1.toBytes)(zkProofLike.ciphertextWithZkProof, {
        subject: "ciphertextWithZkProof",
    });
    const fheTypeIds = encryptionBits.map((w) => (0, FheType_js_1.fheTypeIdFromEncryptionBits)(w));
    (0, uint_js_1.assertIsUint8)(fheTypeIds.length, {});
    return _zkProofToFhevmHandles({
        ciphertextWithZkProof: ciphertextWithZkProof,
        aclContractAddress: zkProofLike.aclContractAddress,
        fheTypeIds,
        chainId: (0, uint_js_1.asUint64BigInt)(zkProofLike.chainId, { subject: "chainId" }),
    });
}
function _assertEncryptionBitsMatch(actual, expected) {
    if (actual.length !== expected.length) {
        throw new ZkProofError_js_1.ZkProofError({
            message: `Encryption count mismatch, expected ${expected.length}, got ${actual.length}.`,
        });
    }
    for (let i = 0; i < actual.length; ++i) {
        if (actual[i] !== expected[i]) {
            throw new ZkProofError_js_1.ZkProofError({
                message: `Encryption type mismatch at index ${i}.`,
            });
        }
    }
}
function _zkProofToFhevmHandles(args, options) {
    const encoder = new TextEncoder();
    const domainSepBytes = encoder.encode(exports.FHEVM_HANDLE_RAW_CT_HASH_DOMAIN_SEPARATOR);
    const blobHashBytes32Hex = (0, bytes_js_1.bytes32ToHex)((0, sha3_js_1.keccak_256)((0, bytes_js_1.concatBytes)(domainSepBytes, args.ciphertextWithZkProof)));
    const handles = [];
    for (const [i, fheTypeId] of args.fheTypeIds.entries()) {
        const hash21 = _computeInputHash21((0, bytes_js_1.hexToBytes32)(blobHashBytes32Hex), args.aclContractAddress, args.chainId, i);
        handles.push((0, FhevmHandle_js_1.buildFhevmHandle)({
            hash21,
            chainId: args.chainId,
            fheTypeId,
            ...(options?.version !== undefined ? { version: options.version } : {}),
            index: i,
        }));
    }
    return handles;
}
async function _getOrParseEncryptionBits(encryptionBits, ciphertextWithZkProof, zkProofParser) {
    if (encryptionBits != null) {
        (0, FheType_js_1.assertIsEncryptionBitsArray)(encryptionBits, {
            subject: "encryptionBits",
        });
        if (zkProofParser != null) {
            const parsed = await zkProofParser.parseTFHEProvenCompactCiphertextList({
                ciphertextWithZkProof: ciphertextWithZkProof,
            });
            _assertEncryptionBitsMatch(parsed.encryptionBits, encryptionBits);
        }
        return encryptionBits;
    }
    if (zkProofParser != null) {
        const parsed = await zkProofParser.parseTFHEProvenCompactCiphertextList({
            ciphertextWithZkProof: ciphertextWithZkProof,
        });
        return parsed.encryptionBits;
    }
    throw new ZkProofError_js_1.ZkProofError({ message: "Missing encryption bits" });
}
function _computeInputHash21(blobHashBytes32, aclAddress, chainId, index) {
    const encryptionIndexByte1 = new Uint8Array([index]);
    const aclContractAddressBytes20 = (0, address_js_1.checksummedAddressToBytes20)(aclAddress);
    const chainIdBytes32 = (0, uint_js_1.uint64ToBytes32)(chainId);
    const encoder = new TextEncoder();
    const domainSepBytes = encoder.encode(exports.FHEVM_HANDLE_HASH_DOMAIN_SEPARATOR);
    const hashBytes32Hex = (0, bytes_js_1.bytes32ToHex)((0, sha3_js_1.keccak_256)((0, bytes_js_1.concatBytes)(domainSepBytes, blobHashBytes32, encryptionIndexByte1, aclContractAddressBytes20, chainIdBytes32)));
    return hashBytes32Hex.slice(0, 2 + 2 * 21);
}
function zkProofGetUnsafeRawBytes(zkProof) {
    if (!(zkProof instanceof ZkProofImpl)) {
        throw new Error("Unauthorized");
    }
    return zkProof[GET_UNSAFE_RAW_BYTES_FUNC](PRIVATE_TOKEN);
}
//# sourceMappingURL=ZkProof-p.js.map