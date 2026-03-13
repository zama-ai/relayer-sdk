/*
 * ============================================================================
 * Naming convention
 * ============================================================================
 *
 * Standard (no user variant):
 *
 *   type [FuncName]Parameters  = ...
 *   type [FuncName]ReturnType  = ...
 *
 *   [FuncName]ModuleFunction           [funcName](parameters)      => Promise<ReturnType>
 *
 * With user variant (privateKey in closure vs explicit):
 *
 *   type [FuncName]Parameters  = ... (core params, no privateKey)
 *   type [FuncName]ReturnType  = ...
 *
 *   User (FhevmUserClient — privateKey bound in closure):
 *   [FuncName]UserModuleFunction       [funcName](parameters: [FuncName]Parameters)
 *
 *   Standalone (privateKey explicit):
 *   [FuncName]ModuleFunction           [funcName](parameters: WithTkmsPrivateKey & [FuncName]Parameters)
 *
 * ============================================================================
 */
export {};
//# sourceMappingURL=types.js.map