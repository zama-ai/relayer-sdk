//import type { TrustedClient } from "../modules/ethereum/types.js";
import type { FhevmChain } from "./fhevmChain.js";
import type { FhevmRuntime } from "./coreFhevmRuntime.js";

export type FhevmOptions = {
  readonly batchRpcCalls?: boolean;
};

export type NativeClient = NonNullable<object>;
export type OptionalNativeClient = NativeClient | undefined;
export type OptionalFhevmChain = FhevmChain | undefined;

export type Actions = Record<string, (...args: never[]) => unknown>;

export type FhevmExtension<
  actions extends Record<string, unknown> = Record<string, unknown>,
  runtime extends FhevmRuntime = FhevmRuntime,
> = {
  readonly actions: actions;
  readonly runtime: runtime;
  readonly init?:
    | ((
        client: FhevmBase<
          FhevmChain | undefined,
          FhevmRuntime,
          OptionalNativeClient
        >,
      ) => Promise<void>)
    | undefined;
};

export interface FhevmBase<
  chain extends FhevmChain | undefined = FhevmChain | undefined,
  runtime extends FhevmRuntime = FhevmRuntime,
  client extends OptionalNativeClient = NativeClient,
> {
  readonly uid: string;
  readonly chain: chain; // undefined when no chain
  readonly runtime: runtime;
  readonly client: client; // undefined when no host
  readonly options?: FhevmOptions;
}

export interface Fhevm<
  chain extends FhevmChain | undefined = FhevmChain | undefined,
  runtime extends FhevmRuntime = FhevmRuntime,
  client extends OptionalNativeClient = NativeClient,
> extends FhevmBase<chain, runtime, client> {
  readonly extend: <
    const actions extends Record<string, unknown>,
    extendedRuntime extends FhevmRuntime,
  >(
    actionsFactory: (
      client: FhevmBase<chain, FhevmRuntime, client>,
    ) => FhevmExtension<actions, extendedRuntime>,
  ) => this & actions & { readonly runtime: extendedRuntime };
  readonly init: () => Promise<void>;
  readonly ready: Promise<void>;
}
