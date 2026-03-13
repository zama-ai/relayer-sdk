////////////////////////////////////////////////////////////////////////////////
// encryptModule
////////////////////////////////////////////////////////////////////////////////
import { buildWithProofPacked, deserializeGlobalFheCrs, deserializeGlobalFhePublicKey, parseTFHEProvenCompactCiphertextList, serializeGlobalFheCrs, serializeGlobalFhePkeParams, serializeGlobalFhePublicKey, } from "./api-p.js";
import { initTfheModule } from "./init-p.js";
export const encryptModule = (runtime) => {
    return Object.freeze({
        encrypt: Object.freeze({
            initTfheModule: () => initTfheModule(runtime),
            parseTFHEProvenCompactCiphertextList: (args) => parseTFHEProvenCompactCiphertextList(runtime, args),
            buildWithProofPacked: (args) => buildWithProofPacked(runtime, args),
            serializeGlobalFhePkeParams: (args) => serializeGlobalFhePkeParams(runtime, args),
            serializeGlobalFhePublicKey: (args) => serializeGlobalFhePublicKey(runtime, args),
            serializeGlobalFheCrs: (args) => serializeGlobalFheCrs(runtime, args),
            deserializeGlobalFhePublicKey: (args) => deserializeGlobalFhePublicKey(runtime, args),
            deserializeGlobalFheCrs: (args) => deserializeGlobalFheCrs(runtime, args),
        }),
    });
};
//# sourceMappingURL=index.js.map