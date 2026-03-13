import type { FhevmChain } from "./fhevmChain.js";
import type { FhevmRuntime } from "./coreFhevmRuntime.js";
export type FhevmOptions = {
    readonly batchRpcCalls?: boolean;
};
export type NativeClient = NonNullable<object>;
export type OptionalNativeClient = NativeClient | undefined;
export type OptionalFhevmChain = FhevmChain | undefined;
export type Fhevm<chain extends FhevmChain | undefined = FhevmChain | undefined, runtime extends FhevmRuntime = FhevmRuntime, client extends OptionalNativeClient = NativeClient> = {
    readonly uid: string;
    readonly chain: chain;
    readonly runtime: runtime;
    readonly client: client;
    readonly options?: FhevmOptions;
};
//# sourceMappingURL=coreFhevmClient.d.ts.map