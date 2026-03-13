"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _RelayerErrorBase_docsPath;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayerErrorBase = void 0;
exports.humanReadableOperation = humanReadableOperation;
const _version_js_1 = require("../_version.js");
const ErrorBase_js_1 = require("../base/errors/ErrorBase.js");
const utils_js_1 = require("../base/errors/utils.js");
class RelayerErrorBase extends ErrorBase_js_1.ErrorBase {
    constructor(params) {
        let docsPath;
        if (params.cause instanceof RelayerErrorBase) {
            docsPath = params.docsPath ?? params.cause.docsPath;
        }
        else {
            docsPath = params.docsPath;
        }
        let docsUrl = undefined;
        if (docsPath !== undefined) {
            if (!docsPath.startsWith("/")) {
                docsPath = "/" + docsPath;
            }
            docsUrl = `${RelayerErrorBase.DEFAULT_DOCS_BASE_URL}${docsPath}${params.docsSlug !== undefined ? `#${params.docsSlug}` : ""}`;
        }
        super({
            ...params,
            name: "RelayerErrorBase",
            version: RelayerErrorBase.FULL_VERSION,
            docsUrl,
        });
        _RelayerErrorBase_docsPath.set(this, void 0);
    }
    get docsPath() {
        return __classPrivateFieldGet(this, _RelayerErrorBase_docsPath, "f");
    }
}
exports.RelayerErrorBase = RelayerErrorBase;
_RelayerErrorBase_docsPath = new WeakMap();
Object.defineProperty(RelayerErrorBase, "PKG_NAME", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: _version_js_1.sdkName
});
Object.defineProperty(RelayerErrorBase, "VERSION", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: _version_js_1.version
});
Object.defineProperty(RelayerErrorBase, "DEFAULT_DOCS_BASE_URL", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "https//docs.zama.org"
});
Object.defineProperty(RelayerErrorBase, "FULL_VERSION", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: `${RelayerErrorBase.PKG_NAME}@${RelayerErrorBase.VERSION}`
});
function humanReadableOperation(relayerOperation, capitalize) {
    switch (relayerOperation) {
        case "INPUT_PROOF":
            return capitalize ? "Input proof" : "input proof";
        case "PUBLIC_DECRYPT":
            return capitalize ? "Public decryption" : "public decryption";
        case "USER_DECRYPT":
            return capitalize ? "User decryption" : "user decryption";
        case "DELEGATED_USER_DECRYPT":
            return capitalize
                ? "Delegated user decryption"
                : "delegated user decryption";
        case "KEY_URL":
            return capitalize ? "Key url" : "key url";
        default: {
            (0, utils_js_1.assertNever)(relayerOperation, `Unkown operation: ${relayerOperation}`);
        }
    }
}
//# sourceMappingURL=RelayerErrorBase.js.map