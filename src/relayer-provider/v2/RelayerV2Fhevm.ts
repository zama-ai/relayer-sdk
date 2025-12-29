import type { TFHEType } from '../../tfheType';
import type {
  FhevmPublicKeyType,
  FhevmPkeCrsByCapacityType,
  FhevmPkeConfigType,
} from '../../types/relayer';
import type { Prettify } from '../../utils/types';
import { TFHEPkeParams } from '../../sdk/lowlevel/TFHEPkeParams';
import { AbstractRelayerFhevm } from '../AbstractRelayerFhevm';
import { RelayerV2Provider } from './RelayerV2Provider';

export class RelayerV2Fhevm extends AbstractRelayerFhevm {
  readonly #relayerProvider: RelayerV2Provider;
  readonly #tfhePkeParams: TFHEPkeParams;

  private constructor(params: {
    relayerProvider: RelayerV2Provider;
    tfhePkeParams: TFHEPkeParams;
  }) {
    super();
    this.#relayerProvider = params.relayerProvider;
    this.#tfhePkeParams = params.tfhePkeParams;
  }

  public get version(): number {
    return 2;
  }

  public get relayerVersionUrl(): string {
    return this.relayerProvider.url;
  }

  /**
   * Creates a RelayerV2Fhevm instance from configuration.
   *
   * @param config - Configuration object
   * @param config.relayerVersionUrl - The relayer v2 API URL
   * @param config.publicKey - Optional TFHE public key ({@link FhevmPublicKeyType}). Fetched from relayer if not provided.
   * @param config.publicParams - Optional TFHE public params ({@link FhevmPkeCrsByCapacityType}). Fetched from relayer if not provided.
   * @returns A new RelayerV2Fhevm instance
   */
  public static async fromConfig(
    config: Prettify<
      {
        relayerVersionUrl: string;
      } & Partial<FhevmPkeConfigType>
    >,
  ) {
    const relayerProvider = new RelayerV2Provider(config.relayerVersionUrl);

    let relayerPublicKey = TFHEPkeParams.tryFromFhevmPkeConfig(config);
    if (!relayerPublicKey) {
      relayerPublicKey = await relayerProvider.fetchTFHEPkeParams();
    }

    // Missing:
    // Create FhevmHostChain
    // const cfg = FhevmHostChainConfig.fromUserConfig(userConfig);
    // const fhevmHostChain = await cfg.loadFromChain();
    // const fhevmHostChain = await FhevmHostChainConfig.fromUserConfig(userConfig).loadFromChain();

    return new RelayerV2Fhevm({
      relayerProvider,
      tfhePkeParams: relayerPublicKey,
    });
  }

  public get relayerProvider(): RelayerV2Provider {
    return this.#relayerProvider;
  }

  public override getPublicKeyBytes(): {
    id: string;
    bytes: Uint8Array;
  } {
    const pk = this.#tfhePkeParams.getTFHEPublicKey().toBytes();
    return {
      id: pk.id,
      bytes: pk.bytes,
    };
  }

  public override getPublicKeyWasm(): {
    id: string;
    wasm: TFHEType['TfheCompactPublicKey'];
  } {
    return {
      id: this.#tfhePkeParams.getTFHEPublicKey().id,
      wasm: this.#tfhePkeParams.getTFHEPublicKey().tfheCompactPublicKeyWasm,
    };
  }

  public override supportsCapacity(capacity: number): boolean {
    return this.#tfhePkeParams.getTFHEPkeCrs().supportsCapacity(capacity);
  }

  public override getPkeCrsBytesForCapacity<C extends number>(
    capacity: C,
  ): {
    capacity: C;
    id: string;
    bytes: Uint8Array;
  } {
    const b = this.#tfhePkeParams.getTFHEPkeCrs().getBytesForCapacity(capacity);
    return {
      capacity,
      id: b.id,
      bytes: b.bytes,
    };
  }

  public override getPkeCrsWasmForCapacity<C extends number>(
    capacity: C,
  ): {
    capacity: C;
    id: string;
    wasm: TFHEType['CompactPkeCrs'];
  } {
    const w = this.#tfhePkeParams.getTFHEPkeCrs().getWasmForCapacity(capacity);
    return {
      capacity,
      id: w.id,
      wasm: w.wasm,
    };
  }
}
