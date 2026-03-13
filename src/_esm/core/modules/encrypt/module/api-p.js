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
var _TfheCompactPublicKeyImpl_id, _TfheCompactPublicKeyImpl_tfheCompactPublicKeyWasmType, _TfheCompactPkeCrsImpl_id, _TfheCompactPkeCrsImpl_capacity, _TfheCompactPkeCrsImpl_compactPublicKeyWasmType;
import { TfheCompactPublicKey, CompactPkeCrs, ProvenCompactCiphertextList, CompactCiphertextList, ZkComputeLoad, } from "../../../../wasm/tfhe/tfhe.v1.5.3.js";
import { isNonEmptyString } from "../../../base/string.js";
import { hexToBytesFaster } from "../../../base/bytes.js";
import { encryptionBitsFromFheTypeId, isFheTypeId, } from "../../../handle/FheType.js";
import { EncryptionError } from "../../../errors/EncryptionError.js";
import { getErrorMessage } from "../../../base/errors/utils.js";
import { initTfheModule } from "./init-p.js";
////////////////////////////////////////////////////////////////////////////////
const GET_NATIVE_FUNC = Symbol("TFHELib.getNative");
const PRIVATE_TFHE_LIB_TOKEN = Symbol("TFHELib.token");
////////////////////////////////////////////////////////////////////////////////
//
// TFHELib
//
////////////////////////////////////////////////////////////////////////////////
export const SERIALIZED_SIZE_LIMIT_CIPHERTEXT = BigInt(1024 * 1024 * 512);
export const SERIALIZED_SIZE_LIMIT_PK = BigInt(1024 * 1024 * 512);
export const SERIALIZED_SIZE_LIMIT_CRS = BigInt(1024 * 1024 * 512);
////////////////////////////////////////////////////////////////////////////////
// TfheCompactPublicKeyImpl
////////////////////////////////////////////////////////////////////////////////
class TfheCompactPublicKeyImpl {
    constructor(token, id, publicEncKeyMlKem512Wasm) {
        _TfheCompactPublicKeyImpl_id.set(this, void 0);
        _TfheCompactPublicKeyImpl_tfheCompactPublicKeyWasmType.set(this, void 0);
        if (token !== PRIVATE_TFHE_LIB_TOKEN) {
            throw new Error("Unauthorized");
        }
        __classPrivateFieldSet(this, _TfheCompactPublicKeyImpl_id, id, "f");
        __classPrivateFieldSet(this, _TfheCompactPublicKeyImpl_tfheCompactPublicKeyWasmType, publicEncKeyMlKem512Wasm, "f");
    }
    get id() {
        return __classPrivateFieldGet(this, _TfheCompactPublicKeyImpl_id, "f");
    }
    static [(_TfheCompactPublicKeyImpl_id = new WeakMap(), _TfheCompactPublicKeyImpl_tfheCompactPublicKeyWasmType = new WeakMap(), GET_NATIVE_FUNC)](key, token) {
        if (token !== PRIVATE_TFHE_LIB_TOKEN) {
            throw new Error("Unauthorized");
        }
        if (!(key instanceof TfheCompactPublicKeyImpl)) {
            throw new Error("Unauthorized");
        }
        return __classPrivateFieldGet(key, _TfheCompactPublicKeyImpl_tfheCompactPublicKeyWasmType, "f");
    }
}
////////////////////////////////////////////////////////////////////////////////
// TfheCompactPkeCrsImpl
////////////////////////////////////////////////////////////////////////////////
class TfheCompactPkeCrsImpl {
    constructor(token, id, capacity, compactPublicKeyWasmType) {
        _TfheCompactPkeCrsImpl_id.set(this, void 0);
        _TfheCompactPkeCrsImpl_capacity.set(this, void 0);
        _TfheCompactPkeCrsImpl_compactPublicKeyWasmType.set(this, void 0);
        if (token !== PRIVATE_TFHE_LIB_TOKEN) {
            throw new Error("Unauthorized");
        }
        __classPrivateFieldSet(this, _TfheCompactPkeCrsImpl_id, id, "f");
        __classPrivateFieldSet(this, _TfheCompactPkeCrsImpl_capacity, capacity, "f");
        __classPrivateFieldSet(this, _TfheCompactPkeCrsImpl_compactPublicKeyWasmType, compactPublicKeyWasmType, "f");
    }
    get id() {
        return __classPrivateFieldGet(this, _TfheCompactPkeCrsImpl_id, "f");
    }
    get capacity() {
        return __classPrivateFieldGet(this, _TfheCompactPkeCrsImpl_capacity, "f");
    }
    static [(_TfheCompactPkeCrsImpl_id = new WeakMap(), _TfheCompactPkeCrsImpl_capacity = new WeakMap(), _TfheCompactPkeCrsImpl_compactPublicKeyWasmType = new WeakMap(), GET_NATIVE_FUNC)](key, token) {
        if (token !== PRIVATE_TFHE_LIB_TOKEN) {
            throw new Error("Unauthorized");
        }
        if (!(key instanceof TfheCompactPkeCrsImpl)) {
            throw new Error("Unauthorized");
        }
        return __classPrivateFieldGet(key, _TfheCompactPkeCrsImpl_compactPublicKeyWasmType, "f");
    }
}
////////////////////////////////////////////////////////////////////////////////
// parseTFHEProvenCompactCiphertextList
////////////////////////////////////////////////////////////////////////////////
export async function parseTFHEProvenCompactCiphertextList(runtime, parameters) {
    await initTfheModule(runtime);
    const { ciphertextWithZkProof: ciphertextWithZKProof } = parameters;
    if (ciphertextWithZKProof == null) {
        throw new EncryptionError({
            message: `ciphertextWithZKProof argument is null or undefined.`,
        });
    }
    if (!(ciphertextWithZKProof instanceof Uint8Array) &&
        !isNonEmptyString(ciphertextWithZKProof)) {
        throw new EncryptionError({
            message: `Invalid ciphertextWithZKProof argument.`,
        });
    }
    const ciphertext = typeof ciphertextWithZKProof === "string"
        ? hexToBytesFaster(ciphertextWithZKProof, { strict: true })
        : ciphertextWithZKProof;
    let listWasm;
    try {
        listWasm = ProvenCompactCiphertextList.safe_deserialize(ciphertext, SERIALIZED_SIZE_LIMIT_CIPHERTEXT);
    }
    catch (e) {
        throw new EncryptionError({
            message: `Invalid ciphertextWithZKProof bytes. ${getErrorMessage(e)}.`,
        });
    }
    const fheTypeIds = [];
    try {
        const len = listWasm.len();
        for (let i = 0; i < len; ++i) {
            const v = listWasm.get_kind_of(i);
            if (!isFheTypeId(v)) {
                throw new EncryptionError({
                    message: `Invalid FheTypeId: ${v}`,
                });
            }
            fheTypeIds.push(v);
        }
        return {
            fheTypeIds,
            encryptionBits: fheTypeIds.map(encryptionBitsFromFheTypeId),
        };
    }
    finally {
        listWasm.free();
    }
}
////////////////////////////////////////////////////////////////////////////////
// buildWithProofPacked
////////////////////////////////////////////////////////////////////////////////
export async function buildWithProofPacked(runtime, parameters) {
    await initTfheModule(runtime);
    const { publicEncryptionParams, metaData, typedValues } = parameters;
    const tfheCompactPublicKeyImpl = publicEncryptionParams.publicKey;
    const tfheCompactPkeCrsImpl = publicEncryptionParams.crs;
    if (!(tfheCompactPublicKeyImpl instanceof TfheCompactPublicKeyImpl)) {
        throw new Error("Invalid tfhePublicKey");
    }
    if (!(tfheCompactPkeCrsImpl instanceof TfheCompactPkeCrsImpl)) {
        throw new Error("Invalid tfheCrs");
    }
    let tfheProvenCompactCiphertextList;
    let ciphertextWithZKProofBytes;
    let fheCompactCiphertextListBuilderWasm;
    try {
        const tfheCompactPublicKeyWasm = TfheCompactPublicKeyImpl[GET_NATIVE_FUNC](tfheCompactPublicKeyImpl, PRIVATE_TFHE_LIB_TOKEN);
        const compactPkeCrsWasm = TfheCompactPkeCrsImpl[GET_NATIVE_FUNC](tfheCompactPkeCrsImpl, PRIVATE_TFHE_LIB_TOKEN);
        fheCompactCiphertextListBuilderWasm = CompactCiphertextList.builder(tfheCompactPublicKeyWasm);
        for (const typedValue of typedValues) {
            switch (typedValue.type) {
                case "uint8":
                    fheCompactCiphertextListBuilderWasm.push_u8(typedValue.value);
                    break;
                case "uint16":
                    fheCompactCiphertextListBuilderWasm.push_u16(typedValue.value);
                    break;
                case "uint32":
                    fheCompactCiphertextListBuilderWasm.push_u32(typedValue.value);
                    break;
                case "uint64":
                    fheCompactCiphertextListBuilderWasm.push_u64(typedValue.value);
                    break;
                case "uint128":
                    fheCompactCiphertextListBuilderWasm.push_u128(typedValue.value);
                    break;
                case "uint256":
                    fheCompactCiphertextListBuilderWasm.push_u256(typedValue.value);
                    break;
                case "bool":
                    fheCompactCiphertextListBuilderWasm.push_boolean(typedValue.value);
                    break;
                case "address":
                    fheCompactCiphertextListBuilderWasm.push_u160(BigInt(typedValue.value));
                    break;
            }
        }
        tfheProvenCompactCiphertextList =
            fheCompactCiphertextListBuilderWasm.build_with_proof_packed(compactPkeCrsWasm, metaData, ZkComputeLoad.Verify);
        ciphertextWithZKProofBytes = tfheProvenCompactCiphertextList.safe_serialize(SERIALIZED_SIZE_LIMIT_CIPHERTEXT);
        return ciphertextWithZKProofBytes;
    }
    finally {
        try {
            if (tfheProvenCompactCiphertextList !== undefined) {
                tfheProvenCompactCiphertextList.free();
            }
        }
        catch {
            //
        }
        try {
            if (fheCompactCiphertextListBuilderWasm !== undefined) {
                fheCompactCiphertextListBuilderWasm.free();
            }
        }
        catch {
            //
        }
    }
}
////////////////////////////////////////////////////////////////////////////////
// serializeGlobalFhePkeParams
////////////////////////////////////////////////////////////////////////////////
export async function serializeGlobalFhePkeParams(runtime, parameters) {
    await initTfheModule(runtime);
    const { globalFhePkeParams: publicEncryptionParams } = parameters;
    const tfheCompactPublicKeyImpl = publicEncryptionParams.publicKey;
    const tfheCompactPkeCrsImpl = publicEncryptionParams.crs;
    if (!(tfheCompactPublicKeyImpl instanceof TfheCompactPublicKeyImpl)) {
        throw new Error("Invalid tfhePublicKey");
    }
    if (!(tfheCompactPkeCrsImpl instanceof TfheCompactPkeCrsImpl)) {
        throw new Error("Invalid tfheCrs");
    }
    const tfhePublicKeyBytes = TfheCompactPublicKeyImpl[GET_NATIVE_FUNC](tfheCompactPublicKeyImpl, PRIVATE_TFHE_LIB_TOKEN).safe_serialize(SERIALIZED_SIZE_LIMIT_PK);
    const tfheCrsBytes = TfheCompactPkeCrsImpl[GET_NATIVE_FUNC](tfheCompactPkeCrsImpl, PRIVATE_TFHE_LIB_TOKEN).safe_serialize(SERIALIZED_SIZE_LIMIT_CRS);
    return Object.freeze({
        publicKeyBytes: Object.freeze({
            id: publicEncryptionParams.publicKey.id,
            bytes: tfhePublicKeyBytes,
        }),
        crsBytes: Object.freeze({
            id: publicEncryptionParams.crs.id,
            capacity: publicEncryptionParams.crs.capacity,
            bytes: tfheCrsBytes,
        }),
    });
}
////////////////////////////////////////////////////////////////////////////////
// serializeTfhePublicKey
////////////////////////////////////////////////////////////////////////////////
export async function serializeGlobalFhePublicKey(runtime, parameters) {
    await initTfheModule(runtime);
    const { globalFhePublicKey: tfhePublicKey } = parameters;
    const tfheCompactPublicKeyImpl = tfhePublicKey;
    if (!(tfheCompactPublicKeyImpl instanceof TfheCompactPublicKeyImpl)) {
        throw new Error("Invalid tfhePublicKey");
    }
    const tfhePublicKeyBytes = TfheCompactPublicKeyImpl[GET_NATIVE_FUNC](tfheCompactPublicKeyImpl, PRIVATE_TFHE_LIB_TOKEN).safe_serialize(SERIALIZED_SIZE_LIMIT_PK);
    return Object.freeze({
        id: tfhePublicKey.id,
        bytes: tfhePublicKeyBytes,
    });
}
////////////////////////////////////////////////////////////////////////////////
// serializeGlobalFheCrs
////////////////////////////////////////////////////////////////////////////////
export async function serializeGlobalFheCrs(runtime, parameters) {
    await initTfheModule(runtime);
    const { globalFheCrs: tfheCrs } = parameters;
    const tfheCompactPkeCrsImpl = tfheCrs;
    if (!(tfheCompactPkeCrsImpl instanceof TfheCompactPkeCrsImpl)) {
        throw new Error("Invalid tfheCrs");
    }
    const tfheCrsBytes = TfheCompactPkeCrsImpl[GET_NATIVE_FUNC](tfheCompactPkeCrsImpl, PRIVATE_TFHE_LIB_TOKEN).safe_serialize(SERIALIZED_SIZE_LIMIT_CRS);
    return Object.freeze({
        id: tfheCrs.id,
        capacity: tfheCrs.capacity,
        bytes: tfheCrsBytes,
    });
}
////////////////////////////////////////////////////////////////////////////////
// deserializeGlobalFhePkeParams
////////////////////////////////////////////////////////////////////////////////
export async function deserializeGlobalFheCrs(runtime, parameters) {
    await initTfheModule(runtime);
    const { globalFheCrsBytes } = parameters;
    const compactPkeCrsWasm = CompactPkeCrs.safe_deserialize(globalFheCrsBytes.bytes, SERIALIZED_SIZE_LIMIT_CRS);
    return new TfheCompactPkeCrsImpl(PRIVATE_TFHE_LIB_TOKEN, globalFheCrsBytes.id, globalFheCrsBytes.capacity, compactPkeCrsWasm);
}
////////////////////////////////////////////////////////////////////////////////
// deserializeGlobalFhePkeParams
////////////////////////////////////////////////////////////////////////////////
export async function deserializeGlobalFhePublicKey(runtime, parameters) {
    await initTfheModule(runtime);
    const { globalFhePublicKeyBytes } = parameters;
    const tfheCompactPublicKeyWasm = TfheCompactPublicKey.safe_deserialize(globalFhePublicKeyBytes.bytes, SERIALIZED_SIZE_LIMIT_PK);
    return new TfheCompactPublicKeyImpl(PRIVATE_TFHE_LIB_TOKEN, globalFhePublicKeyBytes.id, tfheCompactPublicKeyWasm);
}
//# sourceMappingURL=api-p.js.map