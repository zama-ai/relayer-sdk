// =============================================================================
// FheType.ts
// =============================================================================
export {
  isFheTypeId,
  asFheTypeId,
  assertIsFheTypeId,
  isFheTypeName,
  assertIsFheTypeName,
  asFheTypeName,
  isEncryptionBits,
  asEncryptionBits,
  assertIsEncryptionBits,
  assertIsEncryptionBitsArray,
  fheTypeIdFromEncryptionBits,
  fheTypeIdFromName,
  fheTypeNameFromId,
  solidityPrimitiveTypeNameFromFheTypeId,
  encryptionBitsFromFheTypeId,
  encryptionBitsFromFheTypeName,
} from './FheType';

// =============================================================================
// errors/FhevmErrorBase.ts
// =============================================================================
export { FhevmErrorBase } from './errors/FhevmErrorBase';
export type {
  FhevmErrorBaseType,
  FhevmErrorBaseParams,
} from './errors/FhevmErrorBase';

// =============================================================================
// errors/FhevmHandleError.ts
// =============================================================================
export { FhevmHandleError } from './errors/FhevmHandleError';
export type {
  FhevmHandleErrorType,
  FhevmHandleErrorParams,
} from './errors/FhevmHandleError';

// =============================================================================
// FhevmHandle.ts
// =============================================================================
export {
  FHEVM_HANDLE_CURRENT_CIPHERTEXT_VERSION,
  fhevmHandleEquals,
  buildFhevmHandle,
  toFhevmHandle,
  fhevmHandleLikeToFhevmHandle,
  asFhevmHandle,
  asFhevmHandleLike,
  asFhevmHandleBytes32,
  asFhevmHandleBytes32Hex,
  isFhevmHandle,
  isFhevmHandleLike,
  isFhevmHandleBytes32,
  isFhevmHandleBytes32Hex,
  assertIsFhevmHandle,
  assertIsFhevmHandleLike,
  assertIsFhevmHandleLikeArray,
  assertIsFhevmHandleBytes32,
  assertIsFhevmHandleBytes32Hex,
} from './FhevmHandle';

// =============================================================================
// DecryptedFhevmHandle.ts
// =============================================================================
export {
  createDecryptedFhevmHandle,
  createDecryptedFhevmHandleArray,
} from './DecryptedFhevmHandle';

// =============================================================================
// Types
// =============================================================================
export type {
  FhevmHandleLike,
  FhevmHandle,
  FheTypeId,
  FheTypeName,
  EncryptionBitsTypeName,
  EncryptionBits,
  FheTypedValue,
  SolidityPrimitiveTypeName,
  FheTypeEncryptionBitwidth,
  ACL,
  KMSVerifierContractData,
  InputVerifierContractData,
  FHEVMExecutorContractData,
} from './types/public-api';

// =============================================================================
// ACL.ts
// =============================================================================
export { createACL } from './host-contracts/ACL';

// =============================================================================
// InputVerifier.ts
// =============================================================================
export {
  fetchInputVerifierContractData,
  createInputVerifierContractData as creatInputVerifierContractData,
} from './host-contracts/InputVerifierContractData';

// =============================================================================
// KMSVerifier.ts
// =============================================================================
export {
  fetchKMSVerifierContractData,
  createKMSVerifierContractData,
} from './host-contracts/KMSVerifierContractData';

// =============================================================================
// FHEVMExecutor.ts
// =============================================================================
export {
  fetchFHEVMExecutorContractData,
  createFHEVMExecutorContractData,
} from './host-contracts/FHEVMExecutorContractData';
