"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFhevmDecryptionKey = isFhevmDecryptionKey;
exports.assertIsFhevmDecryptionKey = assertIsFhevmDecryptionKey;
exports.createFhevmDecryptionKey = createFhevmDecryptionKey;
const bytes_js_1 = require("../base/bytes.js");
const InvalidTypeError_js_1 = require("../base/errors/InvalidTypeError.js");
class FhevmDecryptionKeyImpl {
    constructor(parameters) {
        Object.defineProperty(this, "decryptAndReconstruct", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "getTkmsPublicKeyHex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.decryptAndReconstruct = parameters.decryptAndReconstruct;
        this.getTkmsPublicKeyHex = parameters.getTkmsPublicKeyHex;
        Object.freeze(this);
    }
}
Object.freeze(FhevmDecryptionKeyImpl);
Object.freeze(FhevmDecryptionKeyImpl.prototype);
function isFhevmDecryptionKey(value) {
    return value instanceof FhevmDecryptionKeyImpl;
}
function assertIsFhevmDecryptionKey(value, options) {
    if (!isFhevmDecryptionKey(value)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "FhevmDecryptionKey",
        }, options);
    }
}
async function createFhevmDecryptionKey(fhevmRuntime, parameters) {
    let tkmsPrivateKey;
    if ((0, bytes_js_1.isBytes)(parameters.tkmsPrivateKey)) {
        tkmsPrivateKey = await fhevmRuntime.tkmsKey.deserializeTkmsPrivateKey({
            tkmsPrivateKeyBytes: parameters.tkmsPrivateKey,
        });
    }
    else {
        tkmsPrivateKey = parameters.tkmsPrivateKey;
        fhevmRuntime.tkmsKey.verifyTkmsPrivateKey({ tkmsPrivateKey });
    }
    return new FhevmDecryptionKeyImpl({
        async decryptAndReconstruct(decryptParameters) {
            return fhevmRuntime.decrypt.decryptAndReconstruct({
                tkmsPrivateKey,
                ...decryptParameters,
            });
        },
        async getTkmsPublicKeyHex() {
            return fhevmRuntime.decrypt.getTkmsPublicKeyHex({
                tkmsPrivateKey,
            });
        },
    });
}
//# sourceMappingURL=FhevmDecryptionKey-p.js.map