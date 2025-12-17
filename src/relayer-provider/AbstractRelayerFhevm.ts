import type { TFHEType } from '../tfheType';
import { AbstractRelayerProvider } from './AbstractRelayerProvider';

export abstract class AbstractRelayerFhevm {
  public abstract get version(): number;
  public abstract get relayerVersionUrl(): string;
  public abstract get relayerProvider(): AbstractRelayerProvider;
  public abstract getPublicKeyBytes(): {
    publicKey: Uint8Array;
    publicKeyId: string;
  };
  public abstract getPublicKeyWasm(): {
    publicKey: TFHEType['TfheCompactPublicKey'];
    publicKeyId: string;
  };
  public abstract getPublicParamsBytes(bits: number): {
    publicParams: Uint8Array;
    publicParamsId: string;
  };
  public abstract getPublicParamsWasm(bits: number): {
    publicParams: TFHEType['CompactPkeCrs'];
    publicParamsId: string;
  };
}
