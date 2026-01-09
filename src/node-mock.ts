import * as NodeTFHEPkg from 'node-tfhe';
import * as NodeTKMSPkg from 'node-tkms';
import type { TFHEType, TKMSType } from './sdk';
import { setTFHE, setTKMS } from './sdk/lowlevel/wasm-modules';

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

// Node-specific functions
export { createTfheKeypair, createTfhePublicKey } from './node_tfhe';
