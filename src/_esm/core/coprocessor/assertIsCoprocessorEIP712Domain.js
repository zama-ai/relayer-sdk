import { assertRecordChecksummedAddressProperty } from "../base/address.js";
import { assertRecordStringProperty } from "../base/string.js";
import { assertRecordUintBigIntProperty } from "../base/uint.js";
export function assertIsCoprocessorEIP712Domain(value, name, options) {
    assertRecordStringProperty(value, "name", name, {
        expectedValue: "InputVerification",
        ...options,
    });
    assertRecordStringProperty(value, "version", name, {
        expectedValue: "1",
        ...options,
    });
    assertRecordUintBigIntProperty(value, "chainId", name, options);
    assertRecordChecksummedAddressProperty(value, "verifyingContract", name, options);
}
//# sourceMappingURL=assertIsCoprocessorEIP712Domain.js.map