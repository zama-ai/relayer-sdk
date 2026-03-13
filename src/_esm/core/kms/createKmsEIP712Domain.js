import { addressToChecksummedAddress, assertIsAddress, assertRecordChecksummedAddressProperty, } from "../base/address.js";
import { assertRecordStringProperty } from "../base/string.js";
import { assertIsUint64, assertRecordUintBigIntProperty, } from "../base/uint.js";
export function createKmsEIP712Domain({ chainId, // any chainId could be host or gateway
verifyingContractAddressDecryption, }) {
    assertIsUint64(chainId, {});
    assertIsAddress(verifyingContractAddressDecryption, {});
    const domain = {
        name: "Decryption",
        version: "1",
        chainId: BigInt(chainId),
        verifyingContract: addressToChecksummedAddress(verifyingContractAddressDecryption),
    };
    Object.freeze(domain);
    return domain;
}
export function assertIsKmsEIP712Domain(value, name, options) {
    assertRecordStringProperty(value, "name", name, {
        expectedValue: "Decryption",
        ...options,
    });
    assertRecordStringProperty(value, "version", name, {
        expectedValue: "1",
        ...options,
    });
    assertRecordUintBigIntProperty(value, "chainId", name, options);
    assertRecordChecksummedAddressProperty(value, "verifyingContract", name, options);
}
//# sourceMappingURL=createKmsEIP712Domain.js.map