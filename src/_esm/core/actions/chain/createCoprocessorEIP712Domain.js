import { createCoprocessorEIP712Domain as createCoprocessorEIP712Domain_ } from "../../coprocessor/createCoprocessorEIP712Domain.js";
export function createCoprocessorEIP712Domain(fhevm) {
    return createCoprocessorEIP712Domain_({
        gatewayChainId: fhevm.chain.fhevm.gateway.id,
        verifyingContractAddressInputVerification: fhevm.chain.fhevm.gateway.contracts.inputVerification.address,
    });
}
//# sourceMappingURL=createCoprocessorEIP712Domain.js.map