import { addressToChecksummedAddress, assertIsAddress, } from "../base/address.js";
import { assertIsUint64 } from "../base/uint.js";
export function createCoprocessorEIP712Domain({ gatewayChainId, verifyingContractAddressInputVerification, }) {
    assertIsUint64(gatewayChainId, {});
    assertIsAddress(verifyingContractAddressInputVerification, {});
    const domain = {
        name: "InputVerification",
        version: "1",
        chainId: BigInt(gatewayChainId),
        verifyingContract: addressToChecksummedAddress(verifyingContractAddressInputVerification),
    };
    Object.freeze(domain);
    return domain;
}
//# sourceMappingURL=createCoprocessorEIP712Domain.js.map