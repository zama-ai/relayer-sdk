import { assertFhevmHandlesBelongToSameChainId } from "../../../handle/FhevmHandle.js";
import { createKmsSigncryptedShares } from "../../../kms/KmsSigncryptedShares-p.js";
import { assertKmsDecryptionBitLimit, assertKmsEIP712DeadlineValidity, } from "../../../kms/utils.js";
import { readKmsSignersContext } from "../readKmsSignersContext.js";
import { checkUserAllowedForDecryption } from "./checkUserAllowedForDecryption.js";
import { createKmsEIP712Domain } from "../../chain/createKmsEIP712Domain.js";
import { verifyKmsUserDecryptEIP712 } from "../../chain/verifyKmsUserDecryptEIP712.js";
////////////////////////////////////////////////////////////////////////////////
// fetchKmsSignedcryptedShares
////////////////////////////////////////////////////////////////////////////////
const MAX_USER_DECRYPT_CONTRACT_ADDRESSES = 10;
const MAX_USER_DECRYPT_DURATION_DAYS = 365;
export async function fetchKmsSignedcryptedShares(fhevm, parameters) {
    const { handleContractPairs, userDecryptEIP712Signature, userDecryptEIP712Message, userDecryptEIP712Signer: userAddress, } = parameters;
    // 1. Check: At least one handle/contract pair is required
    if (handleContractPairs.length === 0) {
        throw Error(`handleContractPairs must not be empty, at least one handle/contract pair is required`);
    }
    // 2. Check: At least one contract
    const contractAddressesLength = userDecryptEIP712Message.contractAddresses.length;
    if (contractAddressesLength === 0) {
        throw Error("contractAddresses is empty");
    }
    // 3. Check: No more that 10 contract addresses
    if (contractAddressesLength > MAX_USER_DECRYPT_CONTRACT_ADDRESSES) {
        throw Error(`contractAddresses max length of ${MAX_USER_DECRYPT_CONTRACT_ADDRESSES} exceeded`);
    }
    const fhevmHandles = handleContractPairs.map((pair) => pair.handle);
    Object.freeze(fhevmHandles);
    // 4. Check: All handles belong to the host chainId
    assertFhevmHandlesBelongToSameChainId(fhevmHandles, BigInt(fhevm.chain.id));
    // 5. Check: 2048 bits limit
    assertKmsDecryptionBitLimit(fhevmHandles);
    // 6. Check: Expiration date
    assertKmsEIP712DeadlineValidity(userDecryptEIP712Message, MAX_USER_DECRYPT_DURATION_DAYS);
    // 7. Check: ACL permissions
    await checkUserAllowedForDecryption(fhevm, {
        userAddress: parameters.userDecryptEIP712Signer,
        handleContractPairs: parameters.handleContractPairs,
    });
    const kmsUserDecryptEIP712Message = userDecryptEIP712Message;
    // 9. Verify the EIP712 signature
    await verifyKmsUserDecryptEIP712(fhevm, {
        signer: parameters.userDecryptEIP712Signer,
        message: kmsUserDecryptEIP712Message,
        signature: userDecryptEIP712Signature,
    });
    // 10. Fetch `KmsSignersContext` on-chain (cached)
    const kmsSignersContext = await readKmsSignersContext(fhevm);
    // 11. Fetch `KmsSigncryptedShares` from the relayer
    const shares = await fhevm.runtime.relayer.fetchUserDecrypt({ relayerUrl: fhevm.chain.fhevm.relayerUrl }, {
        payload: {
            handleContractPairs,
            kmsUserDecryptEIP712Signer: userAddress,
            kmsUserDecryptEIP712Message,
            kmsUserDecryptEIP712Signature: userDecryptEIP712Signature,
        },
        options: parameters.options,
    });
    // 12. Build the sealed `KmsSigncryptedShares` object
    const sharesMetadata = {
        kmsSignersContext,
        eip712Domain: createKmsEIP712Domain(fhevm),
        eip712Signature: parameters.userDecryptEIP712Signature,
        eip712SignerAddress: userAddress,
        fhevmHandles,
    };
    return createKmsSigncryptedShares(sharesMetadata, shares);
}
//# sourceMappingURL=fetchKmsSignedcryptedShares.js.map