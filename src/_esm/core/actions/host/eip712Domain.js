import { isChecksummedAddress } from "../../base/address.js";
import { isUint64BigInt } from "../../base/uint.js";
import { eip712DomainAbi } from "../../host-contracts/abi/fragments.js";
import { getTrustedClient } from "../../runtime/CoreFhevm-p.js";
export async function eip712Domain(fhevm, parameters) {
    const trustedClient = getTrustedClient(fhevm);
    const address = parameters.address;
    const res = await fhevm.runtime.ethereum.readContract(trustedClient, {
        address: address,
        abi: eip712DomainAbi,
        args: [],
        functionName: eip712DomainAbi[0].name,
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
    if (!isUint64BigInt(unknownChainId)) {
        throw new Error("Invalid EIP-712 domain chainId.");
    }
    if (!isChecksummedAddress(unknownVerifyingContract)) {
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