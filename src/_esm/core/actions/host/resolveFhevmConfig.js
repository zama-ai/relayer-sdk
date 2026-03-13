////////////////////////////////////////////////////////////////////////////////
// resolveFhevmConfig
////////////////////////////////////////////////////////////////////////////////
import { addressToChecksummedAddress, assertIsAddress, } from "../../base/address.js";
import { executeWithBatching } from "../../base/promise.js";
import { getFHEVMExecutorAddress } from "./getFHEVMExecutorAddress.js";
import { readFhevmExecutorContractData } from "./readFhevmExecutorContractData.js";
import { readInputVerifierContractData } from "./readInputVerifierContractData.js";
import { readKmsVerifierContractData } from "./readKmsVerifierContractData.js";
import { resolveChainId } from "./resolveChainId.js";
export async function resolveFhevmConfig(fhevm, parameters) {
    // Input is loose
    const kmsVerifierAddress = parameters.fhevm.contracts.kmsVerifier.address;
    assertIsAddress(kmsVerifierAddress, {});
    const id = await resolveChainId(fhevm, parameters);
    const fhevmExecutorData = await _resolveFhevmExecutor(fhevm, parameters.fhevm.contracts);
    _assertOptionalAddressMatch(parameters.fhevm.contracts.inputVerifier?.address, fhevmExecutorData.inputVerifierContractAddress, "InputVerifier");
    _assertOptionalAddressMatch(parameters.fhevm.contracts.hcuLimit?.address, fhevmExecutorData.hcuLimitContractAddress, "HCULimit");
    const rpcCalls = [
        () => readInputVerifierContractData(fhevm, {
            address: fhevmExecutorData.inputVerifierContractAddress,
        }),
        () => readKmsVerifierContractData(fhevm, {
            address: addressToChecksummedAddress(kmsVerifierAddress),
        }),
    ];
    const res = await executeWithBatching(rpcCalls, fhevm.options?.batchRpcCalls);
    const inputVerifierData = res[0];
    const kmsVerifierData = res[1];
    _assertOptionalAddressMatch(parameters.fhevm.gateway?.contracts?.decryption?.address, kmsVerifierData.eip712Domain.verifyingContract, "verifyingContractAddressDecryption");
    _assertOptionalAddressMatch(parameters.fhevm.gateway?.contracts?.inputVerification?.address, inputVerifierData.eip712Domain.verifyingContract, "verifyingContractAddressInputVerification");
    _assertOptionalNumericMatch(inputVerifierData.eip712Domain.chainId, kmsVerifierData.eip712Domain.chainId, "gatewayChainId");
    _assertOptionalNumericMatch(parameters.fhevm.gateway?.id, inputVerifierData.eip712Domain.chainId, "gatewayChainId");
    const returnValue = {
        id,
        acl: fhevmExecutorData.aclContractAddress,
        fhevmExecutor: fhevmExecutorData,
        inputVerifier: inputVerifierData,
        kmsVerifier: kmsVerifierData,
    };
    return Object.freeze(returnValue);
}
////////////////////////////////////////////////////////////////////////////////
// Private Helpers
////////////////////////////////////////////////////////////////////////////////
async function _resolveFhevmExecutor(fhevm, parameters) {
    const acl = parameters.acl?.address;
    const fhevmExecutor = parameters.fhevmExecutor?.address;
    if (acl !== undefined) {
        assertIsAddress(acl, {});
    }
    if (fhevmExecutor !== undefined) {
        assertIsAddress(fhevmExecutor, {});
    }
    let address;
    if (acl !== undefined) {
        const aclFhevmExecutor = await getFHEVMExecutorAddress(fhevm, {
            address: addressToChecksummedAddress(acl),
        });
        if (fhevmExecutor !== undefined) {
            if (aclFhevmExecutor !== fhevmExecutor) {
                throw new Error(`FHEVMExecutor address mismatch: ACL reports ${aclFhevmExecutor}, but ${fhevmExecutor} was provided`);
            }
        }
        address = aclFhevmExecutor;
    }
    else {
        if (fhevmExecutor === undefined) {
            throw new Error("Cannot resolve: either acl or fhevmExecutor address must be provided");
        }
        address = addressToChecksummedAddress(fhevmExecutor);
    }
    return await readFhevmExecutorContractData(fhevm, { address });
}
function _assertOptionalAddressMatch(actual, expected, label) {
    if (actual !== undefined) {
        if (actual.toLowerCase() !== expected.toLowerCase()) {
            throw new Error(`${label} address mismatch: expected ${expected}, but ${actual} was provided`);
        }
    }
}
function _assertOptionalNumericMatch(actual, expected, label) {
    if (actual !== undefined) {
        if (BigInt(actual) !== expected) {
            throw new Error(`${label} mismatch: expected ${expected}, but ${actual} was provided`);
        }
    }
}
//# sourceMappingURL=resolveFhevmConfig.js.map