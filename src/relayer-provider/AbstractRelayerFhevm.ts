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
  public abstract getPublicParamsBytesForBits(bits: number): {
    publicParams: Uint8Array;
    publicParamsId: string;
  };
  public abstract getPublicParamsWasmForBits(bits: number): {
    publicParams: TFHEType['CompactPkeCrs'];
    publicParamsId: string;
  };
  public abstract getPublicKeyInfo(): { id: string; srcUrl?: string };
  public abstract getPublicParamsInfo(): {
    id: string;
    bits: number;
    srcUrl?: string;
  };
}
