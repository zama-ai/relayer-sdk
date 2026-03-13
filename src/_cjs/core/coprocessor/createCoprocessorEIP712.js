"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCoprocessorEIP712 = createCoprocessorEIP712;
const FhevmHandle_js_1 = require("../handle/FhevmHandle.js");
const address_js_1 = require("../base/address.js");
const uint_js_1 = require("../base/uint.js");
const bytes_js_1 = require("../base/bytes.js");
const coprocessorEIP712Types_js_1 = require("./coprocessorEIP712Types.js");
const createCoprocessorEIP712Domain_js_1 = require("./createCoprocessorEIP712Domain.js");
function createCoprocessorEIP712({ gatewayChainId, verifyingContractAddressInputVerification, handles, contractChainId, contractAddress, userAddress, extraData, }) {
    (0, FhevmHandle_js_1.assertIsFhevmHandleLikeArray)(handles, {});
    (0, address_js_1.assertIsAddress)(userAddress, {});
    (0, address_js_1.assertIsAddress)(contractAddress, {});
    (0, uint_js_1.assertIsUint64)(contractChainId, {});
    (0, bytes_js_1.assertIsBytesHex)(extraData, {});
    const domain = (0, createCoprocessorEIP712Domain_js_1.createCoprocessorEIP712Domain)({
        gatewayChainId,
        verifyingContractAddressInputVerification,
    });
    const eip712 = {
        domain,
        types: coprocessorEIP712Types_js_1.coprocessorEIP712Types,
        message: {
            ctHandles: handles.map((h) => {
                return (0, FhevmHandle_js_1.fhevmHandleLikeToFhevmHandle)(h).bytes32Hex;
            }),
            userAddress: (0, address_js_1.addressToChecksummedAddress)(userAddress),
            contractAddress: (0, address_js_1.addressToChecksummedAddress)(contractAddress),
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