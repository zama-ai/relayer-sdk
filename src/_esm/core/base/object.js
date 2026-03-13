export function simpleDeepFreeze(obj) {
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
/**
 * Defines a non-enumerable, non-writable, non-configurable property on the target object.
 * The property is hidden from `Object.keys()` / `Object.entries()` and cannot be
 * overwritten or reconfigured after creation.
 *
 * @param target - The object to define the property on.
 * @param fnName - The property name.
 * @param fn - The value to assign.
 * @returns The target object, typed with the added property.
 */
export function addInternalFunction(target, fnName, fn) {
    Object.defineProperty(target, fnName, {
        value: fn,
        writable: false,
        configurable: false,
        enumerable: false,
    });
    return target;
}
//# sourceMappingURL=object.js.map