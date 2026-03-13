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
var _ErrorBase_details, _ErrorBase_docsUrl, _ErrorBase_version;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorBase = void 0;
class ErrorBase extends Error {
    constructor(params) {
        let details;
        let docsUrl;
        let version;
        const { cause } = params;
        if (cause instanceof ErrorBase) {
            docsUrl = params.docsUrl ?? cause.docsUrl;
            details = params.details ?? cause.details;
            version = params.version ?? cause.version;
        }
        else {
            docsUrl = params.docsUrl;
            details = params.details ?? cause?.message;
            version = params.version ?? undefined;
        }
        let message = params.message ?? "An error occurred.";
        const other = [
            ...(params.metaMessages ? [...params.metaMessages, ""] : []),
            ...(docsUrl !== undefined ? [`Docs: ${docsUrl}`] : []),
            ...(details !== undefined ? [`Details: ${details}`] : []),
            ...(version !== undefined ? [`Version: ${version}`] : []),
        ];
        if (other.length > 0) {
            message += "\n" + other.join("\n");
        }
        super(message, params.cause ? { cause: params.cause } : undefined);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "ErrorBase"
        });
        _ErrorBase_details.set(this, void 0);
        _ErrorBase_docsUrl.set(this, void 0);
        _ErrorBase_version.set(this, void 0);
        Object.setPrototypeOf(this, new.target.prototype);
        __classPrivateFieldSet(this, _ErrorBase_details, details, "f");
        __classPrivateFieldSet(this, _ErrorBase_docsUrl, docsUrl, "f");
        __classPrivateFieldSet(this, _ErrorBase_version, version, "f");
        this.name = params.name ?? this.name;
    }
    get docsUrl() {
        return __classPrivateFieldGet(this, _ErrorBase_docsUrl, "f");
    }
    get details() {
        return __classPrivateFieldGet(this, _ErrorBase_details, "f");
    }
    get version() {
        return __classPrivateFieldGet(this, _ErrorBase_version, "f");
    }
}
exports.ErrorBase = ErrorBase;
_ErrorBase_details = new WeakMap(), _ErrorBase_docsUrl = new WeakMap(), _ErrorBase_version = new WeakMap();
//# sourceMappingURL=ErrorBase.js.map