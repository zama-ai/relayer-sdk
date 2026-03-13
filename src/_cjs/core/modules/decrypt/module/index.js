"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userDecryptModule = exports.decryptModule = exports.tkmsKeyModule = void 0;
const api_p_js_1 = require("./api-p.js");
const init_p_js_1 = require("./init-p.js");
const tkmsKeyModule = (runtime) => {
    return Object.freeze({
        tkmsKey: Object.freeze({
            initTkmsModule: () => (0, init_p_js_1.initTkmsModule)(runtime),
            generateTkmsPrivateKey: () => (0, api_p_js_1.generateTkmsPrivateKey)(runtime),
            serializeTkmsPrivateKey: (args) => (0, api_p_js_1.serializeTkmsPrivateKey)(runtime, args),
            deserializeTkmsPrivateKey: (args) => (0, api_p_js_1.deserializeTkmsPrivateKey)(runtime, args),
            verifyTkmsPrivateKey: (args) => {
                (0, api_p_js_1.verifyTkmsPrivateKey)(runtime, args);
            },
        }),
    });
};
exports.tkmsKeyModule = tkmsKeyModule;
const decryptModule = (runtime) => {
    return Object.freeze({
        decrypt: Object.freeze({
            initTkmsModule: () => (0, init_p_js_1.initTkmsModule)(runtime),
            decryptAndReconstruct: (args) => (0, api_p_js_1.decryptAndReconstruct)(runtime, args),
            getTkmsPublicKeyHex: (args) => (0, api_p_js_1.getTkmsPublicKeyHex)(runtime, args),
            serializeTkmsPrivateKey: (args) => (0, api_p_js_1.serializeTkmsPrivateKey)(runtime, args),
        }),
    });
};
exports.decryptModule = decryptModule;
const userDecryptModule = (runtime, parameters) => {
    const { privateKey } = parameters;
    return Object.freeze({
        userDecrypt: Object.freeze({
            initTkmsModule: () => (0, init_p_js_1.initTkmsModule)(runtime),
            decryptAndReconstruct: (args) => (0, api_p_js_1.decryptAndReconstruct)(runtime, {
                ...args,
                tkmsPrivateKey: privateKey,
            }),
            getTkmsPublicKeyHex: () => (0, api_p_js_1.getTkmsPublicKeyHex)(runtime, {
                tkmsPrivateKey: privateKey,
            }),
            serializeTkmsPrivateKey: () => (0, api_p_js_1.serializeTkmsPrivateKey)(runtime, {
                tkmsPrivateKey: privateKey,
            }),
        }),
    });
};
exports.userDecryptModule = userDecryptModule;
//# sourceMappingURL=index.js.map