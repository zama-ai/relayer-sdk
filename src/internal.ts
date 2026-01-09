/**
 * Internal entry point for bin/ scripts.
 * NOT part of the public API - not listed in package.json exports.
 */

// Re-export everything from node.ts which initializes TFHE/TKMS modules.
// This makes internal.ts the single entry point for all internal bin/ scripts.
export * from './node';

// Address utilities
export {
  isChecksummedAddress,
  assertIsChecksummedAddress,
  checksummedAddressToBytes20,
} from './base/address';

// Bytes utilities
export {
  bytesToHex,
  bytesToHexLarge,
  hexToBytes,
  hexToBytesFaster as hexToBytesFaster,
  isBytes32Hex,
  isBytes32,
  concatBytes,
} from './base/bytes';

// String utilities
export { safeJSONstringify } from './base/string';

// Private functions
export { createRelayerFhevm } from '@relayer-provider/createRelayerFhevm';
