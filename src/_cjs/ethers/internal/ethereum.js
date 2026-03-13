"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ethereumModule = void 0;
exports.recoverTypedDataAddress = recoverTypedDataAddress;
exports.encodePacked = encodePacked;
exports.encode = encode;
exports.decode = decode;
exports.readContract = readContract;
exports.getChainId = getChainId;
const address_js_1 = require("../../core/base/address.js");
const ethers_1 = require("ethers");
const utils_js_1 = require("./utils.js");
async function recoverTypedDataAddress(parameters) {
    const { primaryType, types, domain, message, signature } = parameters;
    let typesToSign;
    if (primaryType !== undefined) {
        const primaryTypeFields = types[primaryType];
        if (primaryTypeFields === undefined) {
            throw new Error(`Primary type "${primaryType}" not found in types`);
        }
        typesToSign = { [primaryType]: primaryTypeFields };
    }
    else {
        typesToSign = types;
    }
    const recoveredAddress = (0, ethers_1.verifyTypedData)(domain, typesToSign, message, signature);
    return (0, address_js_1.asChecksummedAddress)(recoveredAddress);
}
function encodePacked(parameters) {
    return (0, ethers_1.solidityPacked)(parameters.types, parameters.values);
}
function encode(parameters) {
    const abiCoder = ethers_1.AbiCoder.defaultAbiCoder();
    return abiCoder.encode(parameters.types, parameters.values);
}
function decode(parameters) {
    const abiCoder = ethers_1.AbiCoder.defaultAbiCoder();
    return abiCoder.decode(parameters.types, parameters.encodedData);
}
async function readContract(hostPublicClient, parameters) {
    const contract = (0, utils_js_1.getEthersContract)(hostPublicClient, parameters.address, parameters.abi);
    const result = (await contract
        .getFunction(parameters.functionName)
        .staticCall(...parameters.args));
    return result;
}
async function getChainId(hostPublicClient) {
    const n = await (0, utils_js_1.getNetwork)(hostPublicClient);
    return BigInt(n.chainId);
}
const ethereumModule = () => {
    return Object.freeze({
        ethereum: Object.freeze({
            decode,
            encode,
            encodePacked,
            recoverTypedDataAddress,
            getChainId,
            readContract,
        }),
    });
};
exports.ethereumModule = ethereumModule;
//# sourceMappingURL=ethereum.js.map