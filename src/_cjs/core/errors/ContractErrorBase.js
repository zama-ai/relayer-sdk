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
var _ContractErrorBase_contractAddress, _ContractErrorBase_contractName;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractErrorBase = void 0;
const FhevmErrorBase_js_1 = require("./FhevmErrorBase.js");
class ContractErrorBase extends FhevmErrorBase_js_1.FhevmErrorBase {
    constructor(params) {
        super(params);
        _ContractErrorBase_contractAddress.set(this, void 0);
        _ContractErrorBase_contractName.set(this, void 0);
        __classPrivateFieldSet(this, _ContractErrorBase_contractAddress, params.contractAddress, "f");
        __classPrivateFieldSet(this, _ContractErrorBase_contractName, params.contractName, "f");
    }
    get contractAddress() {
        return __classPrivateFieldGet(this, _ContractErrorBase_contractAddress, "f");
    }
    get contractName() {
        return __classPrivateFieldGet(this, _ContractErrorBase_contractName, "f");
    }
}
exports.ContractErrorBase = ContractErrorBase;
_ContractErrorBase_contractAddress = new WeakMap(), _ContractErrorBase_contractName = new WeakMap();
//# sourceMappingURL=ContractErrorBase.js.map