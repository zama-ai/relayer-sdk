"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userDecryptActions = exports.decryptActions = exports.tkmsKeyActions = void 0;
exports.decryptAndReconstruct = decryptAndReconstruct;
exports.generateTkmsPrivateKey = generateTkmsPrivateKey;
exports.getTkmsPublicKeyHex = getTkmsPublicKeyHex;
exports.serializeTkmsPrivateKey = serializeTkmsPrivateKey;
exports.deserializeTkmsPrivateKey = deserializeTkmsPrivateKey;
exports.verifyTkmsPrivateKey = verifyTkmsPrivateKey;
async function decryptAndReconstruct(_runtime, _parameters) {
    throw new Error("Not yet implemented");
}
async function generateTkmsPrivateKey(_runtime) {
    throw new Error("Not yet implemented");
}
async function getTkmsPublicKeyHex(_runtime, _parameters) {
    throw new Error("Not yet implemented");
}
async function serializeTkmsPrivateKey(_runtime, _parameters) {
    throw new Error("Not yet implemented");
}
async function deserializeTkmsPrivateKey(_runtime, _parameters) {
    throw new Error("Not yet implemented");
}
function verifyTkmsPrivateKey(_runtime, _parameters) {
    throw new Error("Not yet implemented");
}
const tkmsKeyActions = (runtime) => {
    return Object.freeze({
        tkmsKey: Object.freeze({
            initTkmsModule: () => Promise.resolve(),
            generateTkmsPrivateKey: () => generateTkmsPrivateKey(runtime),
            serializeTkmsPrivateKey: (args) => serializeTkmsPrivateKey(runtime, args),
            deserializeTkmsPrivateKey: (args) => deserializeTkmsPrivateKey(runtime, args),
            verifyTkmsPrivateKey: (args) => {
                verifyTkmsPrivateKey(runtime, args);
            },
        }),
    });
};
exports.tkmsKeyActions = tkmsKeyActions;
const decryptActions = (runtime) => {
    return Object.freeze({
        decrypt: Object.freeze({
            initTkmsModule: () => Promise.resolve(),
            decryptAndReconstruct: (args) => decryptAndReconstruct(runtime, args),
            getTkmsPublicKeyHex: (args) => getTkmsPublicKeyHex(runtime, args),
            serializeTkmsPrivateKey: (args) => serializeTkmsPrivateKey(runtime, args),
        }),
    });
};
exports.decryptActions = decryptActions;
const userDecryptActions = (runtime, parameters) => {
    const { privateKey } = parameters;
    return Object.freeze({
        userDecrypt: Object.freeze({
            initTkmsModule: () => Promise.resolve(),
            decryptAndReconstruct: (args) => decryptAndReconstruct(runtime, {
                ...args,
                tkmsPrivateKey: privateKey,
            }),
            getTkmsPublicKeyHex: () => getTkmsPublicKeyHex(runtime, {
                tkmsPrivateKey: privateKey,
            }),
            serializeTkmsPrivateKey: () => serializeTkmsPrivateKey(runtime, {
                tkmsPrivateKey: privateKey,
            }),
        }),
    });
};
exports.userDecryptActions = userDecryptActions;
//# sourceMappingURL=mock.js.map