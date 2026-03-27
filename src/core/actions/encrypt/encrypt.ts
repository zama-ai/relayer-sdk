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
import { resolveGlobalFhePkeParams } from "../key/resolveGlobalFhePkeParams.js";
import { getExtraData } from "../host/getExtraData.js";

////////////////////////////////////////////////////////////////////////////////

export type EncryptParameters = {
  readonly globalFhePublicEncryptionParams?: GlobalFhePkeParams | undefined;
  readonly contractAddress: string;
  readonly userAddress: string;
  readonly values: readonly TypedValueLike[];
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
  } = parameters;

  const globalFhePublicEncryptionParams =
    parameters.globalFhePublicEncryptionParams ??
    (await resolveGlobalFhePkeParams(fhevm, {}));

  const zkProof: ZkProof = await generateZkProof(fhevm, {
    globalFhePublicEncryptionParams,
    contractAddress,
    userAddress,
    values,
  });

  // Fetch extraData for KMS context
  const extraData = await getExtraData(fhevm, {});

  const inputProof = await fetchVerifiedInputProof(fhevm, {
    zkProof,
    extraData: extraData,
    options: parameters.options,
  });

  return inputProof;
}
