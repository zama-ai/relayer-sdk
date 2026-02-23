import type {
  TFHEPkeParams,
  TFHEPkeCrsBytes,
  TFHEPublicKeyBytes,
} from '@sdk/types/public-api';
import { CompactPkeCrs, TfheClientKey, TfheCompactPublicKey } from 'node-tfhe';
import fs from 'fs';
import {
  SERIALIZED_SIZE_LIMIT_CRS,
  SERIALIZED_SIZE_LIMIT_PK,
} from '@sdk/lowlevel/constants';
import { createTFHEPkeParams } from '@sdk/lowlevel/keys/TFHEPkeParams';

////////////////////////////////////////////////////////////////////////////////

/**
 * Warning!
 *
 * These binary files were serialized using an older version of TFHE-rs.
 * The serialization format may differ from the current version, so they need
 * to be deserialized and re-serialized using the current TFHE WASM library
 * to ensure byte-for-byte consistency in tests.
 */
const _oldVersionPrivateKeyBytesBuffer = fs.readFileSync(
  `${__dirname}/keys/privateKey.bin`,
);
const _oldVersionPubKeyBytesBuffer = fs.readFileSync(
  `${__dirname}/keys/publicKey.bin`,
);
const _oldVersionPkeCrs2048BytesBuffer = fs.readFileSync(
  `${__dirname}/keys/crs2048.bin`,
);

////////////////////////////////////////////////////////////////////////////////

export const publicKeyId = '408d8cbaa51dece7f782fe04ba0b1c1d017b1088';
export const publicParamsId = 'd8d94eb3a23d22d3eb6b5e7b694e8afcd571d906';

////////////////////////////////////////////////////////////////////////////////
// Wasm objects
////////////////////////////////////////////////////////////////////////////////

// TfheClientKey can be deserialized using old format
export const tfheClientKeyWasm = TfheClientKey.safe_deserialize(
  _oldVersionPrivateKeyBytesBuffer,
  SERIALIZED_SIZE_LIMIT_PK,
);

// TfheCompactPublicKey can be deserialized using old format
export const tfheCompactPublicKeyWasm = TfheCompactPublicKey.safe_deserialize(
  _oldVersionPubKeyBytesBuffer,
  SERIALIZED_SIZE_LIMIT_PK,
);

// CompactPkeCrs can be deserialized using old format
export const tfheCompactPkeCrsWasm = CompactPkeCrs.safe_deserialize(
  _oldVersionPkeCrs2048BytesBuffer,
  SERIALIZED_SIZE_LIMIT_CRS,
);

////////////////////////////////////////////////////////////////////////////////
// Bytes data
////////////////////////////////////////////////////////////////////////////////

export const tfheCompactPublicKeyBytes =
  tfheCompactPublicKeyWasm.safe_serialize(SERIALIZED_SIZE_LIMIT_PK);

export const tfheCompactPkeCrsBytes = tfheCompactPkeCrsWasm.safe_serialize(
  SERIALIZED_SIZE_LIMIT_CRS,
);

////////////////////////////////////////////////////////////////////////////////
// High level structures
////////////////////////////////////////////////////////////////////////////////

export const fhevmPkeCrsByCapacity = {
  2048: {
    publicParams: tfheCompactPkeCrsBytes,
    publicParamsId,
  },
};
Object.freeze(fhevmPkeCrsByCapacity['2048']);
Object.freeze(fhevmPkeCrsByCapacity);

export const fhevmPublicKey = {
  data: tfheCompactPublicKeyBytes,
  id: publicKeyId,
};
Object.freeze(fhevmPublicKey);

export const fhevmPkeConfig = {
  publicKey: fhevmPublicKey,
  publicParams: fhevmPkeCrsByCapacity,
};
Object.freeze(fhevmPkeConfig);

export const pkeParams: TFHEPkeParams = createTFHEPkeParams({
  publicKey: {
    id: fhevmPublicKey.id,
    bytes: fhevmPublicKey.data,
  },
  pkeCrs: {
    id: fhevmPkeCrsByCapacity[2048].publicParamsId,
    bytes: fhevmPkeCrsByCapacity[2048].publicParams,
    capacity: 2048,
  },
});

////////////////////////////////////////////////////////////////////////////////

export const tfhePublicKeyBytes: TFHEPublicKeyBytes = {
  id: publicKeyId,
  bytes: tfheCompactPublicKeyBytes,
};
Object.freeze(tfhePublicKeyBytes);

export const tfhePublicKeyBytesWithSrcUrl: TFHEPublicKeyBytes = {
  id: publicKeyId,
  bytes: tfheCompactPublicKeyBytes,
  srcUrl: 'https://example.com/publicKey.bin',
};
Object.freeze(tfhePublicKeyBytes);

export const tfhePkeCrsBytes: TFHEPkeCrsBytes = {
  id: publicParamsId,
  bytes: tfheCompactPkeCrsBytes,
  capacity: 2048,
};
Object.freeze(tfhePkeCrsBytes);

export const tfhePkeCrsBytesWithSrcUrl: TFHEPkeCrsBytes = {
  ...tfhePkeCrsBytes,
  srcUrl: 'https://example.com/crs2048.bin',
};
Object.freeze(tfhePkeCrsBytesWithSrcUrl);

////////////////////////////////////////////////////////////////////////////////
