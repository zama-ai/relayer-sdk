"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCoreFhevm = isCoreFhevm;
exports.isCoreClientFhevm = isCoreClientFhevm;
exports.asCoreFhevm = asCoreFhevm;
exports.asCoreClientFhevm = asCoreClientFhevm;
exports.assertIsCoreFhevm = assertIsCoreFhevm;
exports.assertIsCoreClientFhevm = assertIsCoreClientFhevm;
exports.getTrustedClient = getTrustedClient;
exports.createCoreFhevm = createCoreFhevm;
exports.extendCoreFhevm = extendCoreFhevm;
const InvalidTypeError_js_1 = require("../base/errors/InvalidTypeError.js");
const trustedValue_js_1 = require("../base/trustedValue.js");
const uid_js_1 = require("../base/uid.js");
const createTrustedClient_js_1 = require("../modules/ethereum/createTrustedClient.js");
const PRIVATE_TOKEN = Symbol("CoreFhevmHostClient.token");
class CoreFhevmImpl {
    constructor(privateToken, ownerToken, parameters) {
        _CoreFhevmImpl_uid.set(this, void 0);
        _CoreFhevmImpl_runtime.set(this, void 0);
        _CoreFhevmImpl_trustedClient.set(this, void 0);
        _CoreFhevmImpl_chain.set(this, void 0);
        _CoreFhevmImpl_options.set(this, void 0);
        if (privateToken !== PRIVATE_TOKEN) {
            throw new Error("Unauthorized");
        }
        __classPrivateFieldSet(this, _CoreFhevmImpl_runtime, parameters.runtime, "f");
        __classPrivateFieldSet(this, _CoreFhevmImpl_uid, (0, uid_js_1.uid)(), "f");
        __classPrivateFieldSet(this, _CoreFhevmImpl_trustedClient, parameters.client !== undefined
            ? (0, createTrustedClient_js_1.createTrustedClient)(parameters.client, ownerToken)
            : undefined, "f");
        __classPrivateFieldSet(this, _CoreFhevmImpl_chain, parameters.chain, "f");
        __classPrivateFieldSet(this, _CoreFhevmImpl_options, Object.freeze(parameters.options ?? {}), "f");
        __classPrivateFieldGet(this, _CoreFhevmImpl_runtime, "f").verify(ownerToken);
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
                    ? (0, trustedValue_js_1.verifyTrustedValue)(__classPrivateFieldGet(this, _CoreFhevmImpl_trustedClient, "f"), ownerToken)
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
Object.freeze(CoreFhevmImpl);
Object.freeze(CoreFhevmImpl.prototype);
function isCoreFhevm(value) {
    return value instanceof CoreFhevmImpl;
}
function isCoreClientFhevm(value) {
    if (!isCoreFhevm(value)) {
        return false;
    }
    return value.trustedClient !== undefined;
}
function asCoreFhevm(value) {
    assertIsCoreFhevm(value, {});
    return value;
}
function asCoreClientFhevm(value) {
    assertIsCoreClientFhevm(value, {});
    return value;
}
function assertIsCoreFhevm(value, options) {
    if (!isCoreFhevm(value)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "CoreFhevm",
        }, options);
    }
}
function assertIsCoreClientFhevm(value, options) {
    if (!isCoreClientFhevm(value)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "CoreClientFhevm",
        }, options);
    }
}
function getTrustedClient(value) {
    assertIsCoreClientFhevm(value, {});
    return value.trustedClient;
}
function createCoreFhevm(ownerToken, parameters) {
    return new CoreFhevmImpl(PRIVATE_TOKEN, ownerToken, parameters);
}
function extendCoreFhevm(client, actionsFactory) {
    const actions = actionsFactory(client);
    for (const [key, value] of Object.entries(actions)) {
        if (key in client) {
            continue;
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