import type {
  CompactPkeCrsWasmType,
  TfheCompactPublicKeyWasmType,
} from '@sdk/lowlevel/public-api';
import type { FhevmInstanceConfig } from '../../types/relayer';
import type { FhevmHostChain } from '@sdk/fhevmHostChain';
import { TFHEPkeParams } from '@sdk/lowlevel/TFHEPkeParams';
import { AbstractRelayerFhevm } from '../AbstractRelayerFhevm';
import { RelayerV2Provider } from './RelayerV2Provider';
import { FhevmHostChainConfig } from '@sdk/fhevmHostChain';

export class RelayerV2Fhevm extends AbstractRelayerFhevm {
  readonly #relayerProvider: RelayerV2Provider;
  readonly #tfhePkeParams: TFHEPkeParams;

  private constructor(params: {
    relayerProvider: RelayerV2Provider;
    tfhePkeParams: TFHEPkeParams;
    fhevmHostChain: FhevmHostChain;
  }) {
    super(params);

    this.#relayerProvider = params.relayerProvider;
    this.#tfhePkeParams = params.tfhePkeParams;
  }

  public override get version(): 1 | 2 {
    return 2;
  }

  public override get tfhePkeParams(): TFHEPkeParams {
    return this.#tfhePkeParams;
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
    config: FhevmInstanceConfig & {
      relayerVersionUrl: string;
    },
  ): Promise<RelayerV2Fhevm> {
    const relayerProvider = new RelayerV2Provider(config.relayerVersionUrl);

    const tfhePkeParams =
      TFHEPkeParams.tryFromFhevmPkeConfig(config) ??
      (await relayerProvider.fetchTFHEPkeParams());

    // Create FhevmHostChain
    const cfg: FhevmHostChainConfig =
      FhevmHostChainConfig.fromUserConfig(config);
    const fhevmHostChain: FhevmHostChain = await cfg.loadFromChain();

    return new RelayerV2Fhevm({
      relayerProvider,
      tfhePkeParams,
      fhevmHostChain,
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
    wasm: TfheCompactPublicKeyWasmType;
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
    wasm: CompactPkeCrsWasmType;
  } {
    const w = this.#tfhePkeParams.getTFHEPkeCrs().getWasmForCapacity(capacity);
    return {
      capacity,
      id: w.id,
      wasm: w.wasm,
    };
  }
}
