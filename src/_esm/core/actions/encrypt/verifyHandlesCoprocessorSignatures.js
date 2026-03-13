import { coprocessorEIP712PrimaryType, coprocessorEIP712Types, } from "../../coprocessor/coprocessorEIP712Types.js";
import { createCoprocessorEIP712Domain } from "../../coprocessor/createCoprocessorEIP712Domain.js";
import { assertCoprocessorSignerThreshold } from "../../host-contracts/CoprocessorSignersContext-p.js";
import { recoverSigners } from "../runtime/recoverSigners.js";
import { readCoprocessorSignersContext } from "./readCoprocessorSignersContext.js";
////////////////////////////////////////////////////////////////////////////////
// verifyHandlesCoprocessorSignatures
////////////////////////////////////////////////////////////////////////////////
export async function verifyHandlesCoprocessorSignatures(fhevm, parameters) {
    const handlesBytes32 = parameters.handles.map((h) => h.bytes32);
    const message = {
        ctHandles: handlesBytes32,
        userAddress: parameters.userAddress,
        contractAddress: parameters.contractAddress,
        contractChainId: parameters.chainId,
        extraData: parameters.extraData,
    };
    const domain = createCoprocessorEIP712Domain({
        gatewayChainId: fhevm.chain.fhevm.gateway.id,
        verifyingContractAddressInputVerification: fhevm.chain.fhevm.gateway.contracts.inputVerification.address,
    });
    // 1. Verify signatures
    const recoveredAddresses = await recoverSigners(fhevm, {
        domain,
        primaryType: coprocessorEIP712PrimaryType,
        types: coprocessorEIP712Types,
        signatures: parameters.coprocessorSignatures,
        message,
    });
    const coprocessorSignersContext = await readCoprocessorSignersContext(fhevm);
    // 2. Verify signature theshold is reached
    assertCoprocessorSignerThreshold(coprocessorSignersContext, recoveredAddresses);
}
//# sourceMappingURL=verifyHandlesCoprocessorSignatures.js.map