import * as TFHEPkg from 'node-tfhe';
import * as TKMSPkg from 'node-tkms';

global.TFHE = TFHEPkg;
global.TKMS = TKMSPkg;

// CommonJS no need to perform explicit named re-export. Wildcard is enough.
export type { TFHEType } from './tfheType';

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
  Auth,
  BearerToken,
  ApiKeyCookie,
  ApiKeyHeader,
  FhevmInstanceConfig,
  FhevmInstanceOptions,
} from './index';

export {
  SepoliaConfig,
  MainnetConfig,
  createInstance,
  generateKeypair,
  createEIP712,
  getErrorCauseCode,
  getErrorCauseStatus,
} from './index';

export { createTfheKeypair, createTfhePublicKey } from './tfhe';
