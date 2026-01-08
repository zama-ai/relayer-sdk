// Base errors
export type { RelayerErrorBase } from './RelayerErrorBase';
export type { RelayerErrorBaseParams } from './RelayerErrorBase';
export type { ContractError, ContractErrorBase } from './ContractErrorBase';
export type { ContractErrorBaseParams } from './ContractErrorBase';

// Address errors
export type { AddressError } from './AddressError';
export type { ChecksummedAddressError } from './ChecksummedAddressError';

// ACL errors
export type {
  ACLPublicDecryptionError,
  ACLUserDecryptionError,
} from './ACLError';

// Encryption errors
export type { EncryptionError } from './EncryptionError';

// FHE errors
export type { FheTypeError } from './FheTypeError';
export type { FhevmConfigError } from './FhevmConfigError';
export type { FhevmHandleError } from './FhevmHandleError';
export type { TFHEError } from './TFHEError';
export type { ZKProofError } from './ZKProofError';

// Relayer errors
export type {
  InvalidRelayerUrlError,
  InvalidRelayerUrlErrorParams,
} from './InvalidRelayerUrlError';
export type { RelayerFetchError } from './RelayerFetchError';
export type {
  RelayerGetKeyUrlError,
  RelayerGetKeyUrlInvalidResponseError,
} from './RelayerGetKeyUrlError';
export type {
  RelayerInvalidProofError,
  RelayerInvalidProofErrorParams,
} from './RelayerInvalidProofError';
export type {
  RelayerProviderError,
  RelayerProviderErrorParams,
} from './RelayerProviderError';
export type {
  RelayerTooManyHandlesError,
  RelayerTooManyHandlesErrorParams,
} from './RelayerTooManyHandlesError';

// Coprocessor signer errors
export type {
  RelayerDuplicateCoprocessorSignerError,
  RelayerDuplicateCoprocessorSignerErrorParams,
} from './RelayerDuplicateCoprocessorSignerError';
export type { RelayerThresholdCoprocessorSignerError } from './RelayerThresholdCoprocessorSignerError';
export type {
  RelayerUnknownCoprocessorSignerError,
  RelayerUnknownCoprocessorSignerErrorParams,
} from './RelayerUnknownCoprocessorSignerError';

// KMS signer errors
export type {
  RelayerDuplicateKmsSignerError,
  RelayerDuplicateKmsSignerErrorParams,
} from './RelayerDuplicateKmsSignerError';
export type { RelayerThresholdKmsSignerError } from './RelayerThresholdKmsSignerError';
export type {
  RelayerUnknownKmsSignerError,
  RelayerUnknownKmsSignerErrorParams,
} from './RelayerUnknownKmsSignerError';

// Type validation errors
export type {
  InvalidPropertyError,
  ExpectedPropertyType,
} from './InvalidPropertyError';
export type { InvalidTypeError } from './InvalidTypeError';

// Internal errors
export type { InternalError, InternalErrorParams } from './InternalError';

// Utilities
export { ensureError, assertNever, getErrorMessage } from './utils';
