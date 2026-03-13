"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleDeepFreeze = simpleDeepFreeze;
exports.addInternalFunction = addInternalFunction;
function simpleDeepFreeze(obj) {
    Object.freeze(obj);
    for (const value of Object.values(obj)) {
        if (value !== null &&
            typeof value === "object" &&
            !Array.isArray(value) &&
            !Object.isFrozen(value)) {
            simpleDeepFreeze(value);
        }
    }
    return obj;
}
function addInternalFunction(target, fnName, fn) {
    Object.defineProperty(target, fnName, {
        value: fn,
        writable: false,
        configurable: false,
        enumerable: false,
    });
    return target;
}
//# sourceMappingURL=object.js.map