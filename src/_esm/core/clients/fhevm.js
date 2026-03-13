import { createCoreFhevm, } from "../runtime/CoreFhevm-p.js";
export function createFhevm(ownerToken, parameters) {
    const p = {
        options: parameters.options,
        runtime: parameters.runtime,
        chain: parameters.chain,
        client: parameters.client,
    };
    return createCoreFhevm(ownerToken, p);
}
//# sourceMappingURL=fhevm.js.map