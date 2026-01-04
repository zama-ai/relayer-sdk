import type {
  CompactPkeCrsWasmType,
  TfheCompactPublicKeyWasmType,
} from '@sdk/lowlevel/types';
import type { AbstractRelayerProvider } from './AbstractRelayerProvider';
import type { FhevmHostChain } from '@sdk/fhevmHostChain';

export abstract class AbstractRelayerFhevm {
  readonly #fhevmHostChain: FhevmHostChain;

  constructor(params: { fhevmHostChain: FhevmHostChain }) {
    this.#fhevmHostChain = params.fhevmHostChain;
  }

  public get fhevmHostChain(): FhevmHostChain {
    return this.#fhevmHostChain;
  }

  public abstract get version(): 1 | 2;
  public abstract get relayerVersionUrl(): string;
  public abstract get relayerProvider(): AbstractRelayerProvider;
  public abstract getPublicKeyBytes(): {
    id: string;
    bytes: Uint8Array;
  };
  public abstract getPublicKeyWasm(): {
    id: string;
    wasm: TfheCompactPublicKeyWasmType;
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
    wasm: CompactPkeCrsWasmType;
  };
}
