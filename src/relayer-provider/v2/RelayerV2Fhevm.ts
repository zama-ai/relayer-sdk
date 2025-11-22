import type { TFHEType } from '../../tfheType';
import { AbstractRelayerFhevm } from '../AbstractRelayerFhevm';
import { RelayerV2Provider } from './RelayerV2Provider';
import { RelayerV2PublicKey } from './RelayerV2PublicKey';
import type { RelayerV2GetResponseKeyUrl } from './types/types';

export class RelayerV2Fhevm extends AbstractRelayerFhevm {
  private readonly _relayerProvider: RelayerV2Provider;
  private readonly _relayerPublicKey: RelayerV2PublicKey;

  private constructor(params: {
    relayerProvider: RelayerV2Provider;
    relayerPublicKey: RelayerV2PublicKey;
  }) {
    super();
    this._relayerProvider = params.relayerProvider;
    this._relayerPublicKey = params.relayerPublicKey;
  }

  public get version(): number {
    return 2;
  }

  public get relayerVersionUrl(): string {
    return this.relayerProvider.url;
  }

  public static async fromConfig(config: {
    relayerVersionUrl: string;
    publicKey?: unknown;
    publicParams?: unknown;
  }) {
    const relayerProvider = new RelayerV2Provider(config.relayerVersionUrl);

    let relayerPublicKey = RelayerV2PublicKey.tryFromBytes(config);

    if (!relayerPublicKey) {
      const response: RelayerV2GetResponseKeyUrl =
        await relayerProvider.fetchGetKeyUrl();
      relayerPublicKey = await RelayerV2PublicKey.fromRelayerResponse(response);
    }

    return new RelayerV2Fhevm({
      relayerProvider,
      relayerPublicKey,
    });
  }

  public get relayerProvider(): RelayerV2Provider {
    return this._relayerProvider;
  }

  public override getPublicKeyBytes(): {
    publicKeyId: string;
    publicKey: Uint8Array;
  } {
    return this._relayerPublicKey.getTFHEPublicKey().toPublicKeyBytes();
  }

  public override getPublicKeyWasm(): {
    publicKeyId: string;
    publicKey: TFHEType['TfheCompactPublicKey'];
  } {
    return this._relayerPublicKey.getTFHEPublicKey().toPublicKeyWasm();
  }

  public override getPublicParamsBytes(bits: number): {
    publicParams: Uint8Array;
    publicParamsId: string;
  } {
    if (bits !== 2048) {
      throw new Error(`Unsupported PublicParams bits format ${bits}`);
    }
    return this._relayerPublicKey.getTFHECrs().toPublicParamsBytes()['2048'];
  }

  public override getPublicParamsWasm(bits: number): {
    publicParamsId: string;
    publicParams: TFHEType['CompactPkeCrs'];
  } {
    if (bits !== 2048) {
      throw new Error(`Unsupported PublicParams bits format ${bits}`);
    }
    return this._relayerPublicKey.getTFHECrs().toPublicParamsWasm()['2048'];
  }
}
