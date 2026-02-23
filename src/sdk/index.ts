import { TFHE as TFHEModule, TKMS as TKMSModule } from './wasm-modules';
import type {
  Bytes,
  BytesHex,
  ChecksummedAddress,
  UintNumber,
} from '@base/types/primitives';
import type {
  FheTypeId,
  EncryptionBits,
  KmsSigncryptedShares,
  DecryptedFhevmHandle,
  KmsEIP712Domain,
} from '@fhevm-base/types/public-api';
import type {
  ClientWasmType,
  CompactCiphertextListBuilderWasmType,
  CompactPkeCrsWasmType,
  KmsEIP712DomainWasmType,
  PrivateEncKeyMlKem512WasmType,
  ProvenCompactCiphertextListWasmType,
  PublicEncKeyMlKem512WasmType,
  ServerIdAddrWasmType,
  TfheCompactPublicKeyWasmType,
  TypedPlaintextWasmType,
} from './types/public-api';
import type {
  TfheCrs,
  TfheCrsBrand,
  TfheCrsBytes,
  TfhePublicEncryptionParams,
  TfhePublicEncryptionParamsBytes,
  TfhePublicKey,
  TfhePublicKeyBrand,
  TfhePublicKeyBytes,
  TkmsPrivateKey,
  TkmsPrivateKeyBrand,
} from '@fhevm-base/types/private';
import { EncryptionError } from './errors/EncryptionError';
import { isNonEmptyString, remove0x } from '@base/string';
import { bytesToHexLarge, hexToBytesFaster } from '@base/bytes';
import { getErrorMessage } from '@base/errors/utils';
import {
  bytesToFheDecryptedValue,
  encryptionBitsFromFheTypeId,
  isFheTypeId,
} from '@fhevm-base/FheType';
import {
  getMetadataInternal,
  getSharesInternal,
} from '@fhevm-base/kms/KmsSigncryptedShares';
import type {
  KmsSigncryptedShare,
  KmsSigncryptedSharesMetadata,
} from '@fhevm-base/types/private';
import { uint32ToBytes32 } from '@base/uint';
import { createDecryptedFhevmHandle } from '@fhevm-base/DecryptedFhevmHandle';
import type { TFHELib, TKMSLib } from '@fhevm-base/types/libs';
import type { TypedValue } from '@base/typedvalue';

////////////////////////////////////////////////////////////////////////////////

const GET_NATIVE_FUNC = Symbol('TKMSLib.getNative');

////////////////////////////////////////////////////////////////////////////////
//
// TFHELib
//
////////////////////////////////////////////////////////////////////////////////

export const SERIALIZED_SIZE_LIMIT_CIPHERTEXT = BigInt(1024 * 1024 * 512);
export const SERIALIZED_SIZE_LIMIT_PK = BigInt(1024 * 1024 * 512);
export const SERIALIZED_SIZE_LIMIT_CRS = BigInt(1024 * 1024 * 512);

const PRIVATE_TFHE_LIB_TOKEN = Symbol('TFHELib.token');

////////////////////////////////////////////////////////////////////////////////
// TfheCompactPublicKeyImpl
////////////////////////////////////////////////////////////////////////////////

class TfheCompactPublicKeyImpl implements TfhePublicKey {
  declare readonly [TfhePublicKeyBrand]: never;

  readonly #id: string;
  readonly #tfheCompactPublicKeyWasmType: TfheCompactPublicKeyWasmType;

  constructor(
    id: string,
    publicEncKeyMlKem512Wasm: TfheCompactPublicKeyWasmType,
  ) {
    this.#id = id;
    this.#tfheCompactPublicKeyWasmType = publicEncKeyMlKem512Wasm;
  }

  public get id(): string {
    return this.#id;
  }

  public [GET_NATIVE_FUNC](token: symbol): TfheCompactPublicKeyWasmType {
    if (token !== PRIVATE_TFHE_LIB_TOKEN) {
      throw new Error('Unauthorized');
    }
    return this.#tfheCompactPublicKeyWasmType;
  }
}

////////////////////////////////////////////////////////////////////////////////
// TfheCompactPkeCrsImpl
////////////////////////////////////////////////////////////////////////////////

class TfheCompactPkeCrsImpl implements TfheCrs {
  declare readonly [TfheCrsBrand]: never;

  readonly #id: string;
  readonly #capacity: UintNumber;
  readonly #compactPublicKeyWasmType: CompactPkeCrsWasmType;

  constructor(
    id: string,
    capacity: UintNumber,
    compactPublicKeyWasmType: CompactPkeCrsWasmType,
  ) {
    this.#id = id;
    this.#capacity = capacity;
    this.#compactPublicKeyWasmType = compactPublicKeyWasmType;
  }

  public get id(): string {
    return this.#id;
  }

  public get capacity(): UintNumber {
    return this.#capacity;
  }

  public [GET_NATIVE_FUNC](token: symbol): CompactPkeCrsWasmType {
    if (token !== PRIVATE_TFHE_LIB_TOKEN) {
      throw new Error('Unauthorized');
    }
    return this.#compactPublicKeyWasmType;
  }
}

const tfheLib: TFHELib = {
  //////////////////////////////////////////////////////////////////////////////
  // parseTFHEProvenCompactCiphertextList
  //////////////////////////////////////////////////////////////////////////////

  parseTFHEProvenCompactCiphertextList: function (
    ciphertextWithZKProof: Uint8Array | string,
  ): { fheTypeIds: FheTypeId[]; encryptionBits: EncryptionBits[] } {
    if ((ciphertextWithZKProof as unknown) == null) {
      throw new EncryptionError({
        message: `ciphertextWithZKProof argument is null or undefined.`,
      });
    }
    if (
      !(ciphertextWithZKProof instanceof Uint8Array) &&
      !isNonEmptyString(ciphertextWithZKProof)
    ) {
      throw new EncryptionError({
        message: `Invalid ciphertextWithZKProof argument.`,
      });
    }

    const ciphertext: Uint8Array =
      typeof ciphertextWithZKProof === 'string'
        ? hexToBytesFaster(ciphertextWithZKProof, { strict: true })
        : ciphertextWithZKProof;

    let listWasm: ProvenCompactCiphertextListWasmType;
    try {
      listWasm = TFHEModule.ProvenCompactCiphertextList.safe_deserialize(
        ciphertext,
        SERIALIZED_SIZE_LIMIT_CIPHERTEXT,
      );
    } catch (e) {
      throw new EncryptionError({
        message: `Invalid ciphertextWithZKProof bytes. ${getErrorMessage(e)}.`,
      });
    }

    const fheTypeIds: FheTypeId[] = [];

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
    } finally {
      listWasm.free();
    }
  },

  //////////////////////////////////////////////////////////////////////////////
  // buildWithProofPacked
  //////////////////////////////////////////////////////////////////////////////

  buildWithProofPacked: function ({
    typedValues,
    publicEncryptionParams,
    metaData,
  }: {
    typedValues: TypedValue[];
    publicEncryptionParams: TfhePublicEncryptionParams;
    metaData: Uint8Array;
  }): Uint8Array {
    const tfheCompactPublicKeyImpl = publicEncryptionParams.publicKey;
    const tfheCompactPkeCrsImpl = publicEncryptionParams.crs;

    if (!(tfheCompactPublicKeyImpl instanceof TfheCompactPublicKeyImpl)) {
      throw new Error('Invalid tfhePublicKey');
    }
    if (!(tfheCompactPkeCrsImpl instanceof TfheCompactPkeCrsImpl)) {
      throw new Error('Invalid tfheCrs');
    }

    let tfheProvenCompactCiphertextList:
      | ProvenCompactCiphertextListWasmType
      | undefined;

    let ciphertextWithZKProofBytes: Uint8Array | undefined;
    let fheCompactCiphertextListBuilderWasm:
      | CompactCiphertextListBuilderWasmType
      | undefined;

    try {
      const tfheCompactPublicKeyWasm: TfheCompactPublicKeyWasmType =
        tfheCompactPublicKeyImpl[GET_NATIVE_FUNC](PRIVATE_TFHE_LIB_TOKEN);
      const compactPkeCrsWasm: CompactPkeCrsWasmType = tfheCompactPkeCrsImpl[
        GET_NATIVE_FUNC
      ](PRIVATE_TFHE_LIB_TOKEN);

      fheCompactCiphertextListBuilderWasm =
        TFHEModule.CompactCiphertextList.builder(tfheCompactPublicKeyWasm);

      for (let i = 0; i < typedValues.length; ++i) {
        const typedValue = typedValues[i];
        switch (typedValue.type) {
          case 'uint8':
            fheCompactCiphertextListBuilderWasm.push_u8(typedValue.value);
            break;
          case 'uint16':
            fheCompactCiphertextListBuilderWasm.push_u16(typedValue.value);
            break;
          case 'uint32':
            fheCompactCiphertextListBuilderWasm.push_u32(typedValue.value);
            break;
          case 'uint64':
            fheCompactCiphertextListBuilderWasm.push_u64(typedValue.value);
            break;
          case 'uint128':
            fheCompactCiphertextListBuilderWasm.push_u128(typedValue.value);
            break;
          case 'uint256':
            fheCompactCiphertextListBuilderWasm.push_u256(typedValue.value);
            break;
          case 'bool':
            fheCompactCiphertextListBuilderWasm.push_boolean(typedValue.value);
            break;
          case 'address':
            fheCompactCiphertextListBuilderWasm.push_u160(
              BigInt(typedValue.value),
            );
            break;
        }
      }

      tfheProvenCompactCiphertextList =
        fheCompactCiphertextListBuilderWasm.build_with_proof_packed(
          compactPkeCrsWasm,
          metaData,
          TFHEModule.ZkComputeLoadVerify,
        );

      ciphertextWithZKProofBytes =
        tfheProvenCompactCiphertextList.safe_serialize(
          SERIALIZED_SIZE_LIMIT_CIPHERTEXT,
        );

      return ciphertextWithZKProofBytes;
    } finally {
      try {
        if (tfheProvenCompactCiphertextList !== undefined) {
          tfheProvenCompactCiphertextList.free();
        }
      } catch {
        //
      }

      try {
        if (fheCompactCiphertextListBuilderWasm !== undefined) {
          fheCompactCiphertextListBuilderWasm.free();
        }
      } catch {
        //
      }
    }
  },

  //////////////////////////////////////////////////////////////////////////////
  // serializeTfhePublicEncryptionParams
  //////////////////////////////////////////////////////////////////////////////

  serializeTfhePublicEncryptionParams(
    params: TfhePublicEncryptionParams,
  ): TfhePublicEncryptionParamsBytes {
    const tfheCompactPublicKeyImpl = params.publicKey;
    const tfheCompactPkeCrsImpl = params.crs;

    if (!(tfheCompactPublicKeyImpl instanceof TfheCompactPublicKeyImpl)) {
      throw new Error('Invalid tfhePublicKey');
    }
    if (!(tfheCompactPkeCrsImpl instanceof TfheCompactPkeCrsImpl)) {
      throw new Error('Invalid tfheCrs');
    }

    const tfhePublicKeyBytes: Bytes = tfheCompactPublicKeyImpl[GET_NATIVE_FUNC](
      PRIVATE_TFHE_LIB_TOKEN,
    ).safe_serialize(SERIALIZED_SIZE_LIMIT_PK);
    const tfheCrsBytes: Bytes = tfheCompactPkeCrsImpl[GET_NATIVE_FUNC](
      PRIVATE_TFHE_LIB_TOKEN,
    ).safe_serialize(SERIALIZED_SIZE_LIMIT_CRS);

    return Object.freeze({
      publicKey: Object.freeze({
        id: params.publicKey.id,
        bytes: tfhePublicKeyBytes,
      }),
      crs: Object.freeze({
        id: params.crs.id,
        capacity: params.crs.capacity,
        bytes: tfheCrsBytes,
      }),
    }) as TfhePublicEncryptionParamsBytes;
  },

  serializeTfhePublicKey(tfhePublicKey: TfhePublicKey): TfhePublicKeyBytes {
    const tfheCompactPublicKeyImpl = tfhePublicKey;

    if (!(tfheCompactPublicKeyImpl instanceof TfheCompactPublicKeyImpl)) {
      throw new Error('Invalid tfhePublicKey');
    }

    const tfhePublicKeyBytes: Bytes = tfheCompactPublicKeyImpl[GET_NATIVE_FUNC](
      PRIVATE_TFHE_LIB_TOKEN,
    ).safe_serialize(SERIALIZED_SIZE_LIMIT_PK);

    return Object.freeze({
      id: tfhePublicKey.id,
      bytes: tfhePublicKeyBytes,
    }) as TfhePublicKeyBytes;
  },

  serializeTfheCrs(tfheCrs: TfheCrs): TfheCrsBytes {
    const tfheCompactPkeCrsImpl = tfheCrs;

    if (!(tfheCompactPkeCrsImpl instanceof TfheCompactPkeCrsImpl)) {
      throw new Error('Invalid tfheCrs');
    }

    const tfheCrsBytes: Bytes = tfheCompactPkeCrsImpl[GET_NATIVE_FUNC](
      PRIVATE_TFHE_LIB_TOKEN,
    ).safe_serialize(SERIALIZED_SIZE_LIMIT_CRS);

    return Object.freeze({
      id: tfheCrs.id,
      capacity: tfheCrs.capacity,
      bytes: tfheCrsBytes,
    }) as TfheCrsBytes;
  },

  //////////////////////////////////////////////////////////////////////////////
  // parseTfhePublicEncryptionParams
  //////////////////////////////////////////////////////////////////////////////

  deserializeTfhePublicEncryptionParams(
    paramsBytes: TfhePublicEncryptionParamsBytes,
  ): TfhePublicEncryptionParams {
    const tfheCompactPublicKeyWasm: TfheCompactPublicKeyWasmType =
      TFHEModule.TfheCompactPublicKey.safe_deserialize(
        paramsBytes.publicKey.bytes,
        SERIALIZED_SIZE_LIMIT_PK,
      );
    const compactPkeCrsWasm: CompactPkeCrsWasmType =
      TFHEModule.CompactPkeCrs.safe_deserialize(
        paramsBytes.crs.bytes,
        SERIALIZED_SIZE_LIMIT_CRS,
      );
    return Object.freeze({
      publicKey: new TfheCompactPublicKeyImpl(
        paramsBytes.publicKey.id,
        tfheCompactPublicKeyWasm,
      ),
      crs: new TfheCompactPkeCrsImpl(
        paramsBytes.crs.id,
        paramsBytes.crs.capacity,
        compactPkeCrsWasm,
      ),
    });
  },
};

////////////////////////////////////////////////////////////////////////////////
//
// TKMSLib
//
////////////////////////////////////////////////////////////////////////////////

const PRIVATE_TKMS_LIB_TOKEN = Symbol('TKMSLib.token');
const GET_PUBLIC_KEY_FUNC = Symbol('TkmsPrivateEncKeyMlKem512.getPublicKey');
const GET_BYTES_HEX_FUNC = Symbol(
  'TkmsPublicEncKeyMlKem512Impl.getBytesHexNo0x',
);

////////////////////////////////////////////////////////////////////////////////
// TkmsPublicEncKeyMlKem512Impl
////////////////////////////////////////////////////////////////////////////////

class TkmsPublicEncKeyMlKem512Impl {
  readonly #publicEncKeyMlKem512Wasm: PublicEncKeyMlKem512WasmType;
  #bytesHex: BytesHex | undefined;

  constructor(publicEncKeyMlKem512Wasm: PublicEncKeyMlKem512WasmType) {
    this.#publicEncKeyMlKem512Wasm = publicEncKeyMlKem512Wasm;
  }

  public [GET_NATIVE_FUNC](token: symbol): PublicEncKeyMlKem512WasmType {
    if (token !== PRIVATE_TKMS_LIB_TOKEN) {
      throw new Error('Unauthorized');
    }
    return this.#publicEncKeyMlKem512Wasm;
  }

  public [GET_BYTES_HEX_FUNC](token: symbol): BytesHex {
    if (token !== PRIVATE_TKMS_LIB_TOKEN) {
      throw new Error('Unauthorized');
    }
    if (this.#bytesHex === undefined) {
      const bytes: Bytes = TKMSModule.ml_kem_pke_pk_to_u8vec(
        this.#publicEncKeyMlKem512Wasm,
      );
      this.#bytesHex = bytesToHexLarge(bytes, false /* no 0x */);
    }
    return this.#bytesHex;
  }
}

////////////////////////////////////////////////////////////////////////////////
// TkmsPrivateEncKeyMlKem512Impl
////////////////////////////////////////////////////////////////////////////////

class TkmsPrivateEncKeyMlKem512Impl implements TkmsPrivateKey {
  declare readonly [TkmsPrivateKeyBrand]: never;

  readonly #privateEncKeyMlKem512Wasm: PrivateEncKeyMlKem512WasmType;
  #publicKey: TkmsPublicEncKeyMlKem512Impl | undefined;

  constructor(privateEncKeyMlKem512Wasm: PrivateEncKeyMlKem512WasmType) {
    this.#privateEncKeyMlKem512Wasm = privateEncKeyMlKem512Wasm;
  }

  public [GET_NATIVE_FUNC](token: symbol): PrivateEncKeyMlKem512WasmType {
    if (token !== PRIVATE_TKMS_LIB_TOKEN) {
      throw new Error('Unauthorized');
    }
    return this.#privateEncKeyMlKem512Wasm;
  }

  public [GET_PUBLIC_KEY_FUNC](token: symbol): TkmsPublicEncKeyMlKem512Impl {
    if (token !== PRIVATE_TKMS_LIB_TOKEN) {
      throw new Error('Unauthorized');
    }
    if (this.#publicKey === undefined) {
      const publicEncKeyMlKem512Wasm: PublicEncKeyMlKem512WasmType =
        TKMSModule.ml_kem_pke_get_pk(this.#privateEncKeyMlKem512Wasm);
      this.#publicKey = new TkmsPublicEncKeyMlKem512Impl(
        publicEncKeyMlKem512Wasm,
      );
    }
    return this.#publicKey;
  }
}

////////////////////////////////////////////////////////////////////////////////
// tkmsLib
////////////////////////////////////////////////////////////////////////////////

const tkmsLib: TKMSLib = {
  //////////////////////////////////////////////////////////////////////////////
  // decryptAndReconstruct
  //////////////////////////////////////////////////////////////////////////////

  decryptAndReconstruct: function (
    tkmsPrivateKey: TkmsPrivateKey,
    shares: KmsSigncryptedShares,
  ): readonly DecryptedFhevmHandle[] {
    if (!(tkmsPrivateKey instanceof TkmsPrivateEncKeyMlKem512Impl)) {
      throw new Error('Invalid tkmsPrivateKey');
    }

    const tkmsPublicKey: TkmsPublicEncKeyMlKem512Impl = tkmsPrivateKey[
      GET_PUBLIC_KEY_FUNC
    ](PRIVATE_TKMS_LIB_TOKEN);

    const metadata: KmsSigncryptedSharesMetadata = getMetadataInternal(shares);
    const sharesArray: readonly KmsSigncryptedShare[] =
      getSharesInternal(shares);

    const privateEncKeyMlKem512Wasm: PrivateEncKeyMlKem512WasmType =
      tkmsPrivateKey[GET_NATIVE_FUNC](PRIVATE_TKMS_LIB_TOKEN);

    const publicEncKeyMlKem512Wasm: PublicEncKeyMlKem512WasmType =
      tkmsPublicKey[GET_NATIVE_FUNC](PRIVATE_TKMS_LIB_TOKEN);

    const publicEncKeyMlKem512WasmBytesHex: BytesHex = tkmsPublicKey[
      GET_BYTES_HEX_FUNC
    ](PRIVATE_TKMS_LIB_TOKEN);

    // KmsEIP712Domain
    const kmsEIP712Domain: KmsEIP712Domain = metadata.kmsVerifier.eip712Domain;
    const clientAddress: ChecksummedAddress = metadata.eip712SignerAddress;

    // To be modified! use uint64ToBytes32 instead
    const kmsEIP712DomainWasmArg: KmsEIP712DomainWasmType = {
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
    const indexedServerAddressesWasm: ServerIdAddrWasmType[] =
      metadata.kmsVerifier.kmsSigners.map((kmsSigner, index) => {
        const kmsSignerPartyId = index + 1;
        return TKMSModule.new_server_id_addr(kmsSignerPartyId, kmsSigner);
      });

    const clientWasm: ClientWasmType = TKMSModule.new_client(
      indexedServerAddressesWasm,
      clientAddress,
      'default',
    );

    const requestWasmArg = {
      signature: remove0x(metadata.eip712Signature),
      client_address: clientAddress,
      enc_key: remove0x(publicEncKeyMlKem512WasmBytesHex),
      ciphertext_handles: metadata.fhevmHandles.map((h) => h.bytes32HexNo0x),
      eip712_verifying_contract:
        metadata.kmsVerifier.verifyingContractAddressDecryption,
    };

    // 1. Call kms module to decrypt & reconstruct clear values
    const typedPlaintextArray: TypedPlaintextWasmType[] =
      TKMSModule.process_user_decryption_resp_from_js(
        clientWasm, // client argument
        requestWasmArg, // request argument
        kmsEIP712DomainWasmArg, // eip712_domain argument
        sharesArray, // agg_resp argument
        publicEncKeyMlKem512Wasm, // enc_pk argument
        privateEncKeyMlKem512Wasm, // enc_sk argument
        true, // verify argument
      );

    // 2. Build an unforgeable structure that contains the decrypted FhevmHandles
    const orderedDecryptedFhevmHandles: readonly DecryptedFhevmHandle[] =
      typedPlaintextArray.map(
        (typedPlaintext: TypedPlaintextWasmType, idx: number) => {
          if (
            typedPlaintext.fhe_type !== metadata.fhevmHandles[idx].fheTypeId
          ) {
            throw new Error('Internal error');
          }
          return createDecryptedFhevmHandle(
            metadata.fhevmHandles[idx],
            bytesToFheDecryptedValue(
              metadata.fhevmHandles[idx].fheTypeName,
              typedPlaintext.bytes,
            ),
            PRIVATE_TKMS_LIB_TOKEN, // origin token for authenticity assertion
          );
        },
      );
    Object.freeze(orderedDecryptedFhevmHandles);

    return orderedDecryptedFhevmHandles;
  },

  //////////////////////////////////////////////////////////////////////////////
  // generateTkmsPrivateKey
  //////////////////////////////////////////////////////////////////////////////

  generateTkmsPrivateKey: function (): TkmsPrivateKey {
    const privateEncKeyMlKem512Wasm: PrivateEncKeyMlKem512WasmType =
      TKMSModule.ml_kem_pke_keygen();
    return new TkmsPrivateEncKeyMlKem512Impl(privateEncKeyMlKem512Wasm);
  },

  //////////////////////////////////////////////////////////////////////////////
  // getTkmsPublicKeyHex
  //////////////////////////////////////////////////////////////////////////////

  getTkmsPublicKeyHex: function (tkmsPrivateKey: TkmsPrivateKey): BytesHex {
    if (!(tkmsPrivateKey instanceof TkmsPrivateEncKeyMlKem512Impl)) {
      throw new Error('Invalid tkmsPrivateKey');
    }
    return tkmsPrivateKey[GET_PUBLIC_KEY_FUNC](PRIVATE_TKMS_LIB_TOKEN)[
      GET_BYTES_HEX_FUNC
    ](PRIVATE_TKMS_LIB_TOKEN);
  },

  //////////////////////////////////////////////////////////////////////////////
  // serializeTkmsPrivateKey
  //////////////////////////////////////////////////////////////////////////////

  serializeTkmsPrivateKey: function (tkmsPrivateKey: TkmsPrivateKey): Bytes {
    if (!(tkmsPrivateKey instanceof TkmsPrivateEncKeyMlKem512Impl)) {
      throw new Error('Invalid tkmsPrivateKey');
    }

    const privateEncKeyMlKem512Wasm: PrivateEncKeyMlKem512WasmType =
      tkmsPrivateKey[GET_NATIVE_FUNC](PRIVATE_TKMS_LIB_TOKEN);

    return TKMSModule.ml_kem_pke_sk_to_u8vec(privateEncKeyMlKem512Wasm);
  },

  //////////////////////////////////////////////////////////////////////////////
  // deserializeTkmsPrivateKey
  //////////////////////////////////////////////////////////////////////////////

  deserializeTkmsPrivateKey: function (
    tkmsPrivateKeyBytes: Bytes,
  ): TkmsPrivateKey {
    const privateEncKeyMlKem512Wasm: PrivateEncKeyMlKem512WasmType =
      TKMSModule.u8vec_to_ml_kem_pke_sk(tkmsPrivateKeyBytes);

    return new TkmsPrivateEncKeyMlKem512Impl(privateEncKeyMlKem512Wasm);
  },
};

export const createTFHELib = async (
  _config?: unknown,
  // eslint-disable-next-line @typescript-eslint/require-await
): Promise<TFHELib> => {
  return tfheLib;
};

export const createTKMSLib = async (
  _config?: unknown,
  // eslint-disable-next-line @typescript-eslint/require-await
): Promise<TKMSLib> => {
  return tkmsLib;
};
