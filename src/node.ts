import * as TFHEPkg from 'node-tfhe';
import * as TKMSPkg from 'node-tkms';
import type { TFHEType, TKMSType, TKMSTypeShape } from '@sdk/types/public-api';
import { setTFHE, setTKMS } from '@sdk/wasm-modules';

// Initialize module-scoped variables instead of globals
setTFHE(TFHEPkg satisfies TFHEType);
setTKMS(TKMSPkg satisfies TKMSTypeShape as unknown as TKMSType);

export type {
  FhevmInstanceConfig,
  FhevmInstance,
  FhevmInstanceOptions,
} from './index';
export type {
  FhevmHandle,
  ZKProofLike,
  FheTypeName,
  EncryptionBits,
} from '@fhevm-base/types/public-api';
export type {
  RelayerInputProofOptions,
  RelayerKeyUrlOptions,
  RelayerPublicDecryptOptions,
  RelayerUserDecryptOptions,
} from '@relayer/types/public-api';

export {
  toFhevmHandle,
  isFheTypeName,
  encryptionBitsFromFheTypeName,
} from '@fhevm-base/index';

export { createInstance } from './index';

// Constant Configs
export { SepoliaConfig, MainnetConfig } from './index';

// Node-specific functions
export { createTfheKeypair, createTfhePublicKey } from './node_tfhe';
