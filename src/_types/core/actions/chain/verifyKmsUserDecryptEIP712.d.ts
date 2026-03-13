import type { Fhevm, OptionalNativeClient } from "../../types/coreFhevmClient.js";
import type { FhevmRuntime } from "../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import type { KmsUserDecryptEIP712Message } from "../../types/kms.js";
import type { Bytes65Hex, ChecksummedAddress } from "../../types/primitives.js";
export type VerifyKmsUserDecryptEIP712Parameters = {
    readonly signer: ChecksummedAddress;
    readonly message: KmsUserDecryptEIP712Message;
    readonly signature: Bytes65Hex;
};
export declare function verifyKmsUserDecryptEIP712(fhevm: Fhevm<FhevmChain, FhevmRuntime, OptionalNativeClient>, parameters: VerifyKmsUserDecryptEIP712Parameters): Promise<void>;
//# sourceMappingURL=verifyKmsUserDecryptEIP712.d.ts.map