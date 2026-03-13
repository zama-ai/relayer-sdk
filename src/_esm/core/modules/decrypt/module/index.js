import { decryptAndReconstruct, deserializeTkmsPrivateKey, generateTkmsPrivateKey, getTkmsPublicKeyHex, serializeTkmsPrivateKey, verifyTkmsPrivateKey, } from "./api-p.js";
import { initTkmsModule } from "./init-p.js";
//////////////////////////////////////////////////////////////////////////////
// tkmsKeysModule
//////////////////////////////////////////////////////////////////////////////
export const tkmsKeyModule = (runtime) => {
    return Object.freeze({
        tkmsKey: Object.freeze({
            initTkmsModule: () => initTkmsModule(runtime),
            generateTkmsPrivateKey: () => generateTkmsPrivateKey(runtime),
            serializeTkmsPrivateKey: (args) => serializeTkmsPrivateKey(runtime, args),
            deserializeTkmsPrivateKey: (args) => deserializeTkmsPrivateKey(runtime, args),
            verifyTkmsPrivateKey: (args) => {
                verifyTkmsPrivateKey(runtime, args);
            },
        }),
    });
};
//////////////////////////////////////////////////////////////////////////////
// decryptModule
//////////////////////////////////////////////////////////////////////////////
export const decryptModule = (runtime) => {
    return Object.freeze({
        decrypt: Object.freeze({
            initTkmsModule: () => initTkmsModule(runtime),
            decryptAndReconstruct: (args) => decryptAndReconstruct(runtime, args),
            getTkmsPublicKeyHex: (args) => getTkmsPublicKeyHex(runtime, args),
            serializeTkmsPrivateKey: (args) => serializeTkmsPrivateKey(runtime, args),
        }),
    });
};
//////////////////////////////////////////////////////////////////////////////
// userDecryptModue
//////////////////////////////////////////////////////////////////////////////
export const userDecryptModule = (runtime, parameters) => {
    const { privateKey } = parameters;
    return Object.freeze({
        userDecrypt: Object.freeze({
            initTkmsModule: () => initTkmsModule(runtime),
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
//# sourceMappingURL=index.js.map