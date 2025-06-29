declare module '*.bin' {
  var data: Uint8Array;
  export default data;
}

export {};

declare global {
  type TFHE = {
    TFHEInput?: any;
    default?: typeof init;
    TfheCompactPublicKey: any;
    CompactPkeCrs: any;
    initThreadPool?: any;
    init_panic_hook: any;
    CompactCiphertextList: any;
    ZkComputeLoad: any;
  };
  type TKMS = {
    default?: any;
    u8vec_to_ml_kem_pke_pk: any;
    u8vec_to_ml_kem_pke_sk: any;
    new_client: any;
    new_server_id_addr: any;
    process_user_decryption_resp_from_js: any;
    ml_kem_pke_keygen: any;
    ml_kem_pke_pk_to_u8vec: any;
    ml_kem_pke_sk_to_u8vec: any;
    ml_kem_pke_get_pk: any;
  };
  var TFHE: TFHE;
  var TKMS: TKMS;
}
