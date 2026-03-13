"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFhevmUser = isFhevmUser;
exports.assertIsFhevmUser = assertIsFhevmUser;
exports.createFhevmUser = createFhevmUser;
const InvalidTypeError_js_1 = require("../base/errors/InvalidTypeError.js");
const FhevmDecryptionKey_p_js_1 = require("./FhevmDecryptionKey-p.js");
class FhevmUserImpl {
    constructor(parameters) {
        Object.defineProperty(this, "address", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "decryptionKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.address = parameters.address;
        this.decryptionKey = parameters.decryptionKey;
        Object.freeze(this);
    }
}
Object.freeze(FhevmUserImpl);
Object.freeze(FhevmUserImpl.prototype);
function isFhevmUser(value) {
    return value instanceof FhevmUserImpl;
}
function assertIsFhevmUser(value, options) {
    if (!isFhevmUser(value)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "FhevmUser",
        }, options);
    }
}
async function createFhevmUser(fhevmRuntime, parameters) {
    const decryptionKey = (0, FhevmDecryptionKey_p_js_1.isFhevmDecryptionKey)(parameters.privateKey)
        ? parameters.privateKey
        : await (0, FhevmDecryptionKey_p_js_1.createFhevmDecryptionKey)(fhevmRuntime, {
            tkmsPrivateKey: parameters.privateKey,
        });
    return new FhevmUserImpl({
        address: parameters.address,
        decryptionKey,
    });
}
//# sourceMappingURL=FhevmUser-p.js.map