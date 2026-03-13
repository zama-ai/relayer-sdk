import { deserializeGlobalFhePkeParams } from "../runtime/deserializeGlobalFhePkeParams.js";
import { fetchGlobalFhePkeParams } from "./fetchGlobalFhePkeParams.js";
export async function resolveGlobalFhePkeParams(fhevm, parameters) {
    // Defensive test
    if (parameters.globalFheParamsBytes != null) {
        try {
            return await deserializeGlobalFhePkeParams(fhevm, parameters.globalFheParamsBytes);
        }
        catch {
            // Silent catch.
            // If the provided params are invalid, fall through to fetching from the relayer.
        }
    }
    return await fetchGlobalFhePkeParams(fhevm, {
        ignoreCache: parameters.ignoreCache,
        options: parameters.options,
    });
}
//# sourceMappingURL=resolveGlobalFhePkeParams.js.map