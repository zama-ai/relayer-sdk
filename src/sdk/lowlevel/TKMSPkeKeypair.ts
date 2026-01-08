import type { Bytes, BytesHex, BytesHexNo0x } from '@base/types/primitives';
import type { KeypairType } from '@sdk/kms/public-api';
import { bytesEquals, bytesToHexLarge, hexToBytesFaster } from '@base/bytes';
import { assertRecordNonNullableProperty } from '@base/record';
import { ensure0x, remove0x } from '@base/string';

export class TKMSPkeKeypair implements KeypairType<BytesHexNo0x> {
  readonly #mlKemPkePk: { bytes: Bytes; hexNo0x: BytesHexNo0x };
  readonly #mlKemPkeSk: { bytes: Bytes; hexNo0x: BytesHexNo0x };

  private constructor(params: {
    mlKemPkePk: { bytes: Bytes; hexNo0x: BytesHexNo0x };
    mlKemPkeSk: { bytes: Bytes; hexNo0x: BytesHexNo0x };
  }) {
    this.#mlKemPkePk = params.mlKemPkePk;
    this.#mlKemPkeSk = params.mlKemPkeSk;

    Object.freeze(this.#mlKemPkePk);
    Object.freeze(this.#mlKemPkeSk);

    this.verify();
  }

  public toBytesHex(): KeypairType<BytesHex> {
    return {
      publicKey: ensure0x(this.#mlKemPkePk.hexNo0x),
      privateKey: ensure0x(this.#mlKemPkeSk.hexNo0x),
    };
  }

  public toBytesHexNo0x(): KeypairType<BytesHexNo0x> {
    return {
      publicKey: this.#mlKemPkePk.hexNo0x,
      privateKey: this.#mlKemPkeSk.hexNo0x,
    };
  }

  public toBytes(): KeypairType<Bytes> {
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

  public static generate(): TKMSPkeKeypair {
    const keypair = TKMS.ml_kem_pke_keygen();
    const pkBytes = TKMS.ml_kem_pke_pk_to_u8vec(
      TKMS.ml_kem_pke_get_pk(keypair),
    );
    const skBytes = TKMS.ml_kem_pke_sk_to_u8vec(keypair);
    return new TKMSPkeKeypair({
      mlKemPkePk: _toBytesAndBytesHexNo0xPair(pkBytes),
      mlKemPkeSk: _toBytesAndBytesHexNo0xPair(skBytes),
    });
  }

  public verify(): void {
    let skWasm;
    try {
      skWasm = TKMS.u8vec_to_ml_kem_pke_sk(this.#mlKemPkeSk.bytes);
    } catch {
      throw new Error(`Invalid TKMSPkeKeypair privateKey`);
    }

    // if (!inBundle) {
    //   if (
    //     (skWasm as unknown as { constructor: { name: string } }).constructor
    //       .name !== 'PrivateEncKeyMlKem512'
    //   ) {
    //     throw new Error(
    //       `Invalid PrivateEncKeyMlKem512. Got '${
    //         (skWasm as unknown as { constructor: { name: string } }).constructor
    //           .name
    //       }'`,
    //     );
    //   }
    // }

    const pkWasm = TKMS.ml_kem_pke_get_pk(skWasm);
    const pkBytes = TKMS.ml_kem_pke_pk_to_u8vec(pkWasm);
    const skBytes = TKMS.ml_kem_pke_sk_to_u8vec(skWasm);
    if (!bytesEquals(pkBytes, this.#mlKemPkePk.bytes)) {
      throw new Error(`Invalid TKMSPkeKeypair publicKey`);
    }
    if (!bytesEquals(skBytes, this.#mlKemPkeSk.bytes)) {
      throw new Error(`Invalid TKMSPkeKeypair privateKey`);
    }
  }

  public static from(value: unknown): TKMSPkeKeypair {
    assertRecordNonNullableProperty(
      value,
      'publicKey',
      'TKMSPkeKeypair.from()',
    );
    assertRecordNonNullableProperty(
      value,
      'privateKey',
      'TKMSPkeKeypair.from()',
    );

    return new TKMSPkeKeypair({
      mlKemPkePk: _toBytesAndBytesHexNo0xPair(value.publicKey),
      mlKemPkeSk: _toBytesAndBytesHexNo0xPair(value.privateKey),
    });
  }

  public toJSON(): KeypairType<BytesHex> {
    return this.toBytesHex();
  }
}

function _toBytesAndBytesHexNo0xPair(value: unknown): {
  bytes: Bytes;
  hexNo0x: BytesHexNo0x;
} {
  let bytes: Bytes;
  let hexNo0x: BytesHexNo0x;

  if (typeof value === 'string') {
    bytes = hexToBytesFaster(value, { strict: true });
    if (value.startsWith('0x')) {
      hexNo0x = remove0x(value);
    } else {
      hexNo0x = value;
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
