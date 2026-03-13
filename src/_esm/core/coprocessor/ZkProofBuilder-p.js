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
import { assert } from "../base/errors/InternalError.js";
import { isUint64, uint256ToBytes32 } from "../base/uint.js";
import { isAddress } from "../base/address.js";
import { hexToBytes20 } from "../base/bytes.js";
import { ZkProofError } from "../errors/ZkProofError.js";
import { TypedValueArrayBuilder } from "../base/typedvalue.js";
import { toZkProof } from "./ZkProof-p.js";
import { encryptionBitsFromFheType, fheTypeNameFromTypeName, } from "../handle/FheType.js";
////////////////////////////////////////////////////////////////////////////////
const PRIVATE_TOKEN = Symbol("ZkProofBuilder.token");
////////////////////////////////////////////////////////////////////////////////
export const TFHE_CRS_BITS_CAPACITY = 2048;
export const TFHE_ZKPROOF_CIPHERTEXT_CAPACITY = 256;
////////////////////////////////////////////////////////////////////////////////
// ZkProofBuilder
////////////////////////////////////////////////////////////////////////////////
class ZkProofBuilderImpl {
    constructor(privateToken, parameters) {
        _ZkProofBuilderImpl_instances.add(this);
        _ZkProofBuilderImpl_totalBits.set(this, 0);
        _ZkProofBuilderImpl_bits.set(this, []);
        _ZkProofBuilderImpl_bitsCapacity.set(this, void 0);
        _ZkProofBuilderImpl_ciphertextCapacity.set(this, void 0);
        _ZkProofBuilderImpl_builder.set(this, new TypedValueArrayBuilder());
        if (privateToken !== PRIVATE_TOKEN) {
            throw new Error("Unauthorized");
        }
        __classPrivateFieldSet(this, _ZkProofBuilderImpl_bitsCapacity, parameters.bitsCapacity, "f");
        __classPrivateFieldSet(this, _ZkProofBuilderImpl_ciphertextCapacity, parameters.ciphertextCapacity, "f");
    }
    //////////////////////////////////////////////////////////////////////////////
    // Public API
    //////////////////////////////////////////////////////////////////////////////
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
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_instances, "m", _ZkProofBuilderImpl_addType).call(this, fheTypeNameFromTypeName(typedValue.type));
        return this;
    }
    addBool(value) {
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_builder, "f").addBool(value);
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_instances, "m", _ZkProofBuilderImpl_addType).call(this, fheTypeNameFromTypeName("bool"));
        return this;
    }
    addUint8(value) {
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_builder, "f").addUint8(value);
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_instances, "m", _ZkProofBuilderImpl_addType).call(this, fheTypeNameFromTypeName("uint8"));
        return this;
    }
    addUint16(value) {
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_builder, "f").addUint16(value);
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_instances, "m", _ZkProofBuilderImpl_addType).call(this, fheTypeNameFromTypeName("uint16"));
        return this;
    }
    addUint32(value) {
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_builder, "f").addUint32(value);
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_instances, "m", _ZkProofBuilderImpl_addType).call(this, fheTypeNameFromTypeName("uint32"));
        return this;
    }
    addUint64(value) {
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_builder, "f").addUint64(value);
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_instances, "m", _ZkProofBuilderImpl_addType).call(this, fheTypeNameFromTypeName("uint64"));
        return this;
    }
    addUint128(value) {
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_builder, "f").addUint128(value);
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_instances, "m", _ZkProofBuilderImpl_addType).call(this, fheTypeNameFromTypeName("uint128"));
        return this;
    }
    addUint256(value) {
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_builder, "f").addUint256(value);
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_instances, "m", _ZkProofBuilderImpl_addType).call(this, fheTypeNameFromTypeName("uint256"));
        return this;
    }
    addAddress(value) {
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_builder, "f").addAddress(value);
        __classPrivateFieldGet(this, _ZkProofBuilderImpl_instances, "m", _ZkProofBuilderImpl_addType).call(this, fheTypeNameFromTypeName("address"));
        return this;
    }
    async build(fhevm, { contractAddress, userAddress, globalFhePublicEncryptionParams, }) {
        if (__classPrivateFieldGet(this, _ZkProofBuilderImpl_totalBits, "f") === 0) {
            throw new ZkProofError({
                message: `Encrypted input must contain at least one value`,
            });
        }
        // should be guaranteed at this point
        assert(__classPrivateFieldGet(this, _ZkProofBuilderImpl_totalBits, "f") <= __classPrivateFieldGet(this, _ZkProofBuilderImpl_bitsCapacity, "f"));
        if (!isAddress(contractAddress)) {
            throw new ZkProofError({
                message: `Invalid contract address: ${contractAddress}`,
            });
        }
        if (!isAddress(userAddress)) {
            throw new ZkProofError({
                message: `Invalid user address: ${userAddress}`,
            });
        }
        const aclContractAddress = fhevm.chain.fhevm.contracts.acl.address;
        const chainId = fhevm.chain.id;
        if (!isAddress(aclContractAddress)) {
            throw new ZkProofError({
                message: `Invalid ACL address: ${aclContractAddress}`,
            });
        }
        if (!isUint64(chainId)) {
            throw new ZkProofError({
                message: `Invalid chain ID uint64: ${chainId}`,
            });
        }
        // Note about hexToBytes(<address>)
        // ================================
        // All addresses are 42 characters long strings.
        // hexToBytes(<42-characters hex string>) always returns a 20-byte long Uint8Array
        // Bytes20
        const contractAddressBytes20 = hexToBytes20(contractAddress);
        // Bytes20
        const userAddressBytes20 = hexToBytes20(userAddress);
        // Bytes20
        const aclContractAddressBytes20 = hexToBytes20(aclContractAddress);
        // Bytes32
        const chainIdBytes32 = uint256ToBytes32(chainId);
        const metaDataLength = 3 * 20 + 32;
        const metaData = new Uint8Array(metaDataLength);
        metaData.set(contractAddressBytes20, 0);
        metaData.set(userAddressBytes20, 20);
        metaData.set(aclContractAddressBytes20, 40);
        metaData.set(chainIdBytes32, 60);
        assert(metaData.length - chainIdBytes32.length === 60);
        const ciphertextWithZKProofBytes = await fhevm.runtime.encrypt.buildWithProofPacked({
            typedValues: [...__classPrivateFieldGet(this, _ZkProofBuilderImpl_builder, "f").build()],
            publicEncryptionParams: globalFhePublicEncryptionParams,
            metaData,
        });
        return toZkProof({
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
        throw new ZkProofError({
            message: `Packing more than ${__classPrivateFieldGet(this, _ZkProofBuilderImpl_bitsCapacity, "f").toString()} bits in a single input ciphertext is unsupported`,
        });
    }
    if (__classPrivateFieldGet(this, _ZkProofBuilderImpl_bits, "f").length >= __classPrivateFieldGet(this, _ZkProofBuilderImpl_ciphertextCapacity, "f")) {
        throw new ZkProofError({
            message: `Packing more than ${__classPrivateFieldGet(this, _ZkProofBuilderImpl_ciphertextCapacity, "f").toString()} variables in a single input ciphertext is unsupported`,
        });
    }
}, _ZkProofBuilderImpl_addType = function _ZkProofBuilderImpl_addType(fheTypeName) {
    // encryptionBits is guaranteed to be >= 2
    const encryptionBits = encryptionBitsFromFheType(fheTypeName);
    __classPrivateFieldGet(this, _ZkProofBuilderImpl_instances, "m", _ZkProofBuilderImpl_checkLimit).call(this, encryptionBits);
    __classPrivateFieldSet(this, _ZkProofBuilderImpl_totalBits, __classPrivateFieldGet(this, _ZkProofBuilderImpl_totalBits, "f") + encryptionBits, "f");
    __classPrivateFieldGet(this, _ZkProofBuilderImpl_bits, "f").push(encryptionBits);
};
//////////////////////////////////////////////////////////////////////////////
export function createZkProofBuilder() {
    return new ZkProofBuilderImpl(PRIVATE_TOKEN, {
        ciphertextCapacity: TFHE_ZKPROOF_CIPHERTEXT_CAPACITY,
        bitsCapacity: TFHE_CRS_BITS_CAPACITY,
    });
}
//# sourceMappingURL=ZkProofBuilder-p.js.map