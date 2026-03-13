import { type CreateKmsUserDecryptEIP712Parameters } from "../../kms/createKmsUserDecryptEIP712.js";
import type { Fhevm, OptionalNativeClient } from "../../types/coreFhevmClient.js";
import type { FhevmRuntime } from "../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import type { FhevmUserDecryptionPermit } from "../../types/fhevmUserDecryptionPermit.js";
import type { Bytes65Hex } from "../../types/primitives.js";
import type { Prettify } from "../../types/utils.js";
export type SignUserDecryptionPermitParameters = Prettify<{
    readonly signerAddress: string;
} & CreateKmsUserDecryptEIP712Parameters>;
export type SignUserDecryptionPermitReturnType = FhevmUserDecryptionPermit;
export type WalletSigner = {
    signTypedData: (eip712: Record<string, unknown>) => Promise<Bytes65Hex>;
};
export declare function signUserDecryptionPermit(signer: WalletSigner, fhevm: Fhevm<FhevmChain, FhevmRuntime, OptionalNativeClient>, parameters: SignUserDecryptionPermitParameters): Promise<SignUserDecryptionPermitReturnType>;
//# sourceMappingURL=signUserDecryptionPermit.d.ts.map