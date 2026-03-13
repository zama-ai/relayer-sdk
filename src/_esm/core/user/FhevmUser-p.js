import { InvalidTypeError } from "../base/errors/InvalidTypeError.js";
import { createFhevmDecryptionKey, isFhevmDecryptionKey, } from "./FhevmDecryptionKey-p.js";
////////////////////////////////////////////////////////////////////////////////
// FhevmUserImpl
//
// Unexported class wrapping an address and a FhevmDecryptionKey.
// - Class: enables instanceof checks (isFhevmUser)
// - Frozen: instance, class, and prototype are all immutable
// - Tree-shakable: unused exports are eliminated by bundlers
// - No this pitfalls: properties are plain readonly values
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
////////////////////////////////////////////////////////////////////////////////
/** Type guard: returns true if value was created by {@link createFhevmUser}. */
export function isFhevmUser(value) {
    return value instanceof FhevmUserImpl;
}
////////////////////////////////////////////////////////////////////////////////
/** Throws {@link InvalidTypeError} if value is not a valid {@link FhevmUser}. */
export function assertIsFhevmUser(value, options) {
    if (!isFhevmUser(value)) {
        throw new InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "FhevmUser",
        }, options);
    }
}
////////////////////////////////////////////////////////////////////////////////
/** Creates a {@link FhevmUser} by binding an address and a private key into an immutable object. */
export async function createFhevmUser(fhevmRuntime, parameters) {
    const decryptionKey = isFhevmDecryptionKey(parameters.privateKey)
        ? parameters.privateKey
        : await createFhevmDecryptionKey(fhevmRuntime, {
            tkmsPrivateKey: parameters.privateKey,
        });
    return new FhevmUserImpl({
        address: parameters.address,
        decryptionKey,
    });
}
////////////////////////////////////////////////////////////////////////////////
//# sourceMappingURL=FhevmUser-p.js.map