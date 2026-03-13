var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _CoreFhevmImpl_uid, _CoreFhevmImpl_runtime, _CoreFhevmImpl_trustedClient, _CoreFhevmImpl_chain, _CoreFhevmImpl_options;
import { InvalidTypeError } from "../base/errors/InvalidTypeError.js";
import { verifyTrustedValue } from "../base/trustedValue.js";
import { uid } from "../base/uid.js";
import { createTrustedClient } from "../modules/ethereum/createTrustedClient.js";
////////////////////////////////////////////////////////////////////////////////
const PRIVATE_TOKEN = Symbol("CoreFhevmHostClient.token");
////////////////////////////////////////////////////////////////////////////////
// CoreFhevmImpl
////////////////////////////////////////////////////////////////////////////////
class CoreFhevmImpl {
    constructor(privateToken, ownerToken, parameters) {
        // Private fields (truly inaccessible from outside)
        _CoreFhevmImpl_uid.set(this, void 0);
        _CoreFhevmImpl_runtime.set(this, void 0);
        _CoreFhevmImpl_trustedClient.set(this, void 0);
        _CoreFhevmImpl_chain.set(this, void 0);
        _CoreFhevmImpl_options.set(this, void 0);
        if (privateToken !== PRIVATE_TOKEN) {
            throw new Error("Unauthorized");
        }
        __classPrivateFieldSet(this, _CoreFhevmImpl_runtime, parameters.runtime, "f");
        __classPrivateFieldSet(this, _CoreFhevmImpl_uid, uid(), "f");
        __classPrivateFieldSet(this, _CoreFhevmImpl_trustedClient, parameters.client !== undefined
            ? createTrustedClient(parameters.client, ownerToken)
            : undefined, "f");
        __classPrivateFieldSet(this, _CoreFhevmImpl_chain, parameters.chain, "f");
        __classPrivateFieldSet(this, _CoreFhevmImpl_options, Object.freeze(parameters.options ?? {}), "f");
        // verify runtime
        __classPrivateFieldGet(this, _CoreFhevmImpl_runtime, "f").verify(ownerToken);
        // Instance-level getters — configurable: false prevents shadowing/redefinition
        Object.defineProperties(this, {
            uid: {
                get: () => __classPrivateFieldGet(this, _CoreFhevmImpl_uid, "f"),
                configurable: false,
                enumerable: true,
            },
            chain: {
                get: () => __classPrivateFieldGet(this, _CoreFhevmImpl_chain, "f"),
                configurable: false,
                enumerable: true,
            },
            options: {
                get: () => __classPrivateFieldGet(this, _CoreFhevmImpl_options, "f"),
                configurable: false,
                enumerable: true,
            },
            trustedClient: {
                get: () => __classPrivateFieldGet(this, _CoreFhevmImpl_trustedClient, "f"),
                configurable: false,
                enumerable: true,
            },
            client: {
                get: () => __classPrivateFieldGet(this, _CoreFhevmImpl_trustedClient, "f") !== undefined
                    ? verifyTrustedValue(__classPrivateFieldGet(this, _CoreFhevmImpl_trustedClient, "f"), ownerToken)
                    : undefined,
                configurable: false,
                enumerable: true,
            },
            runtime: {
                get: () => __classPrivateFieldGet(this, _CoreFhevmImpl_runtime, "f"),
                configurable: false,
                enumerable: true,
            },
            ethereum: {
                get: () => __classPrivateFieldGet(this, _CoreFhevmImpl_runtime, "f").ethereum,
                configurable: false,
                enumerable: true,
            },
            verify: {
                value: (token) => {
                    if (token !== ownerToken) {
                        throw new Error("Unauthorized");
                    }
                },
                configurable: false,
                enumerable: false,
                writable: false,
            },
        });
    }
}
_CoreFhevmImpl_uid = new WeakMap(), _CoreFhevmImpl_runtime = new WeakMap(), _CoreFhevmImpl_trustedClient = new WeakMap(), _CoreFhevmImpl_chain = new WeakMap(), _CoreFhevmImpl_options = new WeakMap();
////////////////////////////////////////////////////////////////////////////////
Object.freeze(CoreFhevmImpl);
Object.freeze(CoreFhevmImpl.prototype);
////////////////////////////////////////////////////////////////////////////////
export function isCoreFhevm(value) {
    return value instanceof CoreFhevmImpl;
}
export function isCoreClientFhevm(value) {
    if (!isCoreFhevm(value)) {
        return false;
    }
    return value.trustedClient !== undefined;
}
////////////////////////////////////////////////////////////////////////////////
export function asCoreFhevm(value) {
    assertIsCoreFhevm(value, {});
    return value;
}
export function asCoreClientFhevm(value) {
    assertIsCoreClientFhevm(value, {});
    return value;
}
////////////////////////////////////////////////////////////////////////////////
export function assertIsCoreFhevm(value, options) {
    if (!isCoreFhevm(value)) {
        throw new InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "CoreFhevm",
        }, options);
    }
}
export function assertIsCoreClientFhevm(value, options) {
    if (!isCoreClientFhevm(value)) {
        throw new InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "CoreClientFhevm",
        }, options);
    }
}
////////////////////////////////////////////////////////////////////////////////
export function getTrustedClient(value) {
    assertIsCoreClientFhevm(value, {});
    return value.trustedClient;
}
export function createCoreFhevm(ownerToken, parameters) {
    return new CoreFhevmImpl(PRIVATE_TOKEN, ownerToken, parameters);
}
export function extendCoreFhevm(client, actionsFactory) {
    const actions = actionsFactory(client);
    for (const [key, value] of Object.entries(actions)) {
        if (key in client) {
            // Some action groups may share the same action
            continue;
            // throw new Error(
            //   `Cannot override existing property: ${key} (id=${client.uid})`,
            // );
        }
        Object.defineProperty(client, key, {
            value,
            writable: false,
            configurable: false,
            enumerable: true,
        });
    }
    return client;
}
//# sourceMappingURL=CoreFhevm-p.js.map