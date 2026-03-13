import type { ErrorMetadataParams } from "../base/errors/ErrorBase.js";
import type { EthereumModule } from "../modules/ethereum/types.js";
import type { WithRelayerModule } from "../modules/relayer/types.js";
import type { WithEncryptModule } from "../modules/encrypt/types.js";
import type { FhevmRuntime, FhevmRuntimeConfig } from "../types/coreFhevmRuntime.js";
import type { WithDecryptModule, WithTkmsKeyModule } from "../modules/decrypt/types.js";
type WithModuleMap = {
    decrypt: WithDecryptModule;
    encrypt: WithEncryptModule;
    relayer: WithRelayerModule;
    tkmsKey: WithTkmsKeyModule;
};
export type CreateFhevmRuntimeParameters = {
    readonly ethereum: EthereumModule;
    readonly config: FhevmRuntimeConfig;
};
export declare function createFhevmRuntime(ownerToken: symbol, parameters: CreateFhevmRuntimeParameters): FhevmRuntime;
export declare function isFhevmRuntime(value: unknown): value is FhevmRuntime;
export declare function assertIsFhevmRuntime(value: unknown, options: {
    subject?: string;
} & ErrorMetadataParams): asserts value is FhevmRuntime;
export declare function verifyFhevmRuntime(value: unknown, ownerToken: symbol): asserts value is FhevmRuntime;
export declare function asFhevmRuntimeWith<K extends keyof WithModuleMap>(fhevmRuntime: FhevmRuntime, moduleName: K): FhevmRuntime & WithModuleMap[K];
export declare function assertOwnedBy(parameters: {
    actualOwner: WeakRef<object>;
    expectedOwner: object;
    name: string;
}): void;
export {};
//# sourceMappingURL=CoreFhevmRuntime-p.d.ts.map