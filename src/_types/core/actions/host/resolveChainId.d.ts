import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { Uint64BigInt } from "../../types/primitives.js";
export type ResolveChainIdParameters = {
    readonly id?: number | bigint | undefined;
    readonly verify?: boolean;
};
export type ResolveChainIdReturnType = Uint64BigInt;
export declare function resolveChainId(fhevm: Fhevm, parameters: ResolveChainIdParameters): Promise<ResolveChainIdReturnType>;
//# sourceMappingURL=resolveChainId.d.ts.map