import type {
  CompactPkeCrsWasmType,
  TfheCompactPublicKeyWasmType,
} from '@sdk/lowlevel/public-api';
import type { FhevmHostChain } from '@sdk/fhevmHostChain';
import type { FhevmInstanceConfig, PublicParams } from '../../types/relayer';
import { getPublicParams, getTfheCompactPublicKey } from './networkV1';
import { AbstractRelayerFhevm } from '../AbstractRelayerFhevm';
import { RelayerV1Provider } from './RelayerV1Provider';
import { FhevmHostChainConfig } from '@sdk/fhevmHostChain';
import {
  SERIALIZED_SIZE_LIMIT_CRS,
  SERIALIZED_SIZE_LIMIT_PK,
} from '@sdk/lowlevel/constants';
import { TFHEPkeParams } from '@sdk/lowlevel/TFHEPkeParams';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type RelayerV1PublicKeyDataType = {
  publicKey: TfheCompactPublicKeyWasmType;
  publicKeyId: string;
};

type RelayerV1PublicParamsDataType = PublicParams<CompactPkeCrsWasmType>;

export class RelayerV1Fhevm extends AbstractRelayerFhevm {
  private readonly _relayerProvider: RelayerV1Provider;
  private readonly _publicKeyData: RelayerV1PublicKeyDataType;
  private readonly _publicParamsData: RelayerV1PublicParamsDataType;
  private readonly _tfhePkeParams: TFHEPkeParams;

  private constructor(params: {
    relayerProvider: RelayerV1Provider;
    publicKeyData: RelayerV1PublicKeyDataType;
    publicParamsData: RelayerV1PublicParamsDataType;
    fhevmHostChain: FhevmHostChain;
  }) {
    super(params);

    this._relayerProvider = params.relayerProvider;
    this._publicKeyData = params.publicKeyData;
    this._publicParamsData = params.publicParamsData;

    this._tfhePkeParams = TFHEPkeParams.fromWasm({
      publicKey: {
        id: this._publicKeyData.publicKeyId,
        wasm: this._publicKeyData.publicKey,
      },
      pkeCrs2048: {
        id: this._publicParamsData[2048].publicParamsId,
        wasm: this._publicParamsData[2048].publicParams,
        capacity: 2048,
      },
    });
  }

  public override get version(): 1 | 2 {
    return 1;
  }

  public override get tfhePkeParams(): TFHEPkeParams {
    return this._tfhePkeParams;
  }

  public static async fromConfig(
    config: FhevmInstanceConfig & {
      relayerVersionUrl: string;
    },
  ): Promise<RelayerV1Fhevm> {
    const relayerProvider = new RelayerV1Provider({
      relayerUrl: config.relayerVersionUrl,
      ...(config.auth !== undefined ? { auth: config.auth } : {}),
    });
    const publicKeyData = await getTfheCompactPublicKey(config);
    const publicParamsData = await getPublicParams(config);

    // Create FhevmHostChain
    const cfg: FhevmHostChainConfig =
      FhevmHostChainConfig.fromUserConfig(config);
    const fhevmHostChain: FhevmHostChain = await cfg.loadFromChain();

    return new RelayerV1Fhevm({
      relayerProvider,
      publicKeyData,
      publicParamsData,
      fhevmHostChain,
    });
  }

  public get relayerProvider(): RelayerV1Provider {
    return this._relayerProvider;
  }

  public override getPublicKeyBytes(): {
    id: string;
    bytes: Uint8Array;
  } {
    return {
      id: this._publicKeyData.publicKeyId,
      bytes: this._publicKeyData.publicKey.safe_serialize(
        SERIALIZED_SIZE_LIMIT_PK,
      ),
    };
  }

  public override getPublicKeyWasm(): {
    id: string;
    wasm: TfheCompactPublicKeyWasmType;
  } {
    return {
      id: this._publicKeyData.publicKeyId,
      wasm: this._publicKeyData.publicKey,
    };
  }

  public override supportsCapacity(capacity: number): boolean {
    return capacity === 2048;
  }

  public override getPkeCrsBytesForCapacity<C extends number>(
    capacity: C,
  ): {
    capacity: C;
    id: string;
    bytes: Uint8Array;
  } {
    if ((capacity as unknown) === undefined) {
      throw new Error(`Missing PublicParams bits format`);
    }
    if (capacity !== 2048) {
      throw new Error(`Unsupported PublicParams bits format '${capacity}'`);
    }

    const res = {
      capacity,
      id: this._publicParamsData['2048'].publicParamsId,
      bytes: this._publicParamsData['2048'].publicParams.safe_serialize(
        SERIALIZED_SIZE_LIMIT_CRS,
      ),
    };
    return res;
  }

  public override getPkeCrsWasmForCapacity<C extends number>(
    capacity: C,
  ): {
    capacity: C;
    id: string;
    wasm: CompactPkeCrsWasmType;
  } {
    if ((capacity as unknown) === undefined) {
      throw new Error(`Missing PublicParams bits format`);
    }
    if (capacity !== 2048) {
      throw new Error(`Unsupported PublicParams bits format '${capacity}'`);
    }

    return {
      capacity,
      id: this._publicParamsData['2048'].publicParamsId,
      wasm: this._publicParamsData['2048'].publicParams,
    };
  }
}
