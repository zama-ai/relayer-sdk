import * as NodeTFHEPkg from 'node-tfhe';
import * as NodeTKMSPkg from 'node-tkms';
import type { TFHEType, TKMSType, TKMSTypeShape } from '@sdk/types/public-api';
import { setTFHE, setTKMS } from '@sdk/wasm-modules';

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
    setTKMS(NodeTKMSPkg satisfies TKMSTypeShape as unknown as TKMSType);
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
export { SepoliaConfig, MainnetConfig } from './index';

// Node-specific functions
export { createTfheKeypair, createTfhePublicKey } from './node_tfhe';
