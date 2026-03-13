"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertIsCoprocessorEIP712Domain = assertIsCoprocessorEIP712Domain;
const address_js_1 = require("../base/address.js");
const string_js_1 = require("../base/string.js");
const uint_js_1 = require("../base/uint.js");
function assertIsCoprocessorEIP712Domain(value, name, options) {
    (0, string_js_1.assertRecordStringProperty)(value, "name", name, {
        expectedValue: "InputVerification",
        ...options,
    });
    (0, string_js_1.assertRecordStringProperty)(value, "version", name, {
        expectedValue: "1",
        ...options,
    });
    (0, uint_js_1.assertRecordUintBigIntProperty)(value, "chainId", name, options);
    (0, address_js_1.assertRecordChecksummedAddressProperty)(value, "verifyingContract", name, options);
}
//# sourceMappingURL=assertIsCoprocessorEIP712Domain.js.map