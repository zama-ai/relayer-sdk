import { encrypt, } from "../../actions/encrypt/encrypt.js";
import { fetchGlobalFhePkeParams, } from "../../actions/key/fetchGlobalFhePkeParams.js";
import { fetchGlobalFhePkeParamsBytes, } from "../../actions/key/fetchGlobalFhePkeParamsBytes.js";
export function encryptActions(fhevm) {
    return {
        encrypt: (parameters) => encrypt(fhevm, parameters),
        fetchGlobalFhePkeParams: (parameters) => fetchGlobalFhePkeParams(fhevm, parameters),
        fetchGlobalFhePkeParamsBytes: (parameters) => fetchGlobalFhePkeParamsBytes(fhevm, parameters),
    };
}
//# sourceMappingURL=encrypt.js.map