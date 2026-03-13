export declare function simpleDeepFreeze<T extends object>(obj: T): Readonly<T>;
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
export declare function addInternalFunction<T extends object, FnName extends string, Fn extends (...args: never[]) => unknown>(target: T, fnName: FnName, fn: Fn): T & Readonly<Record<FnName, Fn>>;
//# sourceMappingURL=object.d.ts.map