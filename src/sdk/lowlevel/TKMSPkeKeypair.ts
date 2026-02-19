import { TKMS as TKMSModule } from './wasm-modules';
import type {
  Bytes,
  BytesHex,
  BytesHexNo0x,
  ChecksummedAddress,
} from '@base/types/primitives';
import type {
  ClientWasmType,
  KmsEIP712DomainWasmType,
  PrivateEncKeyMlKem512WasmType,
  PublicEncKeyMlKem512WasmType,
  ServerIdAddrWasmType,
  TKMSPkeKeypair,
  TypedPlaintextWasmType,
} from './public-api';
import type { Keypair } from '../types/public-api';
import {
  bytesToHexLarge,
  hexToBytesFaster,
  unsafeBytesEquals,
} from '@base/bytes';
import { assertRecordNonNullableProperty } from '@base/record';
import { ensure0x, remove0x } from '@base/string';
import type { KmsSigncryptedShares } from '../types/public-api';
import type {
  KmsSigncryptedShare,
  KmsSigncryptedSharesMetadata,
} from '../types/private';
import type {
  KmsEIP712Domain,
  DecryptedFhevmHandle,
} from '@fhevm-base/types/public-api';
import {
  getMetadataInternal,
  getSharesInternal,
} from '../kms/KmsSigncryptedShares';
import { uint32ToBytes32 } from '@base/uint';
import { createDecryptedFhevmHandle } from '@fhevm-base/DecryptedFhevmHandle';
import { bytesToFheDecryptedValue } from '@fhevm-base/FheType';

////////////////////////////////////////////////////////////////////////////////

const PRIVATE_TKMS_PKE_KEYPAIR_TOKEN = Symbol('TKMSPkeKeypair.token');
const GET_WASM_FUNC = Symbol('TKMSPkeKeypair.getWasm');

////////////////////////////////////////////////////////////////////////////////

declare const PublicEncKeyMlKem512Brand: unique symbol;
declare const PrivateEncKeyMlKem512Brand: unique symbol;

export interface PublicEncKeyMlKem512 {
  readonly [PublicEncKeyMlKem512Brand]: never;
}
export interface PrivateEncKeyMlKem512 {
  readonly [PrivateEncKeyMlKem512Brand]: never;
  getPublicKeyHex(): BytesHex;
}

////////////////////////////////////////////////////////////////////////////////

class PublicEncKeyMlKem512Impl implements PublicEncKeyMlKem512 {
  declare readonly [PublicEncKeyMlKem512Brand]: never;
  readonly #publicEncKeyMlKem512Wasm: PublicEncKeyMlKem512WasmType;

  constructor(publicEncKeyMlKem512Wasm: PublicEncKeyMlKem512WasmType) {
    this.#publicEncKeyMlKem512Wasm = publicEncKeyMlKem512Wasm;
  }

  public [GET_WASM_FUNC](token: symbol): PublicEncKeyMlKem512WasmType {
    if (token !== PRIVATE_TKMS_PKE_KEYPAIR_TOKEN) {
      throw new Error('Unauthorized');
    }
    return this.#publicEncKeyMlKem512Wasm;
  }

  public toBytesHex(): BytesHex {
    const pkBytes = TKMSModule.ml_kem_pke_pk_to_u8vec(
      this.#publicEncKeyMlKem512Wasm,
    );
    return bytesToHexLarge(pkBytes);
  }
}

////////////////////////////////////////////////////////////////////////////////

class PrivateEncKeyMlKem512Impl implements PrivateEncKeyMlKem512 {
  declare readonly [PrivateEncKeyMlKem512Brand]: never;
  readonly #privateEncKeyMlKem512Wasm: PrivateEncKeyMlKem512WasmType;

  constructor(privateEncKeyMlKem512Wasm: PrivateEncKeyMlKem512WasmType) {
    this.#privateEncKeyMlKem512Wasm = privateEncKeyMlKem512Wasm;
  }

  public [GET_WASM_FUNC](token: symbol): PrivateEncKeyMlKem512WasmType {
    if (token !== PRIVATE_TKMS_PKE_KEYPAIR_TOKEN) {
      throw new Error('Internal error');
    }
    return this.#privateEncKeyMlKem512Wasm;
  }

  public getPublicKeyHex(): BytesHex {
    return _getPublicEncKeyMlKem512(this).toBytesHex();
  }
}

////////////////////////////////////////////////////////////////////////////////

function _getPublicEncKeyMlKem512(
  privateKey: PrivateEncKeyMlKem512Impl,
): PublicEncKeyMlKem512Impl {
  const pkWasm: PublicEncKeyMlKem512WasmType = TKMSModule.ml_kem_pke_get_pk(
    privateKey[GET_WASM_FUNC](PRIVATE_TKMS_PKE_KEYPAIR_TOKEN),
  );
  return new PublicEncKeyMlKem512Impl(pkWasm);
}

////////////////////////////////////////////////////////////////////////////////
// TKMSPkeKeypair
////////////////////////////////////////////////////////////////////////////////

class TKMSPkeKeypairImpl implements TKMSPkeKeypair {
  readonly #mlKemPkePk: { bytes: Bytes; hexNo0x: BytesHexNo0x };
  readonly #mlKemPkeSk: { bytes: Bytes; hexNo0x: BytesHexNo0x };

  constructor(params: {
    mlKemPkePk: { bytes: Bytes; hexNo0x: BytesHexNo0x };
    mlKemPkeSk: { bytes: Bytes; hexNo0x: BytesHexNo0x };
  }) {
    this.#mlKemPkePk = params.mlKemPkePk;
    this.#mlKemPkeSk = params.mlKemPkeSk;

    Object.freeze(this.#mlKemPkePk);
    Object.freeze(this.#mlKemPkeSk);

    this.verify();
  }

  public toBytesHex(): Keypair<BytesHex> {
    return {
      publicKey: ensure0x(this.#mlKemPkePk.hexNo0x) as BytesHex,
      privateKey: ensure0x(this.#mlKemPkeSk.hexNo0x) as BytesHex,
    };
  }

  public toBytesHexNo0x(): Keypair<BytesHexNo0x> {
    return {
      publicKey: this.#mlKemPkePk.hexNo0x,
      privateKey: this.#mlKemPkeSk.hexNo0x,
    };
  }

  public toBytes(): Keypair<Bytes> {
    return {
      publicKey: this.#mlKemPkePk.bytes,
      privateKey: this.#mlKemPkeSk.bytes,
    };
  }

  public get publicKey(): BytesHexNo0x {
    return this.#mlKemPkePk.hexNo0x;
  }

  public get privateKey(): BytesHexNo0x {
    return this.#mlKemPkeSk.hexNo0x;
  }

  public verify(): void {
    let skWasm: PrivateEncKeyMlKem512WasmType;
    try {
      skWasm = TKMSModule.u8vec_to_ml_kem_pke_sk(this.#mlKemPkeSk.bytes);
    } catch {
      throw new Error(`Invalid TKMSPkeKeypair privateKey`);
    }

    const pkWasm: PublicEncKeyMlKem512WasmType =
      TKMSModule.ml_kem_pke_get_pk(skWasm);
    const pkBytes = TKMSModule.ml_kem_pke_pk_to_u8vec(pkWasm);
    const skBytes = TKMSModule.ml_kem_pke_sk_to_u8vec(skWasm);
    if (!unsafeBytesEquals(pkBytes, this.#mlKemPkePk.bytes)) {
      throw new Error(`Invalid TKMSPkeKeypair publicKey`);
    }
    if (!unsafeBytesEquals(skBytes, this.#mlKemPkeSk.bytes)) {
      throw new Error(`Invalid TKMSPkeKeypair privateKey`);
    }
  }

  public toJSON(): Keypair<BytesHex> {
    return this.toBytesHex();
  }
}

////////////////////////////////////////////////////////////////////////////////
// Public API
////////////////////////////////////////////////////////////////////////////////

export function generateTKMSPkeKeypair(): TKMSPkeKeypair {
  const keypair = TKMSModule.ml_kem_pke_keygen();
  const pkBytes = TKMSModule.ml_kem_pke_pk_to_u8vec(
    TKMSModule.ml_kem_pke_get_pk(keypair),
  );
  const skBytes = TKMSModule.ml_kem_pke_sk_to_u8vec(keypair);
  return new TKMSPkeKeypairImpl({
    mlKemPkePk: _toBytesAndBytesHexNo0xPair(pkBytes),
    mlKemPkeSk: _toBytesAndBytesHexNo0xPair(skBytes),
  });
}

export function toTKMSPkeKeypair(value: unknown): TKMSPkeKeypair {
  assertRecordNonNullableProperty(value, 'publicKey', 'toTKMSPkeKeypair()', {});
  assertRecordNonNullableProperty(
    value,
    'privateKey',
    'toTKMSPkeKeypair()',
    {},
  );

  return new TKMSPkeKeypairImpl({
    mlKemPkePk: _toBytesAndBytesHexNo0xPair(value.publicKey),
    mlKemPkeSk: _toBytesAndBytesHexNo0xPair(value.privateKey),
  });
}

////////////////////////////////////////////////////////////////////////////////
// Private Helpers
////////////////////////////////////////////////////////////////////////////////

function _toBytesAndBytesHexNo0xPair(value: unknown): {
  bytes: Bytes;
  hexNo0x: BytesHexNo0x;
} {
  let bytes: Bytes;
  let hexNo0x: BytesHexNo0x;

  if (typeof value === 'string') {
    bytes = hexToBytesFaster(value, { strict: true });
    if (value.startsWith('0x')) {
      hexNo0x = remove0x(value) as BytesHexNo0x;
    } else {
      hexNo0x = value as BytesHexNo0x;
    }
  } else if (value instanceof Uint8Array) {
    hexNo0x = bytesToHexLarge(value, true /* no0x */);
    bytes = value;
  } else {
    throw new Error(`Invalid argument, expecting string or Uint8Array`);
  }

  return {
    bytes,
    hexNo0x,
  };
}

export function kmsDecryptAndReconstruct(
  privateKey: PrivateEncKeyMlKem512,
  shares: KmsSigncryptedShares,
  originToken: symbol,
): readonly DecryptedFhevmHandle[] {
  if (!(privateKey instanceof PrivateEncKeyMlKem512Impl)) {
    throw new Error('Invalid privateKey argument');
  }
  if (!(shares instanceof PrivateEncKeyMlKem512Impl)) {
    throw new Error('Invalid privateKey argument');
  }
  const publicKey: PublicEncKeyMlKem512Impl =
    _getPublicEncKeyMlKem512(privateKey);
  const metadata: KmsSigncryptedSharesMetadata = getMetadataInternal(shares);
  const sharesArray: readonly KmsSigncryptedShare[] = getSharesInternal(shares);

  //////////////////////////////////////////////////////////////////////////////
  // Important:
  // assume the KMS Signers have the correct order
  //////////////////////////////////////////////////////////////////////////////
  const indexedServerAddresses: ServerIdAddrWasmType[] =
    metadata.kmsVerifier.kmsSigners.map((kmsSigner, index) => {
      const kmsSignerPartyId = index + 1;
      return TKMSModule.new_server_id_addr(kmsSignerPartyId, kmsSigner);
    });

  // KmsEIP712Domain
  const kmsEIP712Domain: KmsEIP712Domain = metadata.kmsVerifier.eip712Domain;

  // To be modified! use uint64ToBytes32 instead
  const kmsEIP712DomainWasmArg: KmsEIP712DomainWasmType = {
    name: kmsEIP712Domain.name,
    version: kmsEIP712Domain.version,
    chain_id: uint32ToBytes32(kmsEIP712Domain.chainId),
    verifying_contract: kmsEIP712Domain.verifyingContract,
    salt: null,
  };

  const clientAddress: ChecksummedAddress = metadata.eip712SignerAddress;

  const client: ClientWasmType = TKMSModule.new_client(
    indexedServerAddresses,
    clientAddress,
    'default',
  );

  //
  const requestWasmArg = {
    signature: remove0x(metadata.eip712Signature),
    client_address: clientAddress,
    enc_key: remove0x(publicKey.toBytesHex()),
    ciphertext_handles: metadata.fhevmHandles.map((h) => h.bytes32HexNo0x),
    eip712_verifying_contract:
      metadata.kmsVerifier.verifyingContractAddressDecryption,
  };

  // 1. Call kms module to decrypt & reconstruct clear values
  const typedPlaintextArray: TypedPlaintextWasmType[] =
    TKMSModule.process_user_decryption_resp_from_js(
      client, // client argument
      requestWasmArg, // request argument
      kmsEIP712DomainWasmArg, // eip712_domain argument
      sharesArray, // agg_resp argument
      publicKey[GET_WASM_FUNC](PRIVATE_TKMS_PKE_KEYPAIR_TOKEN), // enc_pk argument
      privateKey[GET_WASM_FUNC](PRIVATE_TKMS_PKE_KEYPAIR_TOKEN), // enc_sk argument
      true, // verify argument
    );

  // 2. Build an unforgeable structure that contains the decrypted FhevmHandles
  const orderedDecryptedFhevmHandles: readonly DecryptedFhevmHandle[] =
    typedPlaintextArray.map(
      (typedPlaintext: TypedPlaintextWasmType, idx: number) => {
        if (typedPlaintext.fhe_type !== metadata.fhevmHandles[idx].fheTypeId) {
          throw new Error('Internal error');
        }
        return createDecryptedFhevmHandle(
          metadata.fhevmHandles[idx],
          bytesToFheDecryptedValue(
            metadata.fhevmHandles[idx].fheTypeName,
            typedPlaintext.bytes,
          ),
          originToken, // origin token for authencity assertion
        );
      },
    );
  Object.freeze(orderedDecryptedFhevmHandles);

  return orderedDecryptedFhevmHandles;
}
