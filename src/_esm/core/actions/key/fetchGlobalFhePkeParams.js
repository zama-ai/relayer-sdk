import { deserializeGlobalFhePkeParams } from "../runtime/deserializeGlobalFhePkeParams.js";
import { fetchGlobalFhePkeParamsBytes } from "./fetchGlobalFhePkeParamsBytes.js";
////////////////////////////////////////////////////////////////////////////////
export async function fetchGlobalFhePkeParams(fhevm, parameters) {
    const paramsBytes = await fetchGlobalFhePkeParamsBytes(fhevm, parameters);
    return deserializeGlobalFhePkeParams(fhevm, paramsBytes);
}
//# sourceMappingURL=fetchGlobalFhePkeParams.js.map