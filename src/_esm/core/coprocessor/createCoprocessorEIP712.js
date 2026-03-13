import { assertIsFhevmHandleLikeArray, fhevmHandleLikeToFhevmHandle, } from "../handle/FhevmHandle.js";
import { addressToChecksummedAddress, assertIsAddress, } from "../base/address.js";
import { assertIsUint64 } from "../base/uint.js";
import { assertIsBytesHex } from "../base/bytes.js";
import { coprocessorEIP712Types } from "./coprocessorEIP712Types.js";
import { createCoprocessorEIP712Domain } from "./createCoprocessorEIP712Domain.js";
////////////////////////////////////////////////////////////////////////////////
// createCoprocessorEIP712
////////////////////////////////////////////////////////////////////////////////
export function createCoprocessorEIP712({ gatewayChainId, verifyingContractAddressInputVerification, handles, contractChainId, contractAddress, userAddress, extraData, }) {
    assertIsFhevmHandleLikeArray(handles, {});
    assertIsAddress(userAddress, {});
    assertIsAddress(contractAddress, {});
    assertIsUint64(contractChainId, {});
    assertIsBytesHex(extraData, {});
    const domain = createCoprocessorEIP712Domain({
        gatewayChainId,
        verifyingContractAddressInputVerification,
    });
    const eip712 = {
        domain,
        types: coprocessorEIP712Types,
        message: {
            ctHandles: handles.map((h) => {
                return fhevmHandleLikeToFhevmHandle(h).bytes32Hex;
            }),
            userAddress: addressToChecksummedAddress(userAddress),
            contractAddress: addressToChecksummedAddress(contractAddress),
            contractChainId: BigInt(contractChainId),
            extraData,
        },
    };
    Object.freeze(eip712);
    Object.freeze(eip712.domain);
    Object.freeze(eip712.types);
    Object.freeze(eip712.types.CiphertextVerification);
    Object.freeze(eip712.message);
    Object.freeze(eip712.message.ctHandles);
    return eip712;
}
//# sourceMappingURL=createCoprocessorEIP712.js.map