import type { TFHEType } from '../tfheType';
import { AbstractRelayerProvider } from './AbstractRelayerProvider';

export abstract class AbstractRelayerFhevm {
  public abstract get version(): number;
  public abstract get relayerVersionUrl(): string;
  public abstract get relayerProvider(): AbstractRelayerProvider;
  public abstract getPublicKeyBytes(): {
    id: string;
    bytes: Uint8Array;
  };
  public abstract getPublicKeyWasm(): {
    id: string;
    wasm: TFHEType['TfheCompactPublicKey'];
  };
  public abstract supportsCapacity(capacity: number): boolean;
  public abstract getPkeCrsBytesForCapacity<C extends number>(
    capacity: C,
  ): {
    capacity: C;
    id: string;
    bytes: Uint8Array;
  };
  public abstract getPkeCrsWasmForCapacity<C extends number>(
    capacity: C,
  ): {
    capacity: C;
    id: string;
    wasm: TFHEType['CompactPkeCrs'];
  };
}
