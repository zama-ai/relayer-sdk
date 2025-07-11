import * as TFHEPkg from 'node-tfhe';
import * as TKMSPkg from 'node-tkms';

global.TFHE = TFHEPkg;
global.TKMS = TKMSPkg;

// CommonJS no need to perform explicit named re-export. Wildcard is enough.
export { TFHEType } from './tfheType';

export {
  RelayerEncryptedInput,
  PublicParams,
  HandleContractPair,
  FhevmInstance,
  createInstance,
  EncryptionTypes,
  ENCRYPTION_TYPES,
  DecryptedResults,
  generateKeypair,
  createEIP712,
  EIP712,
  EIP712Type,
  SepoliaConfig,
  getErrorCauseCode,
  getErrorCauseStatus,
} from './index';
export { FhevmInstanceConfig } from './config';
export { createTfheKeypair, createTfhePublicKey } from './tfhe';
