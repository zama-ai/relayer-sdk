import type { FhevmRuntime } from "../types/coreFhevmRuntime.js";
import type { GlobalFheCrs, GlobalFhePkeParams, GlobalFhePublicKey } from "../types/globalFhePkeParams.js";
export declare function createGlobalFhePkeParams(owner: WeakRef<FhevmRuntime>, parameters: {
    readonly publicKey: GlobalFhePublicKey;
    readonly crs: GlobalFheCrs;
}): GlobalFhePkeParams;
/**
 * Verifies that the given `GlobalFhePkeParams` instance is owned
 * by the given runtime. Throws if not.
 */
export declare function assertGlobalFhePkeParamsOwnedBy(data: GlobalFhePkeParams, owner: FhevmRuntime): void;
//# sourceMappingURL=GlobalFhePkeParams-p.d.ts.map