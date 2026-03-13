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
import { assertIsChecksummedAddress, checksummedAddressToBytes20, } from "../base/address.js";
import { bytes32ToHex, bytesToHexLarge, concatBytes, hexToBytes32, toBytes, } from "../base/bytes.js";
import { assertIsUint64, assertIsUint8, asUint64BigInt, uint64ToBytes32, } from "../base/uint.js";
import { ZkProofError } from "../errors/ZkProofError.js";
import { assertIsEncryptionBitsArray, fheTypeIdFromEncryptionBits, } from "../handle/FheType.js";
import { buildFhevmHandle } from "../handle/FhevmHandle.js";
import { keccak_256 } from "@noble/hashes/sha3.js";
import { InvalidTypeError } from "../base/errors/InvalidTypeError.js";
////////////////////////////////////////////////////////////////////////////////
const PRIVATE_TOKEN = Symbol("ZkProof.token");
const GET_UNSAFE_RAW_BYTES_FUNC = Symbol("ZkProof.getUnsafeRawBytes");
////////////////////////////////////////////////////////////////////////////////
// ZkProof
////////////////////////////////////////////////////////////////////////////////
export const FHEVM_HANDLE_RAW_CT_HASH_DOMAIN_SEPARATOR = "ZK-w_rct";
export const FHEVM_HANDLE_HASH_DOMAIN_SEPARATOR = "ZK-w_hdl";
class ZkProofImpl {
    constructor(privateToken, params) {
        _ZkProofImpl_chainId.set(this, void 0);
        _ZkProofImpl_aclContractAddress.set(this, void 0);
        _ZkProofImpl_contractAddress.set(this, void 0);
        _ZkProofImpl_userAddress.set(this, void 0);
        _ZkProofImpl_ciphertextWithZkProof.set(this, void 0); // Never empty
        _ZkProofImpl_encryptionBits.set(this, void 0); // Can be empty
        _ZkProofImpl_fheTypeIds.set(this, void 0); // Can be empty
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
        __classPrivateFieldSet(this, _ZkProofImpl_fheTypeIds, Object.freeze(__classPrivateFieldGet(this, _ZkProofImpl_encryptionBits, "f").map(fheTypeIdFromEncryptionBits)), "f");
        Object.freeze(this);
    }
    //////////////////////////////////////////////////////////////////////////////
    // Instance Getters
    //////////////////////////////////////////////////////////////////////////////
    /** The chain ID where this proof is valid. */
    get chainId() {
        return __classPrivateFieldGet(this, _ZkProofImpl_chainId, "f");
    }
    /** The ACL contract address associated with this proof. */
    get aclContractAddress() {
        return __classPrivateFieldGet(this, _ZkProofImpl_aclContractAddress, "f");
    }
    /** The target contract address associated with this proof. */
    get contractAddress() {
        return __classPrivateFieldGet(this, _ZkProofImpl_contractAddress, "f");
    }
    /** The user address associated with this proof. */
    get userAddress() {
        return __classPrivateFieldGet(this, _ZkProofImpl_userAddress, "f");
    }
    /** The ciphertext with Zk proof (guaranteed non-empty). Returns a copy. */
    get ciphertextWithZkProof() {
        return new Uint8Array(__classPrivateFieldGet(this, _ZkProofImpl_ciphertextWithZkProof, "f"));
    }
    /** The encryption bit sizes for each encrypted value in the proof. */
    get encryptionBits() {
        return __classPrivateFieldGet(this, _ZkProofImpl_encryptionBits, "f");
    }
    /** The FHE type IDs corresponding to each encrypted value. */
    get fheTypeIds() {
        return __classPrivateFieldGet(this, _ZkProofImpl_fheTypeIds, "f");
    }
    /**
     * Returns the raw internal bytes without copying.
     * WARNING: Do not mutate the returned array - this would violate immutability.
     * Use `ciphertextWithZkProof` getter if you need a safe copy.
     */
    [(_ZkProofImpl_chainId = new WeakMap(), _ZkProofImpl_aclContractAddress = new WeakMap(), _ZkProofImpl_contractAddress = new WeakMap(), _ZkProofImpl_userAddress = new WeakMap(), _ZkProofImpl_ciphertextWithZkProof = new WeakMap(), _ZkProofImpl_encryptionBits = new WeakMap(), _ZkProofImpl_fheTypeIds = new WeakMap(), _ZkProofImpl_fhevmHandles = new WeakMap(), GET_UNSAFE_RAW_BYTES_FUNC)](token) {
        if (token !== PRIVATE_TOKEN) {
            throw new Error("Unauthorized");
        }
        return __classPrivateFieldGet(this, _ZkProofImpl_ciphertextWithZkProof, "f");
    }
    /**
     * Returns a safe string representation for debugging.
     * Does not expose ciphertext content - only metadata.
     */
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
    //////////////////////////////////////////////////////////////////////////////
    // JSON
    //////////////////////////////////////////////////////////////////////////////
    /**
     * Serializes the ZkProof to a JSON-compatible object.
     * Ciphertext is hex-encoded, chainId is converted to number if safe.
     * @returns A plain object suitable for JSON.stringify.
     */
    toJson() {
        return {
            chainId: __classPrivateFieldGet(this, _ZkProofImpl_chainId, "f") <= Number.MAX_SAFE_INTEGER
                ? Number(__classPrivateFieldGet(this, _ZkProofImpl_chainId, "f"))
                : __classPrivateFieldGet(this, _ZkProofImpl_chainId, "f"),
            aclContractAddress: __classPrivateFieldGet(this, _ZkProofImpl_aclContractAddress, "f"),
            contractAddress: __classPrivateFieldGet(this, _ZkProofImpl_contractAddress, "f"),
            userAddress: __classPrivateFieldGet(this, _ZkProofImpl_userAddress, "f"),
            ciphertextWithZkProof: bytesToHexLarge(__classPrivateFieldGet(this, _ZkProofImpl_ciphertextWithZkProof, "f")),
            encryptionBits: __classPrivateFieldGet(this, _ZkProofImpl_encryptionBits, "f"),
            fheTypeIds: __classPrivateFieldGet(this, _ZkProofImpl_fheTypeIds, "f"),
        };
    }
}
////////////////////////////////////////////////////////////////////////////////
// Freeze
////////////////////////////////////////////////////////////////////////////////
Object.freeze(ZkProofImpl);
Object.freeze(ZkProofImpl.prototype);
////////////////////////////////////////////////////////////////////////////////
// Public API: createZkProof
////////////////////////////////////////////////////////////////////////////////
export function isZkProof(value) {
    return value instanceof ZkProofImpl;
}
export function assertIsZkProof(value, options) {
    if (!isZkProof(value)) {
        throw new InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "ZkProof",
        }, options);
    }
}
/**
 * @internal
 * Creates a ZkProof from loose input types.
 * Validates and normalizes all fields.
 *
 * If `ciphertextWithZkProof` is a hex string, it will be converted to a new Uint8Array.
 * If it is already a Uint8Array:
 * - By default, a defensive copy is made, allowing the caller to retain the original.
 * - With `noCopy: true`, the instance takes ownership — callers must not mutate it afterward.
 * @param zkProofLike - The loose input to validate and normalize (see {@link ZkProofLike}).
 * @param options - Optional settings. Set `options.copy` to `false` to skip copying the
 *   `ciphertextWithZkProof` Uint8Array (takes ownership). Defaults to `true` (copy by default).
 * @throws A {@link ZkProofError} if ciphertextWithZkProof is invalid or empty.
 * @throws A {@link InvalidTypeError} if any field fails validation.
 */
export async function toZkProof(zkProofLike, options) {
    if (zkProofLike instanceof ZkProofImpl) {
        return zkProofLike;
    }
    // Validate arguments
    assertIsUint64(zkProofLike.chainId, {});
    const chainId = BigInt(zkProofLike.chainId);
    assertIsChecksummedAddress(zkProofLike.aclContractAddress, {});
    assertIsChecksummedAddress(zkProofLike.contractAddress, {});
    assertIsChecksummedAddress(zkProofLike.userAddress, {});
    // Validate and normalize ciphertextWithZkProof
    const ciphertextWithZkProof = toBytes(zkProofLike.ciphertextWithZkProof, {
        subject: "ciphertextWithZkProof",
        copy: options?.copy !== false,
    });
    if (ciphertextWithZkProof.length === 0) {
        throw new ZkProofError({
            message: "ciphertextWithZkProof argument should not be empty",
        });
    }
    // Validation of packed variable count and total bits is handled by
    // parseTFHEProvenCompactCiphertextList, which deserializes and validates
    // the ciphertext structure via the TFHE WASM module.
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
////////////////////////////////////////////////////////////////////////////////
// Public API: zkProofToFhevmHandles
////////////////////////////////////////////////////////////////////////////////
export async function zkProofToFhevmHandles(zkProofLike, options) {
    if (zkProofLike instanceof ZkProofImpl) {
        return zkProofLike.getFhevmHandles();
    }
    assertIsChecksummedAddress(zkProofLike.aclContractAddress, {
        subject: "aclContractAddress",
    });
    const encryptionBits = await _getOrParseEncryptionBits(zkProofLike.encryptionBits, zkProofLike.ciphertextWithZkProof, options?.zkProofParser);
    const ciphertextWithZkProof = toBytes(zkProofLike.ciphertextWithZkProof, {
        subject: "ciphertextWithZkProof",
    });
    const fheTypeIds = encryptionBits.map((w) => fheTypeIdFromEncryptionBits(w));
    assertIsUint8(fheTypeIds.length, {});
    return _zkProofToFhevmHandles({
        ciphertextWithZkProof: ciphertextWithZkProof,
        aclContractAddress: zkProofLike.aclContractAddress,
        fheTypeIds,
        chainId: asUint64BigInt(zkProofLike.chainId, { subject: "chainId" }),
    });
}
////////////////////////////////////////////////////////////////////////////////
// Private Helpers
////////////////////////////////////////////////////////////////////////////////
/**
 * Asserts that two encryption bits arrays are equal (same length and values).
 * @param actual - The actual encryption bits array.
 * @param expected - The expected encryption bits array.
 * @throws ZkProofError if there's a count or type mismatch.
 */
function _assertEncryptionBitsMatch(actual, expected) {
    if (actual.length !== expected.length) {
        throw new ZkProofError({
            message: `Encryption count mismatch, expected ${expected.length}, got ${actual.length}.`,
        });
    }
    for (let i = 0; i < actual.length; ++i) {
        if (actual[i] !== expected[i]) {
            throw new ZkProofError({
                message: `Encryption type mismatch at index ${i}.`,
            });
        }
    }
}
////////////////////////////////////////////////////////////////////////////////
function _zkProofToFhevmHandles(args, options) {
    const encoder = new TextEncoder();
    const domainSepBytes = encoder.encode(FHEVM_HANDLE_RAW_CT_HASH_DOMAIN_SEPARATOR);
    const blobHashBytes32Hex = bytes32ToHex(keccak_256(concatBytes(domainSepBytes, args.ciphertextWithZkProof)));
    const handles = [];
    for (const [i, fheTypeId] of args.fheTypeIds.entries()) {
        const hash21 = _computeInputHash21(hexToBytes32(blobHashBytes32Hex), args.aclContractAddress, args.chainId, i);
        handles.push(buildFhevmHandle({
            hash21,
            chainId: args.chainId,
            fheTypeId,
            ...(options?.version !== undefined ? { version: options.version } : {}),
            index: i,
        }));
    }
    return handles;
}
////////////////////////////////////////////////////////////////////////////////
/**
 * Returns the encryption bits from a ZkProofLike.
 * If `encryptionBits` is provided, validates and returns it.
 * Otherwise, parses the ciphertext to extract the encryption bits.
 */
async function _getOrParseEncryptionBits(encryptionBits, ciphertextWithZkProof, zkProofParser) {
    // Case 1: encryptionBits provided — validate, and verify against parsed if possible
    if (encryptionBits != null) {
        assertIsEncryptionBitsArray(encryptionBits, {
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
    // Case 2: encryptionBits not provided — extract if parse function available
    if (zkProofParser != null) {
        const parsed = await zkProofParser.parseTFHEProvenCompactCiphertextList({
            ciphertextWithZkProof: ciphertextWithZkProof,
        });
        return parsed.encryptionBits;
    }
    // Case 3: no encryptionBits and no way to extract them
    throw new ZkProofError({ message: "Missing encryption bits" });
}
////////////////////////////////////////////////////////////////////////////////
/**
 * Computes the 21-byte handle hash for an encrypted input.
 *
 * handle_hash = "ZK-w_hdl" (8 bytes) + blobHash (32 bytes) + index (1 byte) + aclAddress (20 bytes) + chainId (32 bytes)
 *
 * Reference implementation (Rust):
 * ```rust
 * const HANDLE_HASH_DOMAIN_SEPARATOR: [u8; 8] = *b"ZK-w_hdl";
 *
 * let mut handle_hash = Keccak256::new();
 * handle_hash.update(HANDLE_HASH_DOMAIN_SEPARATOR);
 * handle_hash.update(blob_hash);
 * handle_hash.update([ct_idx as u8]);
 * handle_hash.update(
 *     Address::from_str(&aux_data.acl_contract_address)
 *         .expect("valid acl_contract_address")
 *         .into_array(),
 * );
 * handle_hash.update(chain_id_bytes);
 * let mut handle = handle_hash.finalize().to_vec();
 * assert_eq!(handle.len(), 32);
 * ```
 *
 * @see https://github.com/zama-ai/fhevm/blob/8ffbd5906ab3d57af178e049930e3fc065c9d4b3/coprocessor/fhevm-engine/zkproof-worker/src/verifier.rs#L431
 * @internal
 */
function _computeInputHash21(blobHashBytes32, aclAddress, chainId, index) {
    const encryptionIndexByte1 = new Uint8Array([index]);
    const aclContractAddressBytes20 = checksummedAddressToBytes20(aclAddress);
    const chainIdBytes32 = uint64ToBytes32(chainId);
    const encoder = new TextEncoder();
    const domainSepBytes = encoder.encode(FHEVM_HANDLE_HASH_DOMAIN_SEPARATOR);
    const hashBytes32Hex = bytes32ToHex(keccak_256(concatBytes(domainSepBytes, blobHashBytes32, encryptionIndexByte1, aclContractAddressBytes20, chainIdBytes32)));
    // Truncate to 21 bytes (0x + 42 hex chars)
    return hashBytes32Hex.slice(0, 2 + 2 * 21);
}
/**
 * @internal
 */
export function zkProofGetUnsafeRawBytes(zkProof) {
    if (!(zkProof instanceof ZkProofImpl)) {
        throw new Error("Unauthorized");
    }
    return zkProof[GET_UNSAFE_RAW_BYTES_FUNC](PRIVATE_TOKEN);
}
//# sourceMappingURL=ZkProof-p.js.map