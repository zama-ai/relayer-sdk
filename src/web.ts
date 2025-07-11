// ESM explicit named re-export is required.
import initTFHE, {
  initThreadPool,
  init_panic_hook,
  TfheCompactPublicKey,
  CompactPkeCrs,
  CompactCiphertextList,
  ZkComputeLoad,
} from 'tfhe';
import {
  default as initTKMS,
  u8vec_to_ml_kem_pke_pk,
  u8vec_to_ml_kem_pke_sk,
  new_client,
  new_server_id_addr,
  process_user_decryption_resp_from_js,
  ml_kem_pke_keygen,
  ml_kem_pke_pk_to_u8vec,
  ml_kem_pke_sk_to_u8vec,
  ml_kem_pke_get_pk,
} from 'tkms';
window.TFHE = {
  default: initTFHE,
  initThreadPool,
  init_panic_hook,
  TfheCompactPublicKey: TfheCompactPublicKey as any,
  CompactPkeCrs: CompactPkeCrs as any,
  CompactCiphertextList: CompactCiphertextList as any,
  ZkComputeLoad: ZkComputeLoad as any,
};
window.TKMS = {
  default: initTKMS,
  u8vec_to_ml_kem_pke_pk,
  u8vec_to_ml_kem_pke_sk,
  new_client,
  new_server_id_addr,
  process_user_decryption_resp_from_js,
  ml_kem_pke_keygen,
  ml_kem_pke_pk_to_u8vec,
  ml_kem_pke_sk_to_u8vec,
  ml_kem_pke_get_pk,
};

export { InitInput as TFHEInput } from 'tfhe';
export { InitInput as KMSInput } from 'tkms';

export {
  RelayerEncryptedInput,
  PublicParams,
  HandleContractPair,
  FhevmInstance,
  createInstance,
  EncryptionTypes,
  ENCRYPTION_TYPES,
  DecryptedResults,
  generateKeypair,
  createEIP712,
  EIP712,
  EIP712Type,
  SepoliaConfig,
  getErrorCauseCode,
  getErrorCauseStatus,
} from './index';
export { FhevmInstanceConfig } from './config';
export { initSDK } from './init';
