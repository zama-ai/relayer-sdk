import { addressToChecksummedAddress, assertIsAddress, assertIsAddressArray, } from "../base/address.js";
import { asBytesHex, assertIsBytesHex, bytesToHexLarge, } from "../base/bytes.js";
import { ensure0x } from "../base/string.js";
import { assertIsUintNumber } from "../base/uint.js";
import { createKmsEIP712Domain } from "./createKmsEIP712Domain.js";
import { kmsDelegatedUserDecryptEIP712Types } from "./kmsDelegatedUserDecryptEIP712Types.js";
////////////////////////////////////////////////////////////////////////////////
// createKmsDelegatedUserDecryptEIP712
////////////////////////////////////////////////////////////////////////////////
export function createKmsDelegatedUserDecryptEIP712({ verifyingContractAddressDecryption, chainId, publicKey, contractAddresses, startTimestamp, durationDays, extraData, delegatedAccount, }) {
    const publicKeyBytesHex = _verifyPublicKeyArg(publicKey);
    assertIsAddressArray(contractAddresses, {});
    assertIsUintNumber(startTimestamp, {});
    assertIsUintNumber(durationDays, {});
    assertIsBytesHex(extraData, {});
    assertIsAddress(delegatedAccount, {});
    const checksummedContractAddresses = contractAddresses.map(addressToChecksummedAddress);
    const checksummedDelegatedAccount = addressToChecksummedAddress(delegatedAccount);
    const primaryType = "DelegatedUserDecryptRequestVerification";
    const domain = createKmsEIP712Domain({
        chainId,
        verifyingContractAddressDecryption,
    });
    const eip712 = {
        types: kmsDelegatedUserDecryptEIP712Types,
        primaryType,
        domain,
        message: {
            publicKey: publicKeyBytesHex,
            contractAddresses: checksummedContractAddresses,
            startTimestamp: startTimestamp.toString(),
            durationDays: durationDays.toString(),
            extraData,
            delegatedAccount: checksummedDelegatedAccount,
        },
    };
    Object.freeze(eip712);
    Object.freeze(eip712.domain);
    Object.freeze(eip712.types);
    Object.freeze(eip712.types.EIP712Domain);
    Object.freeze(eip712.types.DelegatedUserDecryptRequestVerification);
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
//# sourceMappingURL=createKmsDelegatedUserDecryptEIP712.js.map