import { addressToChecksummedAddress, assertIsAddress, assertIsAddressArray, } from "../base/address.js";
import { asBytesHex, assertIsBytesHex, bytesToHexLarge, } from "../base/bytes.js";
import { ensure0x } from "../base/string.js";
import { assertIsUint64, assertIsUintNumber } from "../base/uint.js";
import { createKmsEIP712Domain } from "./createKmsEIP712Domain.js";
import { kmsUserDecryptEIP712Types } from "./kmsUserDecryptEIP712Types.js";
////////////////////////////////////////////////////////////////////////////////
// createKmsUserDecryptEIP712
////////////////////////////////////////////////////////////////////////////////
export function createKmsUserDecryptEIP712({ verifyingContractAddressDecryption, chainId, publicKey, contractAddresses, startTimestamp, durationDays, extraData, }) {
    const publicKeyBytesHex = _verifyPublicKeyArg(publicKey);
    assertIsUint64(chainId, {});
    assertIsAddress(verifyingContractAddressDecryption, {});
    assertIsAddressArray(contractAddresses, {});
    assertIsUintNumber(startTimestamp, {});
    assertIsUintNumber(durationDays, {});
    assertIsBytesHex(extraData, {});
    const checksummedContractAddresses = contractAddresses.map(addressToChecksummedAddress);
    const primaryType = "UserDecryptRequestVerification";
    const domain = createKmsEIP712Domain({
        chainId,
        verifyingContractAddressDecryption,
    });
    const eip712 = {
        domain,
        types: kmsUserDecryptEIP712Types,
        primaryType,
        message: {
            publicKey: publicKeyBytesHex,
            contractAddresses: checksummedContractAddresses,
            startTimestamp: startTimestamp.toString(),
            durationDays: durationDays.toString(),
            extraData,
        },
    };
    Object.freeze(eip712);
    Object.freeze(eip712.domain);
    Object.freeze(eip712.types);
    Object.freeze(eip712.types.EIP712Domain);
    Object.freeze(eip712.types.UserDecryptRequestVerification);
    Object.freeze(eip712.message);
    Object.freeze(eip712.message.contractAddresses);
    return eip712;
}
function _verifyPublicKeyArg(value) {
    if (value === null || value === undefined) {
        throw new Error(`Missing publicKey argument.`);
    }
    let publicKeyBytesHex;
    const pk = value;
    if (typeof pk === "string") {
        publicKeyBytesHex = asBytesHex(ensure0x(pk));
    }
    else if (pk instanceof Uint8Array) {
        publicKeyBytesHex = bytesToHexLarge(pk);
    }
    else {
        throw new Error(`Invalid publicKey argument.`);
    }
    return publicKeyBytesHex;
}
//# sourceMappingURL=createKmsUserDecryptEIP712.js.map