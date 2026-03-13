import { fetchGlobalFhePkeParams, } from "../../actions/key/fetchGlobalFhePkeParams.js";
import { fetchGlobalFhePkeParamsBytes, } from "../../actions/key/fetchGlobalFhePkeParamsBytes.js";
import { resolveGlobalFhePkeParams, } from "../../actions/key/resolveGlobalFhePkeParams.js";
import { deserializeGlobalFhePkeParamsFromHex, } from "../../actions/runtime/deserializeGlobalFhePkeParams.js";
import { serializeGlobalFhePkeParamsToHex, } from "../../actions/runtime/serializeGlobalFhePkeParams.js";
export function globalFhePkeActions(fhevm) {
    return {
        fetchGlobalFhePkeParams: (parameters) => fetchGlobalFhePkeParams(fhevm, parameters),
        fetchGlobalFhePkeParamsBytes: (parameters) => fetchGlobalFhePkeParamsBytes(fhevm, parameters),
        deserializeGlobalFhePkeParamsFromHex: (parameters) => deserializeGlobalFhePkeParamsFromHex(fhevm, parameters),
        serializeGlobalFhePkeParamsToHex: (parameters) => serializeGlobalFhePkeParamsToHex(fhevm, parameters),
        resolveGlobalFhePkeParams: (parameters) => resolveGlobalFhePkeParams(fhevm, parameters),
    };
}
//# sourceMappingURL=globalFhePke.js.map