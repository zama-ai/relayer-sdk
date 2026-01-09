// ESM explicit named re-export is required.
import type { TFHEType, TKMSType } from './sdk/lowlevel/public-api';
import { setTFHE, setTKMS } from './sdk/lowlevel/wasm-modules';

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

setTFHE({
  default: initTFHE,
  initThreadPool,
  init_panic_hook,
  TfheCompactPublicKey: TfheCompactPublicKey as any,
  CompactPkeCrs: CompactPkeCrs as any,
  CompactCiphertextList: CompactCiphertextList as any,
  ZkComputeLoad: ZkComputeLoad as any,
  ProvenCompactCiphertextList: ProvenCompactCiphertextList as any,
} satisfies TFHEType);

setTKMS({
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
} satisfies TKMSType);

// window.TFHE = {
//   default: initTFHE,
//   initThreadPool,
//   init_panic_hook,
//   TfheCompactPublicKey: TfheCompactPublicKey as any,
//   CompactPkeCrs: CompactPkeCrs as any,
//   CompactCiphertextList: CompactCiphertextList as any,
//   ZkComputeLoad: ZkComputeLoad as any,
//   ProvenCompactCiphertextList: ProvenCompactCiphertextList as any,
// } satisfies TFHEType;

// window.TKMS = {
//   default: initTKMS,
//   u8vec_to_ml_kem_pke_pk,
//   u8vec_to_ml_kem_pke_sk,
//   new_client,
//   new_server_id_addr,
//   process_user_decryption_resp_from_js,
//   ml_kem_pke_keygen,
//   ml_kem_pke_pk_to_u8vec,
//   ml_kem_pke_sk_to_u8vec,
//   ml_kem_pke_get_pk,
// } satisfies TKMSType;

export type { InitInput as TFHEInput } from 'tfhe';
export type { InitInput as KMSInput } from 'tkms';

// Re-export everything from main entry point
export * from './index';

// Additional type exports for node consumers
export type * from './base/types/primitives';
export type * from './base/types/utils';
export type * from './relayer-provider/types/public-api';
export type * from './relayer-provider/v2/errors/public-types';

// Error types
export type * from './errors';

// Base utils
export { isChecksummedAddress, isAddress } from './base/address';

// SDK classes, constants and types
export * from './sdk';

// Constant Configs
export {
  SepoliaConfig,
  SepoliaConfigV1,
  SepoliaConfigV2,
  MainnetConfig,
  MainnetConfigV1,
  MainnetConfigV2,
} from './configs';

// Web-specific functions
export { initSDK } from './web_init';
