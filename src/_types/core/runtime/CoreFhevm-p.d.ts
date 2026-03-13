import type { ErrorMetadataParams } from "../base/errors/ErrorBase.js";
import type { TrustedClient } from "../modules/ethereum/types.js";
import type { FhevmChain } from "../types/fhevmChain.js";
import type { Fhevm, FhevmOptions, OptionalNativeClient } from "../types/coreFhevmClient.js";
import type { FhevmRuntime } from "../types/coreFhevmRuntime.js";
export type FhevmClientConfig = {
    readonly chain: FhevmChain;
    readonly options?: FhevmOptions;
};
type CoreClientFhevm<chain extends FhevmChain | undefined = FhevmChain | undefined, runtime extends FhevmRuntime = FhevmRuntime, client extends NonNullable<object> = NonNullable<object>> = Fhevm<chain, runtime, client> & {
    readonly trustedClient: TrustedClient<client>;
};
type CoreFhevm<chain extends FhevmChain | undefined = FhevmChain | undefined, runtime extends FhevmRuntime = FhevmRuntime, client extends NonNullable<object> | undefined = NonNullable<object> | undefined> = Fhevm<chain, runtime, client> & (client extends NonNullable<object> ? {
    readonly trustedClient: TrustedClient<client>;
} : {
    readonly trustedClient: undefined;
});
export declare function isCoreFhevm(value: unknown): value is CoreFhevm;
export declare function isCoreClientFhevm(value: unknown): value is CoreClientFhevm;
export declare function asCoreFhevm(value: unknown): CoreFhevm;
export declare function asCoreClientFhevm(value: unknown): CoreClientFhevm;
export declare function assertIsCoreFhevm(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is CoreFhevm;
export declare function assertIsCoreClientFhevm(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is CoreClientFhevm;
export declare function getTrustedClient<chain extends FhevmChain | undefined, runtime extends FhevmRuntime, client extends NonNullable<object>>(value: Fhevm<chain, runtime, client>): TrustedClient<client>;
export type CreateCoreFhevmParameters<chain extends FhevmChain | undefined = FhevmChain | undefined, runtime extends FhevmRuntime = FhevmRuntime, client extends OptionalNativeClient = OptionalNativeClient> = {
    readonly chain?: chain | undefined;
    readonly client?: client | undefined;
    readonly runtime: runtime;
    readonly options?: FhevmOptions | undefined;
};
export declare function createCoreFhevm<chain extends FhevmChain | undefined = FhevmChain | undefined, runtime extends FhevmRuntime = FhevmRuntime, client extends OptionalNativeClient = OptionalNativeClient>(ownerToken: symbol, parameters: CreateCoreFhevmParameters<chain, runtime, client>): Fhevm<chain, runtime, client>;
type Actions = Record<string, (...args: never[]) => unknown>;
type ActionsFactory<T extends Fhevm> = (fhevmClient: T) => Actions;
export declare function extendCoreFhevm<T extends Fhevm, F extends ActionsFactory<T>>(client: T, actionsFactory: F): T & ReturnType<F>;
export {};
//# sourceMappingURL=CoreFhevm-p.d.ts.map