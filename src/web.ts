// ESM explicit named re-export is required.
import initTFHE, {
  initThreadPool,
  init_panic_hook,
  TfheCompactPublicKey,
  CompactPkeCrs,
  CompactCiphertextList,
  ZkComputeLoad,
  ProvenCompactCiphertextList,
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

import type { TFHEType, TKMSType } from './sdk/lowlevel/types';

window.TFHE = {
  default: initTFHE,
  initThreadPool,
  init_panic_hook,
  TfheCompactPublicKey: TfheCompactPublicKey as any,
  CompactPkeCrs: CompactPkeCrs as any,
  CompactCiphertextList: CompactCiphertextList as any,
  ZkComputeLoad: ZkComputeLoad as any,
  ProvenCompactCiphertextList: ProvenCompactCiphertextList as any,
} satisfies TFHEType;

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
} satisfies TKMSType;

export { InitInput as TFHEInput } from 'tfhe';
export { InitInput as KMSInput } from 'tkms';

export type {
  RelayerEncryptedInput,
  PublicParams,
  HandleContractPair,
  FhevmInstance,
  EncryptionBits,
  UserDecryptResults,
  PublicDecryptResults,
  ClearValueType,
  ClearValues,
  EIP712,
  EIP712Type,
  FhevmInstanceConfig,
  FhevmInstanceOptions,
  ZKProofLike,
  FhevmPkeCrsType,
  FhevmPkeConfigType,
  FhevmPublicKeyType,
  FhevmPkeCrsByCapacityType,
  Prettify,
} from './index';

export type {
  Bytes32Hex,
  BytesHex,
  BytesHexNo0x,
  FheTypeEncryptionBitwidth,
  FheTypeEncryptionBitwidthToIdMap,
  FheTypeNameToIdMap,
} from './base/types/primitives';

export type * from './relayer-provider/types/public-api';
export type * from './relayer-provider/v2/errors/public-types';
export type * from './sdk/lowlevel/types';

export {
  SepoliaConfig,
  SepoliaConfigV1,
  SepoliaConfigV2,
  MainnetConfig,
  MainnetConfigV1,
  MainnetConfigV2,
} from './configs';

export {
  createInstance,
  generateKeypair,
  createEIP712,
  getErrorCauseCode,
  getErrorCauseStatus,
} from './index';

export { initSDK } from './web_init';
