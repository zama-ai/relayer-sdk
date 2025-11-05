import { CompactPkeCrs, TfheClientKey, TfheCompactPublicKey } from 'node-tfhe';
import fs from 'fs';
import { SERIALIZED_SIZE_LIMIT_CRS, SERIALIZED_SIZE_LIMIT_PK } from '../utils';
import { PublicParams } from 'src/sdk/encrypt';

const privKey = fs.readFileSync(`${__dirname}/keys/privateKey.bin`);
const pubKey = fs.readFileSync(`${__dirname}/keys/publicKey.bin`);
const params2048 = fs.readFileSync(`${__dirname}/keys/crs2048.bin`);

export const publicKeyId = '408d8cbaa51dece7f782fe04ba0b1c1d017b1088';
const publicParamsId = 'd8d94eb3a23d22d3eb6b5e7b694e8afcd571d906';
export const privateKey = TfheClientKey.safe_deserialize(
  privKey,
  SERIALIZED_SIZE_LIMIT_PK,
);
export const publicKey = TfheCompactPublicKey.safe_deserialize(
  pubKey,
  SERIALIZED_SIZE_LIMIT_PK,
);
export const publicParams: PublicParams = {
  2048: {
    publicParams: CompactPkeCrs.safe_deserialize(
      params2048,
      SERIALIZED_SIZE_LIMIT_CRS,
    ),
    publicParamsId,
  },
};
