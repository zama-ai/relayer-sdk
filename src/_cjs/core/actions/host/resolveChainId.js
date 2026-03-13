"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveChainId = resolveChainId;
const uint_js_1 = require("../../base/uint.js");
const CoreFhevm_p_js_1 = require("../../runtime/CoreFhevm-p.js");
async function resolveChainId(fhevm, parameters) {
    const trustedClient = (0, CoreFhevm_p_js_1.getTrustedClient)(fhevm);
    const { id, verify } = parameters;
    if (id === undefined) {
        return (0, uint_js_1.asUint64BigInt)(await fhevm.runtime.ethereum.getChainId(trustedClient));
    }
    (0, uint_js_1.assertIsUint64)(id, {});
    const resolvedId = (0, uint_js_1.asUint64BigInt)(BigInt(id));
    if (verify !== true) {
        return resolvedId;
    }
    const chainId = (0, uint_js_1.asUint64BigInt)(await fhevm.runtime.ethereum.getChainId(trustedClient));
    if (resolvedId !== chainId) {
        throw new Error(`Chain id mismatch: connected to chain ${chainId}, but expected chain ${resolvedId}`);
    }
    return resolvedId;
}
//# sourceMappingURL=resolveChainId.js.map