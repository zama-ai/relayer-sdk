// ESM explicit named re-export is required.
import type { TFHEType, TKMSType, TKMSTypeShape } from '@sdk/types/public-api';
import { setTFHE, setTKMS } from '@sdk/wasm-modules';

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
} satisfies TKMSTypeShape as unknown as TKMSType);

export type { InitInput as TFHEInput } from 'tfhe';
export type { InitInput as KMSInput } from 'tkms';

export type {
  FhevmInstanceConfig,
  FhevmInstance,
  FhevmInstanceOptions,
} from './index';
export type { FhevmHandle, ZKProofLike } from '@fhevm-base/types/public-api';
export type {
  RelayerInputProofOptions,
  RelayerKeyUrlOptions,
  RelayerPublicDecryptOptions,
  RelayerUserDecryptOptions,
} from '@relayer/types/public-api';

export { createInstance } from './index';

// Constant Configs
export { SepoliaConfig, MainnetConfig } from './index';

// Web-specific functions
export { initSDK } from './web_init';
