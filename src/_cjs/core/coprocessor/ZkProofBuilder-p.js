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
var _ZkProofBuilderImpl_instances, _ZkProofBuilderImpl_totalBits, _ZkProofBuilderImpl_bits, _ZkProofBuilderImpl_bitsCapacity, _ZkProofBuilderImpl_ciphertextCapacity, _ZkProofBuilderImpl_builder, _ZkProofBuilderImpl_checkLimit, _ZkProofBuilderImpl_addType;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TFHE_ZKPROOF_CIPHERTEXT_CAPACITY = exports.TFHE_CRS_BITS_CAPACITY = void 0;
exports.createZkProofBuilder = createZkProofBuilder;
const InternalError_js_1 = require("../base/errors/InternalError.js");
const uint_js_1 = require("../base/uint.js");
const address_js_1 = require("../base/address.js");
const bytes_js_1 = require("../base/bytes.js");
const ZkProofError_js_1 = require("../errors/ZkProofError.js");
const typedvalue_js_1 = require("../base/typedvalue.js");
const ZkProof_p_js_1 = require("./ZkProof-p.js");
const FheType_js_1 = require("../handle/FheType.js");
const PRIVATE_TOKEN = Symbol("ZkProofBuilder.token");
exports.TFHE_CRS_BITS_CAPACITY = 2048;
exports.TFHE_ZKPROOF_CIPHERTEXT_CAPACITY = 256;
class ZkProofBuilderImpl {
    constructor(privateToken, parameters) {
        _ZkProofBuilderImpl_instances.add(this);
        _ZkProofBuilderImpl_totalBits.set(this, 0);
        _ZkProofBuilderImpl_bits.set(this, []);
        _ZkProofBuilderImpl_bitsCapacity.set(this, void 0);
        _ZkProofBuilderImpl_ciphertextCapacity.set(this, void 0);
        _ZkProofBuilderImpl_builder.set(this, new typedvalue_js_1.TypedValueArrayBuilder());
        if (privateToken !== PRIVATE_TOKEN) {
            throw new Error("Unauthorized");
        }
        __classPrivateFieldSet(this, _ZkProofBuilderImpl_bitsCapacity, parameters.bitsCapacity, "f");
        __classPrivateFieldSet(this, _ZkProofBuilderImpl_ciphertextCapacity, parameters.ciphertextCapacity, "f");
    }
    get count() {
        return __classPrivateFieldGet(this, _ZkProofBuilderImpl_bits, "f").length;
    }
    get totalBits() {
        return __classPrivateFieldGet(this, _ZkProofBuilderImpl_totalBits, "f");
    }
    getBits() {
        return [...__classPrivateFieldGet(this, _ZkProofBuilderImpl_bits, "f")];
    }
    addTypedValue(typedValue) {
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_builder, "f").addTypedValue(typedValue);
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_instances, "m", _ZkProofBuilderImpl_addType).call(this, (0, FheType_js_1.fheTypeNameFromTypeName)(typedValue.type));
        return this;
    }
    addBool(value) {
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_builder, "f").addBool(value);
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_instances, "m", _ZkProofBuilderImpl_addType).call(this, (0, FheType_js_1.fheTypeNameFromTypeName)("bool"));
        return this;
    }
    addUint8(value) {
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_builder, "f").addUint8(value);
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_instances, "m", _ZkProofBuilderImpl_addType).call(this, (0, FheType_js_1.fheTypeNameFromTypeName)("uint8"));
        return this;
    }
    addUint16(value) {
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_builder, "f").addUint16(value);
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_instances, "m", _ZkProofBuilderImpl_addType).call(this, (0, FheType_js_1.fheTypeNameFromTypeName)("uint16"));
        return this;
    }
    addUint32(value) {
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_builder, "f").addUint32(value);
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_instances, "m", _ZkProofBuilderImpl_addType).call(this, (0, FheType_js_1.fheTypeNameFromTypeName)("uint32"));
        return this;
    }
    addUint64(value) {
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_builder, "f").addUint64(value);
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_instances, "m", _ZkProofBuilderImpl_addType).call(this, (0, FheType_js_1.fheTypeNameFromTypeName)("uint64"));
        return this;
    }
    addUint128(value) {
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_builder, "f").addUint128(value);
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_instances, "m", _ZkProofBuilderImpl_addType).call(this, (0, FheType_js_1.fheTypeNameFromTypeName)("uint128"));
        return this;
    }
    addUint256(value) {
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_builder, "f").addUint256(value);
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_instances, "m", _ZkProofBuilderImpl_addType).call(this, (0, FheType_js_1.fheTypeNameFromTypeName)("uint256"));
        return this;
    }
    addAddress(value) {
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_builder, "f").addAddress(value);
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_instances, "m", _ZkProofBuilderImpl_addType).call(this, (0, FheType_js_1.fheTypeNameFromTypeName)("address"));
        return this;
    }
    async build(fhevm, { contractAddress, userAddress, globalFhePublicEncryptionParams, }) {
        if (__classPrivateFieldGet(this, _ZkProofBuilderImpl_totalBits, "f") === 0) {
            throw new ZkProofError_js_1.ZkProofError({
                message: `Encrypted input must contain at least one value`,
            });
        }
        (0, InternalError_js_1.assert)(__classPrivateFieldGet(this, _ZkProofBuilderImpl_totalBits, "f") <= __classPrivateFieldGet(this, _ZkProofBuilderImpl_bitsCapacity, "f"));
        if (!(0, address_js_1.isAddress)(contractAddress)) {
            throw new ZkProofError_js_1.ZkProofError({
                message: `Invalid contract address: ${contractAddress}`,
            });
        }
        if (!(0, address_js_1.isAddress)(userAddress)) {
            throw new ZkProofError_js_1.ZkProofError({
                message: `Invalid user address: ${userAddress}`,
            });
        }
        const aclContractAddress = fhevm.chain.fhevm.contracts.acl.address;
        const chainId = fhevm.chain.id;
        if (!(0, address_js_1.isAddress)(aclContractAddress)) {
            throw new ZkProofError_js_1.ZkProofError({
                message: `Invalid ACL address: ${aclContractAddress}`,
            });
        }
        if (!(0, uint_js_1.isUint64)(chainId)) {
            throw new ZkProofError_js_1.ZkProofError({
                message: `Invalid chain ID uint64: ${chainId}`,
            });
        }
        const contractAddressBytes20 = (0, bytes_js_1.hexToBytes20)(contractAddress);
        const userAddressBytes20 = (0, bytes_js_1.hexToBytes20)(userAddress);
        const aclContractAddressBytes20 = (0, bytes_js_1.hexToBytes20)(aclContractAddress);
        const chainIdBytes32 = (0, uint_js_1.uint256ToBytes32)(chainId);
        const metaDataLength = 3 * 20 + 32;
        const metaData = new Uint8Array(metaDataLength);
        metaData.set(contractAddressBytes20, 0);
        metaData.set(userAddressBytes20, 20);
        metaData.set(aclContractAddressBytes20, 40);
        metaData.set(chainIdBytes32, 60);
        (0, InternalError_js_1.assert)(metaData.length - chainIdBytes32.length === 60);
        const ciphertextWithZKProofBytes = await fhevm.runtime.encrypt.buildWithProofPacked({
            typedValues: [...__classPrivateFieldGet(this, _ZkProofBuilderImpl_builder, "f").build()],
            publicEncryptionParams: globalFhePublicEncryptionParams,
            metaData,
        });
        return (0, ZkProof_p_js_1.toZkProof)({
            chainId: BigInt(chainId),
            aclContractAddress,
            contractAddress,
            userAddress,
            ciphertextWithZkProof: ciphertextWithZKProofBytes,
            encryptionBits: __classPrivateFieldGet(this, _ZkProofBuilderImpl_bits, "f"),
        }, { copy: false });
    }
}
_ZkProofBuilderImpl_totalBits = new WeakMap(), _ZkProofBuilderImpl_bits = new WeakMap(), _ZkProofBuilderImpl_bitsCapacity = new WeakMap(), _ZkProofBuilderImpl_ciphertextCapacity = new WeakMap(), _ZkProofBuilderImpl_builder = new WeakMap(), _ZkProofBuilderImpl_instances = new WeakSet(), _ZkProofBuilderImpl_checkLimit = function _ZkProofBuilderImpl_checkLimit(encryptionBits) {
    if (__classPrivateFieldGet(this, _ZkProofBuilderImpl_totalBits, "f") + encryptionBits > __classPrivateFieldGet(this, _ZkProofBuilderImpl_bitsCapacity, "f")) {
        throw new ZkProofError_js_1.ZkProofError({
            message: `Packing more than ${__classPrivateFieldGet(this, _ZkProofBuilderImpl_bitsCapacity, "f").toString()} bits in a single input ciphertext is unsupported`,
        });
    }
    if (__classPrivateFieldGet(this, _ZkProofBuilderImpl_bits, "f").length >= __classPrivateFieldGet(this, _ZkProofBuilderImpl_ciphertextCapacity, "f")) {
        throw new ZkProofError_js_1.ZkProofError({
            message: `Packing more than ${__classPrivateFieldGet(this, _ZkProofBuilderImpl_ciphertextCapacity, "f").toString()} variables in a single input ciphertext is unsupported`,
        });
    }
}, _ZkProofBuilderImpl_addType = function _ZkProofBuilderImpl_addType(fheTypeName) {
    const encryptionBits = (0, FheType_js_1.encryptionBitsFromFheType)(fheTypeName);
    __classPrivateFieldGet(this, _ZkProofBuilderImpl_instances, "m", _ZkProofBuilderImpl_checkLimit).call(this, encryptionBits);
    __classPrivateFieldSet(this, _ZkProofBuilderImpl_totalBits, __classPrivateFieldGet(this, _ZkProofBuilderImpl_totalBits, "f") + encryptionBits, "f");
    __classPrivateFieldGet(this, _ZkProofBuilderImpl_bits, "f").push(encryptionBits);
};
function createZkProofBuilder() {
    return new ZkProofBuilderImpl(PRIVATE_TOKEN, {
        ciphertextCapacity: exports.TFHE_ZKPROOF_CIPHERTEXT_CAPACITY,
        bitsCapacity: exports.TFHE_CRS_BITS_CAPACITY,
    });
}
//# sourceMappingURL=ZkProofBuilder-p.js.map