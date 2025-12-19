import type { RelayerV1KeyUrlResponse } from '../relayer-provider/v1/types';
import {
  SERIALIZED_SIZE_LIMIT_PK,
  SERIALIZED_SIZE_LIMIT_CRS,
} from '../constants';
import { fetchRelayerV1Get } from '../relayer-provider/v1/fetchRelayerV1';

const keyurlCache: { [key: string]: any } = {};
export const getKeysFromRelayer = async (
  versionUrl: string,
  publicKeyId?: string | null,
) => {
  if (keyurlCache[versionUrl]) {
    return keyurlCache[versionUrl];
  }

  const data: RelayerV1KeyUrlResponse = await fetchRelayerV1Get(
    'KEY_URL',
    `${versionUrl}/keyurl`,
  );

  try {
    let pubKeyUrl: string;

    // If no publicKeyId is provided, use the first one
    // Warning: if there are multiple keys available, the first one will most likely never be the
    // same between several calls (fetching the infos is non-deterministic)
    if (!publicKeyId) {
      pubKeyUrl = data.response.fhe_key_info[0].fhe_public_key.urls[0];
      publicKeyId = data.response.fhe_key_info[0].fhe_public_key.data_id;
    } else {
      // If a publicKeyId is provided, get the corresponding info
      const keyInfo = data.response.fhe_key_info.find(
        (info) => info.fhe_public_key.data_id === publicKeyId,
      );

      if (!keyInfo) {
        throw new Error(
          `Could not find FHE key info with data_id ${publicKeyId}`,
        );
      }

      // TODO: Get a given party's public key url instead of the first one
      pubKeyUrl = keyInfo.fhe_public_key.urls[0];
    }

    const publicKeyResponse = await fetch(pubKeyUrl);
    if (!publicKeyResponse.ok) {
      throw new Error(
        `HTTP error! status: ${publicKeyResponse.status} on ${publicKeyResponse.url}`,
      );
    }

    let publicKey: Uint8Array;
    if (typeof publicKeyResponse.bytes === 'function') {
      // bytes is not widely supported yet
      publicKey = await publicKeyResponse.bytes();
    } else {
      publicKey = new Uint8Array(await publicKeyResponse.arrayBuffer());
    }

    const publicParamsUrl = data.response.crs['2048'].urls[0];
    const publicParamsId = data.response.crs['2048'].data_id;

    const publicParams2048Response = await fetch(publicParamsUrl);
    if (!publicParams2048Response.ok) {
      throw new Error(
        `HTTP error! status: ${publicParams2048Response.status} on ${publicParams2048Response.url}`,
      );
    }

    let publicParams2048: Uint8Array;
    if (typeof publicParams2048Response.bytes === 'function') {
      // bytes is not widely supported yet
      publicParams2048 = await publicParams2048Response.bytes();
    } else {
      publicParams2048 = new Uint8Array(
        await publicParams2048Response.arrayBuffer(),
      );
    }

    let pub_key;
    try {
      pub_key = TFHE.TfheCompactPublicKey.safe_deserialize(
        publicKey,
        SERIALIZED_SIZE_LIMIT_PK,
      );
    } catch (e) {
      throw new Error('Invalid public key (deserialization failed)', {
        cause: e,
      });
    }

    let crs;
    try {
      crs = TFHE.CompactPkeCrs.safe_deserialize(
        new Uint8Array(publicParams2048),
        SERIALIZED_SIZE_LIMIT_CRS,
      );
    } catch (e) {
      throw new Error('Invalid crs (deserialization failed)', {
        cause: e,
      });
    }

    const result = {
      publicKey: pub_key,
      publicKeyId,
      publicParams: {
        2048: {
          publicParams: crs,
          publicParamsId,
        },
      },
    };
    keyurlCache[versionUrl] = result;
    return result;
  } catch (e) {
    throw new Error('Impossible to fetch public key: wrong relayer url.', {
      cause: e,
    });
  }
};
