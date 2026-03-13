import { createKmsEIP712Domain as createKmsEIP712Domain_ } from "../../kms/createKmsEIP712Domain.js";
export function createKmsEIP712Domain(fhevm) {
    return createKmsEIP712Domain_({
        chainId: fhevm.chain.id,
        verifyingContractAddressDecryption: fhevm.chain.fhevm.gateway.contracts.decryption.address,
    });
}
//# sourceMappingURL=createKmsEIP712Domain.js.map