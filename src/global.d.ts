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
  type TKMS = any;
  var TFHE: TFHE;
  var TKMS: TKMS;
}
