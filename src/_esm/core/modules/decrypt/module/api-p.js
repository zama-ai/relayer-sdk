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
import { bytesToHexLarge } from "../../../base/bytes.js";
import { getMetadata, getShares } from "../../../kms/KmsSigncryptedShares-p.js";
import { uint32ToBytes32 } from "../../../base/uint.js";
import { createDecryptedFhevmHandle } from "../../../handle/DecryptedFhevmHandle.js";
import { bytesToFheDecryptedValue } from "../../../handle/FheType.js";
import { remove0x } from "../../../base/string.js";
import { ml_kem_pke_keygen, ml_kem_pke_get_pk, ml_kem_pke_pk_to_u8vec, new_server_id_addr, new_client, process_user_decryption_resp_from_js, ml_kem_pke_sk_to_u8vec, u8vec_to_ml_kem_pke_sk, } from "../../../../wasm/tkms/kms_lib.js";
import { initTkmsModule } from "./init-p.js";
////////////////////////////////////////////////////////////////////////////////
const GET_NATIVE_FUNC = Symbol("TKMSLib.getNative");
const PRIVATE_TKMS_LIB_TOKEN = Symbol("TKMSLib.token");
const GET_PUBLIC_KEY_FUNC = Symbol("TkmsPrivateEncKeyMlKem512.getPublicKey");
const GET_BYTES_HEX_FUNC = Symbol("TkmsPublicEncKeyMlKem512Impl.getBytesHexNo0x");
function verifyToken(token) {
    if (token !== PRIVATE_TKMS_LIB_TOKEN) {
        throw new Error("Unauthorized");
    }
}
////////////////////////////////////////////////////////////////////////////////
// TkmsPublicEncKeyMlKem512Impl
////////////////////////////////////////////////////////////////////////////////
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
            const bytes = ml_kem_pke_pk_to_u8vec(__classPrivateFieldGet(key, _TkmsPublicEncKeyMlKem512Impl_publicEncKeyMlKem512Wasm, "f"));
            __classPrivateFieldSet(key, _TkmsPublicEncKeyMlKem512Impl_bytesHex, bytesToHexLarge(bytes, false /* no 0x */), "f");
        }
        return __classPrivateFieldGet(key, _TkmsPublicEncKeyMlKem512Impl_bytesHex, "f");
    }
}
////////////////////////////////////////////////////////////////////////////////
// TkmsPrivateEncKeyMlKem512Impl
////////////////////////////////////////////////////////////////////////////////
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
            const publicEncKeyMlKem512Wasm = ml_kem_pke_get_pk(__classPrivateFieldGet(key, _TkmsPrivateEncKeyMlKem512Impl_privateEncKeyMlKem512Wasm, "f"));
            __classPrivateFieldSet(key, _TkmsPrivateEncKeyMlKem512Impl_publicKey, new TkmsPublicEncKeyMlKem512Impl(token, publicEncKeyMlKem512Wasm), "f");
        }
        return __classPrivateFieldGet(key, _TkmsPrivateEncKeyMlKem512Impl_publicKey, "f");
    }
}
//////////////////////////////////////////////////////////////////////////////
// generateTkmsPrivateKey
//////////////////////////////////////////////////////////////////////////////
export async function generateTkmsPrivateKey(runtime) {
    await initTkmsModule(runtime);
    const privateEncKeyMlKem512Wasm = ml_kem_pke_keygen();
    return new TkmsPrivateEncKeyMlKem512Impl(PRIVATE_TKMS_LIB_TOKEN, privateEncKeyMlKem512Wasm);
}
////////////////////////////////////////////////////////////////////////////////
// decryptAndReconstruct
////////////////////////////////////////////////////////////////////////////////
export async function decryptAndReconstruct(runtime, parameters) {
    await initTkmsModule(runtime);
    const { tkmsPrivateKey, shares } = parameters;
    if (!(tkmsPrivateKey instanceof TkmsPrivateEncKeyMlKem512Impl)) {
        throw new Error("Invalid tkmsPrivateKey");
    }
    const tkmsPublicKey = TkmsPrivateEncKeyMlKem512Impl[GET_PUBLIC_KEY_FUNC](tkmsPrivateKey, PRIVATE_TKMS_LIB_TOKEN);
    const metadata = getMetadata(shares);
    const sharesArray = getShares(shares);
    const privateEncKeyMlKem512Wasm = TkmsPrivateEncKeyMlKem512Impl[GET_NATIVE_FUNC](tkmsPrivateKey, PRIVATE_TKMS_LIB_TOKEN);
    const publicEncKeyMlKem512Wasm = TkmsPublicEncKeyMlKem512Impl[GET_NATIVE_FUNC](tkmsPublicKey, PRIVATE_TKMS_LIB_TOKEN);
    const publicEncKeyMlKem512WasmBytesHex = TkmsPublicEncKeyMlKem512Impl[GET_BYTES_HEX_FUNC](tkmsPublicKey, PRIVATE_TKMS_LIB_TOKEN);
    // KmsEIP712Domain
    const kmsEIP712Domain = metadata.eip712Domain;
    const clientAddress = metadata.eip712SignerAddress;
    // To be modified! use uint64ToBytes32 instead
    const kmsEIP712DomainWasmArg = {
        name: kmsEIP712Domain.name,
        version: kmsEIP712Domain.version,
        chain_id: uint32ToBytes32(kmsEIP712Domain.chainId),
        verifying_contract: kmsEIP712Domain.verifyingContract,
        salt: null,
    };
    //////////////////////////////////////////////////////////////////////////////
    // Important:
    // assume the KMS Signers have the correct order
    //////////////////////////////////////////////////////////////////////////////
    const indexedServerAddressesWasm = metadata.kmsSignersContext.signers.map((kmsSigner, index) => {
        const kmsSignerPartyId = index + 1;
        return new_server_id_addr(kmsSignerPartyId, kmsSigner);
    });
    const clientWasm = new_client(indexedServerAddressesWasm, clientAddress, "default");
    const requestWasmArg = {
        signature: remove0x(metadata.eip712Signature),
        client_address: clientAddress,
        enc_key: remove0x(publicEncKeyMlKem512WasmBytesHex),
        ciphertext_handles: metadata.fhevmHandles.map((h) => h.bytes32HexNo0x),
        eip712_verifying_contract: metadata.eip712Domain.verifyingContract,
    };
    // 1. Call kms module to decrypt & reconstruct clear values
    const typedPlaintextArray = process_user_decryption_resp_from_js(clientWasm, // client argument
    requestWasmArg, // request argument
    kmsEIP712DomainWasmArg, // eip712_domain argument
    sharesArray, // agg_resp argument
    publicEncKeyMlKem512Wasm, // enc_pk argument
    privateEncKeyMlKem512Wasm, // enc_sk argument
    true);
    // 2. Build an unforgeable structure that contains the decrypted FhevmHandles
    const orderedDecryptedFhevmHandles = typedPlaintextArray.map((typedPlaintext, idx) => {
        const fhevmHandle = metadata.fhevmHandles[idx];
        if (fhevmHandle === undefined) {
            throw new Error("Internal error");
        }
        if (typedPlaintext.fhe_type !== fhevmHandle.fheTypeId) {
            throw new Error("Internal error");
        }
        return createDecryptedFhevmHandle(fhevmHandle, bytesToFheDecryptedValue(fhevmHandle.fheType, typedPlaintext.bytes), PRIVATE_TKMS_LIB_TOKEN);
    });
    Object.freeze(orderedDecryptedFhevmHandles);
    return orderedDecryptedFhevmHandles;
}
//////////////////////////////////////////////////////////////////////////////
// getTkmsPublicKeyHex
//////////////////////////////////////////////////////////////////////////////
export async function getTkmsPublicKeyHex(runtime, parameters) {
    await initTkmsModule(runtime);
    const { tkmsPrivateKey } = parameters;
    if (!(tkmsPrivateKey instanceof TkmsPrivateEncKeyMlKem512Impl)) {
        throw new Error("Invalid tkmsPrivateKey");
    }
    const publicKey = TkmsPrivateEncKeyMlKem512Impl[GET_PUBLIC_KEY_FUNC](tkmsPrivateKey, PRIVATE_TKMS_LIB_TOKEN);
    return TkmsPublicEncKeyMlKem512Impl[GET_BYTES_HEX_FUNC](publicKey, PRIVATE_TKMS_LIB_TOKEN);
}
//////////////////////////////////////////////////////////////////////////////
// serializeTkmsPrivateKey
//////////////////////////////////////////////////////////////////////////////
export async function serializeTkmsPrivateKey(runtime, parameters) {
    await initTkmsModule(runtime);
    const { tkmsPrivateKey } = parameters;
    if (!(tkmsPrivateKey instanceof TkmsPrivateEncKeyMlKem512Impl)) {
        throw new Error("Invalid tkmsPrivateKey");
    }
    const privateEncKeyMlKem512Wasm = TkmsPrivateEncKeyMlKem512Impl[GET_NATIVE_FUNC](tkmsPrivateKey, PRIVATE_TKMS_LIB_TOKEN);
    return ml_kem_pke_sk_to_u8vec(privateEncKeyMlKem512Wasm);
}
//////////////////////////////////////////////////////////////////////////////
// deserializeTkmsPrivateKey
//////////////////////////////////////////////////////////////////////////////
export async function deserializeTkmsPrivateKey(runtime, parameters) {
    await initTkmsModule(runtime);
    const { tkmsPrivateKeyBytes } = parameters;
    const privateEncKeyMlKem512Wasm = u8vec_to_ml_kem_pke_sk(tkmsPrivateKeyBytes);
    return new TkmsPrivateEncKeyMlKem512Impl(PRIVATE_TKMS_LIB_TOKEN, privateEncKeyMlKem512Wasm);
}
//////////////////////////////////////////////////////////////////////////////
// verifyTkmsPrivateKey
//////////////////////////////////////////////////////////////////////////////
export function verifyTkmsPrivateKey(_runtime, parameters) {
    if (!(parameters.tkmsPrivateKey instanceof TkmsPrivateEncKeyMlKem512Impl)) {
        throw new Error("Invalid TkmsPrivateKey");
    }
}
//# sourceMappingURL=api-p.js.map