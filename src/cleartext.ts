// Cleartext mode entry point — no TFHE/TKMS WASM dependencies required.
// Re-exports from the main index plus the cleartext module.

// Re-export everything from main entry point
export * from './index';

// Additional type exports for consumers
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

// Cleartext-specific exports
export { createCleartextInstance, CleartextExecutor } from './cleartext/index';
export type { CleartextInstanceConfig } from './cleartext/index';
