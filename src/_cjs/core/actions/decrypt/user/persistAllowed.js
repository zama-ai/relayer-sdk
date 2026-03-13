"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.persistAllowed = persistAllowed;
const address_js_1 = require("../../../base/address.js");
const promise_js_1 = require("../../../base/promise.js");
const FhevmHandle_js_1 = require("../../../handle/FhevmHandle.js");
const persistAllowed_js_1 = require("../../host/persistAllowed.js");
async function persistAllowed(fhevm, parameters) {
    const { handleAddressPairs, options } = parameters;
    const isArray = Array.isArray(handleAddressPairs);
    const pairsArray = isArray
        ? handleAddressPairs
        : [handleAddressPairs];
    if (options?.checkArguments !== false) {
        for (const p of pairsArray) {
            (0, FhevmHandle_js_1.assertIsFhevmHandleLike)(p.handle);
            (0, address_js_1.assertIsChecksummedAddress)(p.address, {});
        }
    }
    const rpcCalls = pairsArray.map((p) => () => (0, persistAllowed_js_1.persistAllowed)(fhevm, {
        address: fhevm.chain.fhevm.contracts.acl.address,
        args: {
            handle: (0, FhevmHandle_js_1.toFhevmHandle)(p.handle).bytes32Hex,
            account: p.address,
        },
    }));
    const results = await (0, promise_js_1.executeWithBatching)(rpcCalls, fhevm.options?.batchRpcCalls);
    return isArray ? results : results[0];
}
//# sourceMappingURL=persistAllowed.js.map