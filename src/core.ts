// Side-effect-free entrypoint for shared types and helpers.
// This module must not import runtime environment bootstraps.

// Additional type exports for consumers
export type * from './base/types/primitives';
export type * from './base/types/utils';
export type * from './relayer-provider/types/public-api';
export type * from './relayer-provider/v2/errors/public-types';

// Error types
export type * from './errors';

// Base helpers
export { isChecksummedAddress, isAddress } from './base/address';

// Shared SDK primitives used in type surfaces
export { FhevmHandle } from './sdk/FhevmHandle';
export type { FhevmHandleLike } from './sdk/FhevmHandle';
export { ZKProof } from './sdk/ZKProof';

// SDK KMS APIs (pure JS, no WASM bootstrap)
export { KmsEIP712 } from './sdk/kms/KmsEIP712';
export { KmsSignersVerifier } from './sdk/kms/KmsSignersVerifier';
export { PublicDecryptionProof } from './sdk/kms/PublicDecryptionProof';

export type * from './sdk/kms/public-api';
export type { InputProofBytesType } from './sdk/coprocessor/public-api';

// Core relayer/FHEVM types
export type * from './types/relayer';

// FhevmInstance is currently declared in index.ts
export type { FhevmInstance } from './index';
export type { FhevmConfigType } from './sdk/fhevmHostChain';
