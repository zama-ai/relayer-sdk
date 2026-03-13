"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _FhevmErrorBase_docsPath;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FhevmErrorBase = void 0;
const _version_js_1 = require("../_version.js");
const ErrorBase_js_1 = require("../base/errors/ErrorBase.js");
class FhevmErrorBase extends ErrorBase_js_1.ErrorBase {
    constructor(params) {
        let docsPath;
        if (params.cause instanceof FhevmErrorBase) {
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
            docsUrl = `${FhevmErrorBase.DEFAULT_DOCS_BASE_URL}${docsPath}${params.docsSlug !== undefined ? `#${params.docsSlug}` : ""}`;
        }
        super({
            ...params,
            name: "FhevmErrorBase",
            version: FhevmErrorBase.FULL_VERSION,
            docsUrl,
        });
        _FhevmErrorBase_docsPath.set(this, void 0);
    }
    get docsPath() {
        return __classPrivateFieldGet(this, _FhevmErrorBase_docsPath, "f");
    }
}
exports.FhevmErrorBase = FhevmErrorBase;
_FhevmErrorBase_docsPath = new WeakMap();
Object.defineProperty(FhevmErrorBase, "PKG_NAME", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: _version_js_1.sdkName
});
Object.defineProperty(FhevmErrorBase, "VERSION", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: _version_js_1.version
});
Object.defineProperty(FhevmErrorBase, "DEFAULT_DOCS_BASE_URL", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "https//docs.zama.org"
});
Object.defineProperty(FhevmErrorBase, "FULL_VERSION", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: `${FhevmErrorBase.PKG_NAME}@${FhevmErrorBase.VERSION}`
});
//# sourceMappingURL=FhevmErrorBase.js.map