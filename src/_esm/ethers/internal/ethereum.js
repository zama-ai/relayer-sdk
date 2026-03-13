import { asChecksummedAddress } from "../../core/base/address.js";
import { AbiCoder, solidityPacked, verifyTypedData } from "ethers";
import { getEthersContract, getNetwork } from "./utils.js";
////////////////////////////////////////////////////////////////////////////////
// encodePacked
////////////////////////////////////////////////////////////////////////////////
// eslint-disable-next-line @typescript-eslint/require-await
export async function recoverTypedDataAddress(parameters) {
    const { primaryType, types, domain, message, signature } = parameters;
    // If primaryType is specified, filter types to only include the primary type
    // This ensures ethers uses the correct primary type for signing
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
    const recoveredAddress = verifyTypedData(domain, typesToSign, message, signature);
    return asChecksummedAddress(recoveredAddress);
}
////////////////////////////////////////////////////////////////////////////////
// encodePacked
////////////////////////////////////////////////////////////////////////////////
export function encodePacked(parameters) {
    return solidityPacked(parameters.types, parameters.values);
}
////////////////////////////////////////////////////////////////////////////////
// encode
////////////////////////////////////////////////////////////////////////////////
export function encode(parameters) {
    const abiCoder = AbiCoder.defaultAbiCoder();
    return abiCoder.encode(parameters.types, parameters.values);
}
////////////////////////////////////////////////////////////////////////////////
// decode
////////////////////////////////////////////////////////////////////////////////
export function decode(parameters) {
    const abiCoder = AbiCoder.defaultAbiCoder();
    return abiCoder.decode(parameters.types, parameters.encodedData);
}
////////////////////////////////////////////////////////////////////////////////
// readContract
////////////////////////////////////////////////////////////////////////////////
export async function readContract(hostPublicClient, parameters) {
    const contract = getEthersContract(hostPublicClient, parameters.address, parameters.abi);
    const result = (await contract
        .getFunction(parameters.functionName)
        .staticCall(...parameters.args));
    return result;
}
////////////////////////////////////////////////////////////////////////////////
// getChainId
////////////////////////////////////////////////////////////////////////////////
export async function getChainId(hostPublicClient) {
    const n = await getNetwork(hostPublicClient);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion
    return BigInt(n.chainId);
}
////////////////////////////////////////////////////////////////////////////////
// ethereumModule
////////////////////////////////////////////////////////////////////////////////
export const ethereumModule = () => {
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
//# sourceMappingURL=ethereum.js.map