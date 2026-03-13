"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eip712Domain = eip712Domain;
const address_js_1 = require("../../base/address.js");
const uint_js_1 = require("../../base/uint.js");
const fragments_js_1 = require("../../host-contracts/abi/fragments.js");
const CoreFhevm_p_js_1 = require("../../runtime/CoreFhevm-p.js");
async function eip712Domain(fhevm, parameters) {
    const trustedClient = (0, CoreFhevm_p_js_1.getTrustedClient)(fhevm);
    const address = parameters.address;
    const res = await fhevm.runtime.ethereum.readContract(trustedClient, {
        address: address,
        abi: fragments_js_1.eip712DomainAbi,
        args: [],
        functionName: fragments_js_1.eip712DomainAbi[0].name,
    });
    if (!Array.isArray(res) || res.length < 5) {
        throw new Error(`Invalid eip712Domain result.`);
    }
    const unknownName = res[1];
    const unknownVersion = res[2];
    const unknownChainId = res[3];
    const unknownVerifyingContract = res[4];
    if (typeof unknownName !== "string") {
        throw new Error("Invalid EIP-712 name version.");
    }
    if (typeof unknownVersion !== "string") {
        throw new Error("Invalid EIP-712 domain version.");
    }
    if (!(0, uint_js_1.isUint64BigInt)(unknownChainId)) {
        throw new Error("Invalid EIP-712 domain chainId.");
    }
    if (!(0, address_js_1.isChecksummedAddress)(unknownVerifyingContract)) {
        throw new Error("Invalid EIP-712 domain chainId.");
    }
    return {
        name: unknownName,
        version: unknownVersion,
        chainId: unknownChainId,
        verifyingContract: unknownVerifyingContract,
    };
}
//# sourceMappingURL=eip712Domain.js.map