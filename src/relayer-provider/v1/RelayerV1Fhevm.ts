import type { PublicParams } from '../../sdk/encrypt';
import type { TFHEType } from '../../tfheType';
import { getPublicParams, getTfheCompactPublicKey } from '../../config';
import { AbstractRelayerFhevm } from '../AbstractRelayerFhevm';
import { RelayerV1Provider } from './RelayerV1Provider';
import {
  SERIALIZED_SIZE_LIMIT_CRS,
  SERIALIZED_SIZE_LIMIT_PK,
} from '../../constants';

type RelayerV1PublicKeyDataType = {
  publicKey: TFHEType['TfheCompactPublicKey'];
  publicKeyId: string;
};

type RelayerV1PublicParamsDataType = PublicParams<TFHEType['CompactPkeCrs']>;

export class RelayerV1Fhevm extends AbstractRelayerFhevm {
  private readonly _relayerProvider: RelayerV1Provider;
  private readonly _publicKeyData: RelayerV1PublicKeyDataType;
  private readonly _publicParamsData: RelayerV1PublicParamsDataType;

  private constructor(params: {
    relayerProvider: RelayerV1Provider;
    publicKeyData: RelayerV1PublicKeyDataType;
    publicParamsData: RelayerV1PublicParamsDataType;
  }) {
    super();
    this._relayerProvider = params.relayerProvider;
    this._publicKeyData = params.publicKeyData;
    this._publicParamsData = params.publicParamsData;
  }

  public get version(): number {
    return 1;
  }

  public get relayerVersionUrl(): string {
    return this.relayerProvider.url;
  }

  public static async fromConfig(config: {
    relayerVersionUrl: string;
    publicKey?: {
      data: Uint8Array | null;
      id: string | null;
    };
    publicParams?: PublicParams<Uint8Array> | null;
  }) {
    const relayerProvider = new RelayerV1Provider(config.relayerVersionUrl);
    const publicKeyData = await getTfheCompactPublicKey(config);
    const publicParamsData = await getPublicParams(config);
    return new RelayerV1Fhevm({
      relayerProvider,
      publicKeyData,
      publicParamsData,
    });
  }

  public get relayerProvider(): RelayerV1Provider {
    return this._relayerProvider;
  }

  public override getPublicKeyBytes(): {
    publicKey: Uint8Array;
    publicKeyId: string;
  } {
    return {
      publicKey: this._publicKeyData.publicKey.safe_serialize(
        SERIALIZED_SIZE_LIMIT_PK,
      ),
      publicKeyId: this._publicKeyData.publicKeyId,
    };
  }

  public override getPublicKeyInfo(): { id: string; srcUrl?: string } {
    return {
      id: this._publicKeyData.publicKeyId,
    };
  }

  public override getPublicParamsInfo(): {
    id: string;
    bits: number;
    srcUrl?: string;
  } {
    return {
      id: this._publicParamsData['2048']!.publicParamsId,
      bits: 2048,
    };
  }

  public override getPublicKeyWasm(): {
    publicKey: TFHEType['TfheCompactPublicKey'];
    publicKeyId: string;
  } {
    return {
      publicKey: this._publicKeyData.publicKey,
      publicKeyId: this._publicKeyData.publicKeyId,
    };
  }

  public override getPublicParamsBytesForBits(bits: number): {
    publicParams: Uint8Array;
    publicParamsId: string;
  } {
    if (bits === undefined) {
      throw new Error(`Missing PublicParams bits format`);
    }
    if (bits !== 2048) {
      throw new Error(`Unsupported PublicParams bits format '${bits}'`);
    }

    const res = {
      publicParams: this._publicParamsData['2048']!.publicParams.safe_serialize(
        SERIALIZED_SIZE_LIMIT_CRS,
      ),
      publicParamsId: this._publicParamsData['2048']!.publicParamsId,
    };
    return res;
  }

  public override getPublicParamsWasmForBits(bits: number): {
    publicParamsId: string;
    publicParams: TFHEType['CompactPkeCrs'];
  } {
    if (bits === undefined) {
      throw new Error(`Missing PublicParams bits format`);
    }
    if (bits !== 2048) {
      throw new Error(`Unsupported PublicParams bits format '${bits}'`);
    }

    return {
      publicParams: this._publicParamsData['2048']!.publicParams,
      publicParamsId: this._publicParamsData['2048']!.publicParamsId,
    };
  }
}
