export { setFhevmRuntimeConfig } from "./internal/viem-p.js";
export { createFhevmClient } from "./clients/createFhevmClient.js";
export { createFhevmDecryptClient } from "./clients/createFhevmDecryptClient.js";
export { createFhevmEncryptClient } from "./clients/createFhevmEncryptClient.js";

export type {
  FhevmRuntimeConfig,
  FhevmRuntime,
  WithEncrypt,
  WithDecrypt,
} from "../core/types/coreFhevmRuntime.js";

export type { WithEncryptModule } from "../core/modules/encrypt/types.js";

export type { WithDecryptModule } from "../core/modules/decrypt/types.js";

export type { WithRelayerModule } from "../core/modules/relayer/types.js";

export { assertIsChecksummedAddress } from "../core/base/address.js";
export type { ChecksummedAddress } from "../core/types/primitives.js";

export { readFhevmExecutorContractData } from "../core/actions/host/readFhevmExecutorContractData.js";
export type {
  ReadFhevmExecutorContractDataParameters,
  ReadFhevmExecutorContractDataReturnType,
} from "../core/actions/host/readFhevmExecutorContractData.js";

export { readInputVerifierContractData } from "../core/actions/host/readInputVerifierContractData.js";
export type {
  ReadInputVerifierContractDataParameters,
  ReadInputVerifierContractDataReturnType,
} from "../core/actions/host/readInputVerifierContractData.js";

export { readKmsVerifierContractData } from "../core/actions/host/readKmsVerifierContractData.js";
export type {
  ReadKmsVerifierContractDataParameters,
  ReadKmsVerifierContractDataReturnType,
} from "../core/actions/host/readKmsVerifierContractData.js";

export { resolveFhevmConfig } from "../core/actions/host/resolveFhevmConfig.js";
export type {
  ResolveFhevmConfigParameters,
  ResolveFhevmConfigReturnType,
} from "../core/actions/host/resolveFhevmConfig.js";

export type {
  GlobalFhePkeParams,
  GlobalFhePkeParamsBytes,
  GlobalFhePkeParamsBytesHex,
} from "../core/types/globalFhePkeParams.js";

export { deserializeGlobalFhePkeParams } from "../core/actions/encrypt/deserializeGlobalFhePkeParams.js";
export type {
  DeserializeGlobalFhePkeParamsParameters,
  DeserializeGlobalFhePkeParamsReturnType,
} from "../core/actions/encrypt/deserializeGlobalFhePkeParams.js";

export { deserializeGlobalFhePkeParamsFromHex } from "../core/actions/encrypt/deserializeGlobalFhePkeParams.js";
export type {
  DeserializeGlobalFhePkeParamsFromHexParameters,
  DeserializeGlobalFhePkeParamsFromHexReturnType,
} from "../core/actions/encrypt/deserializeGlobalFhePkeParams.js";

export { serializeGlobalFhePkeParams } from "../core/actions/encrypt/serializeGlobalFhePkeParams.js";
export type {
  SerializeGlobalFhePkeParamsParameters,
  SerializeGlobalFhePkeParamsReturnType,
} from "../core/actions/encrypt/serializeGlobalFhePkeParams.js";

export { serializeGlobalFhePkeParamsToHex } from "../core/actions/encrypt/serializeGlobalFhePkeParams.js";
export type {
  SerializeGlobalFhePkeParamsToHexParameters,
  SerializeGlobalFhePkeParamsToHexReturnType,
} from "../core/actions/encrypt/serializeGlobalFhePkeParams.js";

export { fetchGlobalFhePkeParams } from "../core/actions/key/fetchGlobalFhePkeParams.js";
export type {
  FetchGlobalFhePkeParamsParameters,
  FetchGlobalFhePkeParamsReturnType,
} from "../core/actions/key/fetchGlobalFhePkeParams.js";

export type { VerifyKmsUserDecryptEIP712Parameters } from "../core/actions/chain/verifyKmsUserDecryptEIP712.js";
export { verifyKmsUserDecryptEIP712 } from "../core/actions/chain/verifyKmsUserDecryptEIP712.js";

// Standalone action functions (tree-shakable)

export { encrypt } from "../core/actions/encrypt/encrypt.js";
export type {
  EncryptParameters,
  EncryptReturnType,
} from "../core/actions/encrypt/encrypt.js";

export { generateZkProof } from "../core/actions/encrypt/generateZkProof.js";
export type {
  GenerateZkProofParameters,
  GenerateZkProofReturnType,
} from "../core/actions/encrypt/generateZkProof.js";

export { fetchVerifiedInputProof } from "../core/actions/encrypt/fetchVerifiedInputProof.js";
export type {
  FetchInputProofParameters,
  FetchInputProofReturnType,
} from "../core/actions/encrypt/fetchVerifiedInputProof.js";

export { publicDecrypt } from "../core/actions/decrypt/public/publicDecrypt.js";
export type {
  PublicDecryptParameters,
  PublicDecryptReturnType,
} from "../core/actions/decrypt/public/publicDecrypt.js";

export { userDecrypt } from "../core/actions/decrypt/user/userDecrypt.js";
export type {
  UserDecryptParameters,
  UserDecryptReturnType,
} from "../core/actions/decrypt/user/userDecrypt.js";

export { createUserDecryptEIP712 } from "../core/actions/chain/createUserDecryptEIP712.js";
export type {
  CreateUserDecryptEIP712Parameters,
  CreateUserDecryptEIP712ReturnType,
} from "../core/actions/chain/createUserDecryptEIP712.js";

export { createSignedPermit } from "../core/actions/chain/createSignedPermit.js";
export type {
  CreateSignedPermitReturnType,
  SignedPermit,
} from "../core/actions/chain/createSignedPermit.js";

export { fetchGlobalFhePkeParamsBytes } from "../core/actions/key/fetchGlobalFhePkeParamsBytes.js";
export type {
  FetchGlobalFhePkeParamsBytesParameters,
  FetchGlobalFhePkeParamsBytesReturnType,
} from "../core/actions/key/fetchGlobalFhePkeParamsBytes.js";

export { loadFhevmDecryptionKey } from "../core/actions/decrypt/user/loadFhevmDecryptionKey.js";
export type {
  LoadFhevmDecryptionKeyParameters,
  LoadFhevmDecryptionKeyReturnType,
} from "../core/actions/decrypt/user/loadFhevmDecryptionKey.js";

// Client types

export type { FhevmClient } from "../core/clients/fhevmClient.js";
export type { FhevmEncryptClient } from "../core/clients/fhevmEncryptClient.js";
export type { FhevmDecryptClient } from "../core/clients/fhevmDecryptClient.js";
export type { Fhevm, FhevmOptions } from "../core/types/coreFhevmClient.js";
export type { WithAll } from "../core/types/coreFhevmRuntime.js";

// Domain types

export type { FhevmChain } from "../core/types/fhevmChain.js";
export type {
  FhevmHandle,
  ExternalFhevmHandle,
} from "../core/types/fhevmHandle.js";
export { toFhevmHandle } from "../core/handle/FhevmHandle.js";
export type { DecryptedFhevmHandle } from "../core/types/decryptedFhevmHandle.js";
export type { FheType, FheTypeId } from "../core/types/fheType.js";
export type { VerifiedInputProof } from "../core/types/inputProof.js";
export type { ZkProof } from "../core/types/zkProof.js";
export type { PublicDecryptionProof } from "../core/types/publicDecryptionProof.js";
export type {
  KmsUserDecryptEIP712,
  KmsUserDecryptEIP712Message,
} from "../core/types/kms.js";
export type {
  E2eTransportKeyPair,
  FhevmDecryptionKey,
} from "../core/user/FhevmDecryptionKey-p.js";
export type {
  TypedValue,
  TypedValueLike,
  BytesHex,
  Bytes32Hex,
  Bytes65Hex,
  Address,
} from "../core/types/primitives.js";
