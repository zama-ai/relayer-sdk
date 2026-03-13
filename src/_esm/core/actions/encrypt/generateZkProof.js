import { createTypedValue } from "../../base/typedvalue.js";
import { createZkProofBuilder } from "../../coprocessor/ZkProofBuilder-p.js";
export async function generateZkProof(fhevm, parameters) {
    const { values, contractAddress, userAddress, globalFhePublicEncryptionParams, } = parameters;
    const builder = createZkProofBuilder();
    for (const value of values) {
        builder.addTypedValue(createTypedValue(value));
    }
    return builder.build(fhevm, {
        globalFhePublicEncryptionParams,
        contractAddress,
        userAddress,
    });
}
//# sourceMappingURL=generateZkProof.js.map