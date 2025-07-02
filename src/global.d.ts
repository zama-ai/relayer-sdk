// see comments in tfheType.ts
import { TFHEType } from './tfheType';
import { TKMSType } from './tkmsType';

declare module '*.bin' {
  var data: Uint8Array;
  export default data;
}

export {};

declare global {
  var TFHE: TFHEType;
  var TKMS: TKMSType;
}
