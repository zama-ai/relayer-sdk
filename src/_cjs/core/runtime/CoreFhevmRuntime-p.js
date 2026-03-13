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
var _CoreFhevmRuntimeImpl_uid, _CoreFhevmRuntimeImpl_config, _CoreFhevmRuntimeImpl_ethereum, _CoreFhevmRuntimeImpl_tkmsKey, _CoreFhevmRuntimeImpl_encrypt, _CoreFhevmRuntimeImpl_decrypt, _CoreFhevmRuntimeImpl_relayer;
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFhevmRuntime = createFhevmRuntime;
exports.isFhevmRuntime = isFhevmRuntime;
exports.assertIsFhevmRuntime = assertIsFhevmRuntime;
exports.verifyFhevmRuntime = verifyFhevmRuntime;
exports.asFhevmRuntimeWith = asFhevmRuntimeWith;
exports.assertOwnedBy = assertOwnedBy;
const InvalidTypeError_js_1 = require("../base/errors/InvalidTypeError.js");
const uid_js_1 = require("../base/uid.js");
const PRIVATE_TOKEN = Symbol("CoreFhevmClient.token");
function asModule(placeholder, name) {
    if (Object.keys(placeholder).length === 0) {
        throw new Error(`Missing ${name} module`);
    }
    return placeholder;
}
function createExtendFn(selfRuntime, moduleSlots) {
    const factories = new Set();
    return (moduleFactory) => {
        if (factories.has(moduleFactory))
            return selfRuntime;
        const module = moduleFactory(selfRuntime);
        const keys = Object.keys(module);
        if (keys.length !== 1 || keys[0] === undefined) {
            throw new Error("Factory must return exactly one key");
        }
        const moduleName = keys[0];
        const moduleSlot = moduleSlots.get(moduleName);
        if (moduleSlot === undefined) {
            throw new Error(`Unknown module: ${moduleName}`);
        }
        if (moduleSlot.factory !== undefined) {
            throw new Error(`Already extended: ${moduleName}`);
        }
        const moduleFunctions = module[moduleName];
        if (moduleFunctions === undefined) {
            throw new Error(`Missing ${moduleName} in factory result`);
        }
        Object.assign(moduleSlot.placeholder, moduleFunctions);
        Object.freeze(moduleSlot.placeholder);
        moduleSlot.factory = moduleFactory;
        factories.add(moduleFactory);
        return selfRuntime;
    };
}
class CoreFhevmRuntimeImpl {
    constructor(privateToken, ownerToken, parameters) {
        _CoreFhevmRuntimeImpl_uid.set(this, void 0);
        _CoreFhevmRuntimeImpl_config.set(this, void 0);
        _CoreFhevmRuntimeImpl_ethereum.set(this, void 0);
        _CoreFhevmRuntimeImpl_tkmsKey.set(this, {});
        _CoreFhevmRuntimeImpl_encrypt.set(this, {});
        _CoreFhevmRuntimeImpl_decrypt.set(this, {});
        _CoreFhevmRuntimeImpl_relayer.set(this, {});
        if (privateToken !== PRIVATE_TOKEN) {
            throw new Error("Unauthorized");
        }
        __classPrivateFieldSet(this, _CoreFhevmRuntimeImpl_ethereum, parameters.ethereum, "f");
        __classPrivateFieldSet(this, _CoreFhevmRuntimeImpl_uid, (0, uid_js_1.uid)(), "f");
        __classPrivateFieldSet(this, _CoreFhevmRuntimeImpl_config, {
            ...parameters.config,
            logger: parameters.config.logger
                ? { ...parameters.config.logger }
                : undefined,
        }, "f");
        const tkmsKey = __classPrivateFieldGet(this, _CoreFhevmRuntimeImpl_tkmsKey, "f");
        const decrypt = __classPrivateFieldGet(this, _CoreFhevmRuntimeImpl_decrypt, "f");
        const encrypt = __classPrivateFieldGet(this, _CoreFhevmRuntimeImpl_encrypt, "f");
        const relayer = __classPrivateFieldGet(this, _CoreFhevmRuntimeImpl_relayer, "f");
        this.verify = (token) => {
            if (token !== ownerToken) {
                throw new Error("Unauthorized");
            }
        };
        const slots = new Map([
            ["decrypt", { placeholder: decrypt }],
            ["encrypt", { placeholder: encrypt }],
            ["tkmsKey", { placeholder: tkmsKey }],
            ["relayer", { placeholder: relayer }],
        ]);
        this.extend = createExtendFn(this, slots);
        this.hasModule = (moduleName) => {
            return slots.get(moduleName)?.factory !== undefined;
        };
        Object.freeze(this);
    }
    get uid() {
        return __classPrivateFieldGet(this, _CoreFhevmRuntimeImpl_uid, "f");
    }
    get config() {
        return __classPrivateFieldGet(this, _CoreFhevmRuntimeImpl_config, "f");
    }
    get ethereum() {
        return __classPrivateFieldGet(this, _CoreFhevmRuntimeImpl_ethereum, "f");
    }
    get tkmsKey() {
        return asModule(__classPrivateFieldGet(this, _CoreFhevmRuntimeImpl_tkmsKey, "f"), "tkmsKey");
    }
    get decrypt() {
        return asModule(__classPrivateFieldGet(this, _CoreFhevmRuntimeImpl_decrypt, "f"), "decrypt");
    }
    get encrypt() {
        return asModule(__classPrivateFieldGet(this, _CoreFhevmRuntimeImpl_encrypt, "f"), "encrypt");
    }
    get relayer() {
        return asModule(__classPrivateFieldGet(this, _CoreFhevmRuntimeImpl_relayer, "f"), "relayer");
    }
}
_CoreFhevmRuntimeImpl_uid = new WeakMap(), _CoreFhevmRuntimeImpl_config = new WeakMap(), _CoreFhevmRuntimeImpl_ethereum = new WeakMap(), _CoreFhevmRuntimeImpl_tkmsKey = new WeakMap(), _CoreFhevmRuntimeImpl_encrypt = new WeakMap(), _CoreFhevmRuntimeImpl_decrypt = new WeakMap(), _CoreFhevmRuntimeImpl_relayer = new WeakMap();
Object.freeze(CoreFhevmRuntimeImpl);
Object.freeze(CoreFhevmRuntimeImpl.prototype);
function createFhevmRuntime(ownerToken, parameters) {
    return new CoreFhevmRuntimeImpl(PRIVATE_TOKEN, ownerToken, parameters);
}
function isFhevmRuntime(value) {
    return value instanceof CoreFhevmRuntimeImpl;
}
function assertIsFhevmRuntime(value, options) {
    if (!isFhevmRuntime(value)) {
        throw new InvalidTypeError_js_1.InvalidTypeError({
            subject: options.subject,
            type: typeof value,
            expectedType: "FhevmRuntime",
        }, options);
    }
}
function verifyFhevmRuntime(value, ownerToken) {
    assertIsFhevmRuntime(value, {});
    value.verify(ownerToken);
}
function asFhevmRuntimeWith(fhevmRuntime, moduleName) {
    assertIsFhevmRuntime(fhevmRuntime, {});
    void fhevmRuntime[moduleName];
    return fhevmRuntime;
}
function assertOwnedBy(parameters) {
    const { actualOwner: actual, expectedOwner: expected, name } = parameters;
    if (actual.deref() === undefined) {
        throw new Error(`${name} owner has been garbage collected`);
    }
    if (actual.deref() !== expected) {
        throw new Error(`${name} has not the expected owner`);
    }
}
//# sourceMappingURL=CoreFhevmRuntime-p.js.map