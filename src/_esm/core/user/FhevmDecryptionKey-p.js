import { isBytes } from "../base/bytes.js";
import { InvalidTypeError } from "../base/errors/InvalidTypeError.js";
////////////////////////////////////////////////////////////////////////////////
// FhevmDecryptionKeyImpl
//
// Unexported class wrapping closures that bind a tkmsPrivateKey.
// - Class: enables instanceof checks (isFhevmDecryptionKey)
// - Closures: methods capture privateKey without exposing it
// - Frozen: instance, class, and prototype are all immutable
// - Tree-shakable: unused exports are eliminated by bundlers
// - No this pitfalls: methods are own properties, not prototype-bound
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
////////////////////////////////////////////////////////////////////////////////
/** Type guard: returns true if value was created by {@link createFhevmDecryptionKey}. */
export function isFhevmDecryptionKey(value) {
    return value instanceof FhevmDecryptionKeyImpl;
}
////////////////////////////////////////////////////////////////////////////////
/** Throws {@link InvalidTypeError} if value is not a valid {@link FhevmDecryptionKey}. */
export function assertIsFhevmDecryptionKey(value, options) {
    if (!isFhevmDecryptionKey(value)) {
        throw new InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "FhevmDecryptionKey",
        }, options);
    }
}
////////////////////////////////////////////////////////////////////////////////
/** Creates a {@link FhevmDecryptionKey} by binding a private key (raw bytes or deserialized) into closures. */
export async function createFhevmDecryptionKey(fhevmRuntime, parameters) {
    let tkmsPrivateKey;
    if (isBytes(parameters.tkmsPrivateKey)) {
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
////////////////////////////////////////////////////////////////////////////////
//# sourceMappingURL=FhevmDecryptionKey-p.js.map