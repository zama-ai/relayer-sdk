import * as TFHEPkg from 'node-tfhe';
import * as TKMSPkg from 'node-tkms';
import type { TFHEType, TKMSType } from './sdk';

// Node-specific global setup
global.TFHE = TFHEPkg satisfies TFHEType;
global.TKMS = TKMSPkg satisfies TKMSType;

// Re-export everything from main entry point
export * from './index';

// Additional type exports for node consumers
export type * from './base/types/primitives';
export type * from './base/types/utils';
export type * from './relayer-provider/types/public-api';
export type * from './relayer-provider/v2/errors/public-types';

// Error types
export type * from './errors';

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
