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
var _TkmsPublicEncKeyMlKem512Impl_publicEncKeyMlKem512Wasm, _TkmsPublicEncKeyMlKem512Impl_bytesHex, _TkmsPrivateEncKeyMlKem512Impl_privateEncKeyMlKem512Wasm, _TkmsPrivateEncKeyMlKem512Impl_publicKey;
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTkmsPrivateKey = generateTkmsPrivateKey;
exports.decryptAndReconstruct = decryptAndReconstruct;
exports.getTkmsPublicKeyHex = getTkmsPublicKeyHex;
exports.serializeTkmsPrivateKey = serializeTkmsPrivateKey;
exports.deserializeTkmsPrivateKey = deserializeTkmsPrivateKey;
exports.verifyTkmsPrivateKey = verifyTkmsPrivateKey;
const bytes_js_1 = require("../../../base/bytes.js");
const KmsSigncryptedShares_p_js_1 = require("../../../kms/KmsSigncryptedShares-p.js");
const uint_js_1 = require("../../../base/uint.js");
const DecryptedFhevmHandle_js_1 = require("../../../handle/DecryptedFhevmHandle.js");
const FheType_js_1 = require("../../../handle/FheType.js");
const string_js_1 = require("../../../base/string.js");
const kms_lib_js_1 = require("../../../../wasm/tkms/kms_lib.js");
const init_p_js_1 = require("./init-p.js");
const GET_NATIVE_FUNC = Symbol("TKMSLib.getNative");
const PRIVATE_TKMS_LIB_TOKEN = Symbol("TKMSLib.token");
const GET_PUBLIC_KEY_FUNC = Symbol("TkmsPrivateEncKeyMlKem512.getPublicKey");
const GET_BYTES_HEX_FUNC = Symbol("TkmsPublicEncKeyMlKem512Impl.getBytesHexNo0x");
function verifyToken(token) {
    if (token !== PRIVATE_TKMS_LIB_TOKEN) {
        throw new Error("Unauthorized");
    }
}
class TkmsPublicEncKeyMlKem512Impl {
    constructor(token, publicEncKeyMlKem512Wasm) {
        _TkmsPublicEncKeyMlKem512Impl_publicEncKeyMlKem512Wasm.set(this, void 0);
        _TkmsPublicEncKeyMlKem512Impl_bytesHex.set(this, void 0);
        verifyToken(token);
        __classPrivateFieldSet(this, _TkmsPublicEncKeyMlKem512Impl_publicEncKeyMlKem512Wasm, publicEncKeyMlKem512Wasm, "f");
    }
    static [(_TkmsPublicEncKeyMlKem512Impl_publicEncKeyMlKem512Wasm = new WeakMap(), _TkmsPublicEncKeyMlKem512Impl_bytesHex = new WeakMap(), GET_NATIVE_FUNC)](key, token) {
        verifyToken(token);
        if (!(key instanceof TkmsPublicEncKeyMlKem512Impl)) {
            throw new Error("Unauthorized");
        }
        return __classPrivateFieldGet(key, _TkmsPublicEncKeyMlKem512Impl_publicEncKeyMlKem512Wasm, "f");
    }
    static [GET_BYTES_HEX_FUNC](key, token) {
        verifyToken(token);
        if (!(key instanceof TkmsPublicEncKeyMlKem512Impl)) {
            throw new Error("Unauthorized");
        }
        if (__classPrivateFieldGet(key, _TkmsPublicEncKeyMlKem512Impl_bytesHex, "f") === undefined) {
            const bytes = (0, kms_lib_js_1.ml_kem_pke_pk_to_u8vec)(__classPrivateFieldGet(key, _TkmsPublicEncKeyMlKem512Impl_publicEncKeyMlKem512Wasm, "f"));
            __classPrivateFieldSet(key, _TkmsPublicEncKeyMlKem512Impl_bytesHex, (0, bytes_js_1.bytesToHexLarge)(bytes, false), "f");
        }
        return __classPrivateFieldGet(key, _TkmsPublicEncKeyMlKem512Impl_bytesHex, "f");
    }
}
class TkmsPrivateEncKeyMlKem512Impl {
    constructor(token, privateEncKeyMlKem512Wasm) {
        _TkmsPrivateEncKeyMlKem512Impl_privateEncKeyMlKem512Wasm.set(this, void 0);
        _TkmsPrivateEncKeyMlKem512Impl_publicKey.set(this, void 0);
        verifyToken(token);
        __classPrivateFieldSet(this, _TkmsPrivateEncKeyMlKem512Impl_privateEncKeyMlKem512Wasm, privateEncKeyMlKem512Wasm, "f");
    }
    static [(_TkmsPrivateEncKeyMlKem512Impl_privateEncKeyMlKem512Wasm = new WeakMap(), _TkmsPrivateEncKeyMlKem512Impl_publicKey = new WeakMap(), GET_NATIVE_FUNC)](key, token) {
        verifyToken(token);
        if (!(key instanceof TkmsPrivateEncKeyMlKem512Impl)) {
            throw new Error("Unauthorized");
        }
        return __classPrivateFieldGet(key, _TkmsPrivateEncKeyMlKem512Impl_privateEncKeyMlKem512Wasm, "f");
    }
    static [GET_PUBLIC_KEY_FUNC](key, token) {
        verifyToken(token);
        if (!(key instanceof TkmsPrivateEncKeyMlKem512Impl)) {
            throw new Error("Unauthorized");
        }
        if (__classPrivateFieldGet(key, _TkmsPrivateEncKeyMlKem512Impl_publicKey, "f") === undefined) {
            const publicEncKeyMlKem512Wasm = (0, kms_lib_js_1.ml_kem_pke_get_pk)(__classPrivateFieldGet(key, _TkmsPrivateEncKeyMlKem512Impl_privateEncKeyMlKem512Wasm, "f"));
            __classPrivateFieldSet(key, _TkmsPrivateEncKeyMlKem512Impl_publicKey, new TkmsPublicEncKeyMlKem512Impl(token, publicEncKeyMlKem512Wasm), "f");
        }
        return __classPrivateFieldGet(key, _TkmsPrivateEncKeyMlKem512Impl_publicKey, "f");
    }
}
async function generateTkmsPrivateKey(runtime) {
    await (0, init_p_js_1.initTkmsModule)(runtime);
    const privateEncKeyMlKem512Wasm = (0, kms_lib_js_1.ml_kem_pke_keygen)();
    return new TkmsPrivateEncKeyMlKem512Impl(PRIVATE_TKMS_LIB_TOKEN, privateEncKeyMlKem512Wasm);
}
async function decryptAndReconstruct(runtime, parameters) {
    await (0, init_p_js_1.initTkmsModule)(runtime);
    const { tkmsPrivateKey, shares } = parameters;
    if (!(tkmsPrivateKey instanceof TkmsPrivateEncKeyMlKem512Impl)) {
        throw new Error("Invalid tkmsPrivateKey");
    }
    const tkmsPublicKey = TkmsPrivateEncKeyMlKem512Impl[GET_PUBLIC_KEY_FUNC](tkmsPrivateKey, PRIVATE_TKMS_LIB_TOKEN);
    const metadata = (0, KmsSigncryptedShares_p_js_1.getMetadata)(shares);
    const sharesArray = (0, KmsSigncryptedShares_p_js_1.getShares)(shares);
    const privateEncKeyMlKem512Wasm = TkmsPrivateEncKeyMlKem512Impl[GET_NATIVE_FUNC](tkmsPrivateKey, PRIVATE_TKMS_LIB_TOKEN);
    const publicEncKeyMlKem512Wasm = TkmsPublicEncKeyMlKem512Impl[GET_NATIVE_FUNC](tkmsPublicKey, PRIVATE_TKMS_LIB_TOKEN);
    const publicEncKeyMlKem512WasmBytesHex = TkmsPublicEncKeyMlKem512Impl[GET_BYTES_HEX_FUNC](tkmsPublicKey, PRIVATE_TKMS_LIB_TOKEN);
    const kmsEIP712Domain = metadata.eip712Domain;
    const clientAddress = metadata.eip712SignerAddress;
    const kmsEIP712DomainWasmArg = {
        name: kmsEIP712Domain.name,
        version: kmsEIP712Domain.version,
        chain_id: (0, uint_js_1.uint32ToBytes32)(kmsEIP712Domain.chainId),
        verifying_contract: kmsEIP712Domain.verifyingContract,
        salt: null,
    };
    const indexedServerAddressesWasm = metadata.kmsSignersContext.signers.map((kmsSigner, index) => {
        const kmsSignerPartyId = index + 1;
        return (0, kms_lib_js_1.new_server_id_addr)(kmsSignerPartyId, kmsSigner);
    });
    const clientWasm = (0, kms_lib_js_1.new_client)(indexedServerAddressesWasm, clientAddress, "default");
    const requestWasmArg = {
        signature: (0, string_js_1.remove0x)(metadata.eip712Signature),
        client_address: clientAddress,
        enc_key: (0, string_js_1.remove0x)(publicEncKeyMlKem512WasmBytesHex),
        ciphertext_handles: metadata.fhevmHandles.map((h) => h.bytes32HexNo0x),
        eip712_verifying_contract: metadata.eip712Domain.verifyingContract,
    };
    const typedPlaintextArray = (0, kms_lib_js_1.process_user_decryption_resp_from_js)(clientWasm, requestWasmArg, kmsEIP712DomainWasmArg, sharesArray, publicEncKeyMlKem512Wasm, privateEncKeyMlKem512Wasm, true);
    const orderedDecryptedFhevmHandles = typedPlaintextArray.map((typedPlaintext, idx) => {
        const fhevmHandle = metadata.fhevmHandles[idx];
        if (fhevmHandle === undefined) {
            throw new Error("Internal error");
        }
        if (typedPlaintext.fhe_type !== fhevmHandle.fheTypeId) {
            throw new Error("Internal error");
        }
        return (0, DecryptedFhevmHandle_js_1.createDecryptedFhevmHandle)(fhevmHandle, (0, FheType_js_1.bytesToFheDecryptedValue)(fhevmHandle.fheType, typedPlaintext.bytes), PRIVATE_TKMS_LIB_TOKEN);
    });
    Object.freeze(orderedDecryptedFhevmHandles);
    return orderedDecryptedFhevmHandles;
}
async function getTkmsPublicKeyHex(runtime, parameters) {
    await (0, init_p_js_1.initTkmsModule)(runtime);
    const { tkmsPrivateKey } = parameters;
    if (!(tkmsPrivateKey instanceof TkmsPrivateEncKeyMlKem512Impl)) {
        throw new Error("Invalid tkmsPrivateKey");
    }
    const publicKey = TkmsPrivateEncKeyMlKem512Impl[GET_PUBLIC_KEY_FUNC](tkmsPrivateKey, PRIVATE_TKMS_LIB_TOKEN);
    return TkmsPublicEncKeyMlKem512Impl[GET_BYTES_HEX_FUNC](publicKey, PRIVATE_TKMS_LIB_TOKEN);
}
async function serializeTkmsPrivateKey(runtime, parameters) {
    await (0, init_p_js_1.initTkmsModule)(runtime);
    const { tkmsPrivateKey } = parameters;
    if (!(tkmsPrivateKey instanceof TkmsPrivateEncKeyMlKem512Impl)) {
        throw new Error("Invalid tkmsPrivateKey");
    }
    const privateEncKeyMlKem512Wasm = TkmsPrivateEncKeyMlKem512Impl[GET_NATIVE_FUNC](tkmsPrivateKey, PRIVATE_TKMS_LIB_TOKEN);
    return (0, kms_lib_js_1.ml_kem_pke_sk_to_u8vec)(privateEncKeyMlKem512Wasm);
}
async function deserializeTkmsPrivateKey(runtime, parameters) {
    await (0, init_p_js_1.initTkmsModule)(runtime);
    const { tkmsPrivateKeyBytes } = parameters;
    const privateEncKeyMlKem512Wasm = (0, kms_lib_js_1.u8vec_to_ml_kem_pke_sk)(tkmsPrivateKeyBytes);
    return new TkmsPrivateEncKeyMlKem512Impl(PRIVATE_TKMS_LIB_TOKEN, privateEncKeyMlKem512Wasm);
}
function verifyTkmsPrivateKey(_runtime, parameters) {
    if (!(parameters.tkmsPrivateKey instanceof TkmsPrivateEncKeyMlKem512Impl)) {
        throw new Error("Invalid TkmsPrivateKey");
    }
}
//# sourceMappingURL=api-p.js.map