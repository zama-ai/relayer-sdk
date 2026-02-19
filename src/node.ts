import * as TFHEPkg from 'node-tfhe';
import * as TKMSPkg from 'node-tkms';
import type { TFHEType, TKMSType } from '@sdk/lowlevel/public-api';
import { setTFHE, setTKMS } from '@sdk/lowlevel/wasm-modules';

// Initialize module-scoped variables instead of globals
setTFHE(TFHEPkg satisfies TFHEType);
setTKMS(TKMSPkg satisfies TKMSType);

// Re-export everything from main entry point
export * from './index';

// Additional type exports for node consumers
export type * from '@base/types/primitives';
export type * from '@base/types/utils';
export type * from '@relayer/types/public-api';

// Base utils
export { isChecksummedAddress, isAddress } from './base/address';

// SDK classes, constants and types
export type * from '@sdk/types/public-api';

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
