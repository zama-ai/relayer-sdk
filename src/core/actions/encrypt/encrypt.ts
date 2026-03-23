import type { RelayerInputProofOptions } from "../../types/relayer.js";
import type { Fhevm } from "../../types/coreFhevmClient.js";
import type { WithEncrypt } from "../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import type { GlobalFhePkeParams } from "../../types/globalFhePkeParams.js";
import type { VerifiedInputProof } from "../../types/inputProof.js";
import type { TypedValueLike } from "../../types/primitives.js";
import type { ZkProof } from "../../types/zkProof.js";
import { fetchVerifiedInputProof } from "./fetchVerifiedInputProof.js";
import { generateZkProof } from "./generateZkProof.js";
import { asBytesHex } from "../../base/bytes.js";

////////////////////////////////////////////////////////////////////////////////

export type EncryptParameters = {
  readonly globalFhePublicEncryptionParams: GlobalFhePkeParams;
  readonly contractAddress: string;
  readonly userAddress: string;
  readonly values: readonly TypedValueLike[];
  readonly extraData: string;
  readonly options?: RelayerInputProofOptions | undefined;
};

export type EncryptReturnType = VerifiedInputProof;

////////////////////////////////////////////////////////////////////////////////

export async function encrypt(
  fhevm: Fhevm<FhevmChain, WithEncrypt>,
  parameters: EncryptParameters,
): Promise<EncryptReturnType> {
  const {
    contractAddress,
    userAddress,
    values,
    globalFhePublicEncryptionParams,
  } = parameters;

  const zkProof: ZkProof = await generateZkProof(fhevm, {
    globalFhePublicEncryptionParams,
    contractAddress,
    userAddress,
    values,
  });

  const inputProof = await fetchVerifiedInputProof(fhevm, {
    zkProof,
    extraData: asBytesHex(parameters.extraData),
    options: parameters.options,
  });

  return inputProof;
}
