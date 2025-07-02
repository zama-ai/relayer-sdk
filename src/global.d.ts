// Import the types from 'tfhe_tkms_types.d.ts' (see comments in tfhe_tkms_types.ts)
import { TFHEType, TKMSType } from "./tfhe_tkms_types";

declare module '*.bin' {
  var data: Uint8Array;
  export default data;
}

export {};

declare global {
  var TFHE: TFHEType;
  var TKMS: TKMSType;
}
