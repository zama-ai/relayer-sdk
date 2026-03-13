import type { Fhevm, FhevmOptions, OptionalNativeClient } from "../types/coreFhevmClient.js";
import type { FhevmRuntime } from "../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../types/fhevmChain.js";
export type CreateFhevmParameters<chain extends FhevmChain | undefined = FhevmChain | undefined, runtime extends FhevmRuntime = FhevmRuntime, client extends OptionalNativeClient = OptionalNativeClient> = {
    readonly chain?: chain | undefined;
    readonly client?: client | undefined;
    readonly runtime: runtime;
    readonly options?: FhevmOptions | undefined;
};
export declare function createFhevm<chain extends FhevmChain | undefined = FhevmChain | undefined, runtime extends FhevmRuntime = FhevmRuntime, client extends OptionalNativeClient = OptionalNativeClient>(ownerToken: symbol, parameters: CreateFhevmParameters<chain, runtime, client>): Fhevm<chain, runtime, client>;
//# sourceMappingURL=fhevm.d.ts.map