"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAllowedForDecryption = isAllowedForDecryption;
const FhevmHandle_js_1 = require("../../../handle/FhevmHandle.js");
const promise_js_1 = require("../../../base/promise.js");
const isAllowedForDecryption_js_1 = require("../../host/isAllowedForDecryption.js");
async function isAllowedForDecryption(fhevm, parameters) {
    const { handles, options } = parameters;
    const isArray = Array.isArray(handles);
    const handlesArray = isArray ? handles : [handles];
    if (options?.checkArguments !== false) {
        (0, FhevmHandle_js_1.assertIsFhevmHandleLikeArray)(handlesArray);
    }
    const rpcCalls = handlesArray.map((h) => () => (0, isAllowedForDecryption_js_1.isAllowedForDecryption)(fhevm, {
        address: fhevm.chain.fhevm.contracts.acl.address,
        args: { handle: (0, FhevmHandle_js_1.toFhevmHandle)(h).bytes32Hex },
    }));
    const results = await (0, promise_js_1.executeWithBatching)(rpcCalls, fhevm.options?.batchRpcCalls);
    return isArray ? results : results[0];
}
//# sourceMappingURL=isAllowedForDecryption.js.map