import * as NodeTFHEPkg from 'node-tfhe';
import * as NodeTKMSPkg from 'node-tkms';
import type { TFHEType, TKMSType } from '@sdk/lowlevel/public-api';
import { setTFHE, setTKMS } from '@sdk/lowlevel/wasm-modules';

// Initialize module-scoped variables instead of globals
export function initSDK({
  TFHEPkg,
  TKMSPkg,
}: {
  TFHEPkg?: TFHEType;
  TKMSPkg?: TKMSType;
}) {
  if (TFHEPkg) {
    setTFHE(TFHEPkg);
  } else {
    setTFHE(NodeTFHEPkg satisfies TFHEType);
  }
  if (TKMSPkg) {
    setTKMS(TKMSPkg);
  } else {
    setTKMS(NodeTKMSPkg satisfies TKMSType);
  }
}

// Re-export everything from main entry point
export * from './index';

// Additional type exports for node consumers
export type * from '@base/types/primitives';
export type * from '@base/types/utils';

// Base utils
export { isChecksummedAddress, isAddress } from '@base/address';

// Constant Configs
export {
  SepoliaConfig,
  SepoliaConfigV1,
  SepoliaConfigV2,
  MainnetConfig,
  MainnetConfigV1,
  MainnetConfigV2,
} from './index';

// Node-specific functions
export { createTfheKeypair, createTfhePublicKey } from './node_tfhe';
