import * as TFHEPkg from 'node-tfhe';
import * as TKMSPkg from 'node-tkms';

// CommonJS no need to perform explicit named re-export. Wildcard is enough.
import type { TFHEType, TKMSType } from './sdk/lowlevel/types';

export type { TFHEType };

global.TFHE = TFHEPkg satisfies TFHEType;
global.TKMS = TKMSPkg satisfies TKMSType;

export type {
  RelayerEncryptedInput,
  PublicParams,
  HandleContractPair,
  FhevmInstance,
  EncryptionBits,
  UserDecryptResults,
  PublicDecryptResults,
  ClearValueType,
  ClearValues,
  EIP712,
  EIP712Type,
  FhevmInstanceConfig,
  FhevmInstanceOptions,
  ZKProofLike,
  FhevmPkeCrsType,
  FhevmPkeConfigType,
  FhevmPublicKeyType,
  FhevmPkeCrsByCapacityType,
  Prettify,
} from './index';

export type {
  Bytes32Hex,
  BytesHex,
  BytesHexNo0x,
  FheTypeEncryptionBitwidth,
  FheTypeEncryptionBitwidthToIdMap,
  FheTypeNameToIdMap,
} from './base/types/primitives';

export type * from './relayer-provider/types/public-api';
export type * from './relayer-provider/v2/errors/public-types';
export type * from './sdk/lowlevel/types';

export {
  createInstance,
  generateKeypair,
  createEIP712,
  getErrorCauseCode,
  getErrorCauseStatus,
} from './index';

export {
  SepoliaConfig,
  SepoliaConfigV1,
  SepoliaConfigV2,
  MainnetConfig,
  MainnetConfigV1,
  MainnetConfigV2,
} from './configs';

export { createTfheKeypair, createTfhePublicKey } from './node_tfhe';
