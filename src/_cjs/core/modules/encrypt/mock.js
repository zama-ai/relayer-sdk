"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptActions = void 0;
exports.parseTFHEProvenCompactCiphertextList = parseTFHEProvenCompactCiphertextList;
exports.buildWithProofPacked = buildWithProofPacked;
exports.serializeGlobalFhePkeParams = serializeGlobalFhePkeParams;
exports.serializeGlobalFhePublicKey = serializeGlobalFhePublicKey;
exports.serializeGlobalFheCrs = serializeGlobalFheCrs;
exports.deserializeGlobalFheCrs = deserializeGlobalFheCrs;
exports.deserializeGlobalFhePublicKey = deserializeGlobalFhePublicKey;
async function parseTFHEProvenCompactCiphertextList(_parameters) {
    throw new Error("Not yet implemented");
}
async function buildWithProofPacked(_parameters) {
    throw new Error("Not yet implemented");
}
async function serializeGlobalFhePkeParams(_parameters) {
    throw new Error("Not yet implemented");
}
async function serializeGlobalFhePublicKey(_parameters) {
    throw new Error("Not yet implemented");
}
async function serializeGlobalFheCrs(_parameters) {
    throw new Error("Not yet implemented");
}
async function deserializeGlobalFheCrs(_parameters) {
    throw new Error("Not yet implemented");
}
async function deserializeGlobalFhePublicKey(_parameters) {
    throw new Error("Not yet implemented");
}
const encryptActions = (_runtime) => {
    return Object.freeze({
        encrypt: Object.freeze({
            initTfheModule: () => Promise.resolve(),
            parseTFHEProvenCompactCiphertextList,
            buildWithProofPacked,
            serializeGlobalFhePkeParams,
            serializeGlobalFhePublicKey,
            serializeGlobalFheCrs,
            deserializeGlobalFhePublicKey,
            deserializeGlobalFheCrs,
        }),
    });
};
exports.encryptActions = encryptActions;
//# sourceMappingURL=mock.js.map