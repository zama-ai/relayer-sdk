//////////////////////////////////////////////////////////////////////////////
// createKmsPublicDecryptEIP712
//////////////////////////////////////////////////////////////////////////////
import { assertIsBytesHex } from "../base/bytes.js";
import { assertIsFhevmHandleLikeArray, fhevmHandleLikeToFhevmHandle, } from "../handle/FhevmHandle.js";
import { createKmsEIP712Domain } from "./createKmsEIP712Domain.js";
import { kmsPublicDecryptEIP712Types } from "./kmsPublicDecryptEIP712Types.js";
////////////////////////////////////////////////////////////////////////////////
// createKmsPublicDecryptEIP712
////////////////////////////////////////////////////////////////////////////////
export function createKmsPublicDecryptEIP712({ verifyingContractAddressDecryption, chainId, handles, decryptedResult, extraData, }) {
    assertIsFhevmHandleLikeArray(handles, {});
    assertIsBytesHex(decryptedResult, {});
    assertIsBytesHex(extraData, {});
    const primaryType = "PublicDecryptVerification";
    const domain = createKmsEIP712Domain({
        chainId,
        verifyingContractAddressDecryption,
    });
    const eip712 = {
        types: kmsPublicDecryptEIP712Types,
        primaryType,
        domain,
        message: {
            ctHandles: handles.map((h) => {
                return fhevmHandleLikeToFhevmHandle(h).bytes32Hex;
            }),
            decryptedResult,
            extraData,
        },
    };
    Object.freeze(eip712);
    Object.freeze(eip712.domain);
    Object.freeze(eip712.types);
    Object.freeze(eip712.types.EIP712Domain);
    Object.freeze(eip712.types.PublicDecryptVerification);
    Object.freeze(eip712.message);
    Object.freeze(eip712.message.ctHandles);
    return eip712;
}
//# sourceMappingURL=createKmsPublicDecryptEIP712.js.map