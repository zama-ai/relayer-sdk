////////////////////////////////////////////////////////////////////////////////
// decryptAndReconstruct
////////////////////////////////////////////////////////////////////////////////
export async function decryptAndReconstruct(_runtime, _parameters) {
    throw new Error("Not yet implemented");
}
//////////////////////////////////////////////////////////////////////////////
// generateTkmsPrivateKey
//////////////////////////////////////////////////////////////////////////////
export async function generateTkmsPrivateKey(_runtime) {
    throw new Error("Not yet implemented");
}
//////////////////////////////////////////////////////////////////////////////
// getTkmsPublicKeyHex
//////////////////////////////////////////////////////////////////////////////
export async function getTkmsPublicKeyHex(_runtime, _parameters) {
    throw new Error("Not yet implemented");
}
//////////////////////////////////////////////////////////////////////////////
// serializeTkmsPrivateKey
//////////////////////////////////////////////////////////////////////////////
export async function serializeTkmsPrivateKey(_runtime, _parameters) {
    throw new Error("Not yet implemented");
}
//////////////////////////////////////////////////////////////////////////////
// deserializeTkmsPrivateKey
//////////////////////////////////////////////////////////////////////////////
export async function deserializeTkmsPrivateKey(_runtime, _parameters) {
    throw new Error("Not yet implemented");
}
//////////////////////////////////////////////////////////////////////////////
// verifyTkmsPrivateKey
//////////////////////////////////////////////////////////////////////////////
export function verifyTkmsPrivateKey(_runtime, _parameters) {
    throw new Error("Not yet implemented");
}
//////////////////////////////////////////////////////////////////////////////
// tkmsActions
//////////////////////////////////////////////////////////////////////////////
export const tkmsKeyActions = (runtime) => {
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
//////////////////////////////////////////////////////////////////////////////
// decryptActions
//////////////////////////////////////////////////////////////////////////////
export const decryptActions = (runtime) => {
    return Object.freeze({
        decrypt: Object.freeze({
            initTkmsModule: () => Promise.resolve(),
            decryptAndReconstruct: (args) => decryptAndReconstruct(runtime, args),
            getTkmsPublicKeyHex: (args) => getTkmsPublicKeyHex(runtime, args),
            serializeTkmsPrivateKey: (args) => serializeTkmsPrivateKey(runtime, args),
        }),
    });
};
//////////////////////////////////////////////////////////////////////////////
// userDecryptActions
//////////////////////////////////////////////////////////////////////////////
export const userDecryptActions = (runtime, parameters) => {
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
//# sourceMappingURL=mock.js.map