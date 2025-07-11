import { SERIALIZED_SIZE_LIMIT_PK, SERIALIZED_SIZE_LIMIT_CRS } from '../utils';
import { fetchRelayerGet, RelayerKeyUrlResponse } from './fetchRelayer';

// export type RelayerKeysItem = {
//   data_id: string;
//   param_choice: number;
//   urls: string[];
//   signatures: string[];
// };

// export type RelayerKey = {
//   data_id: string;
//   param_choice: number;
//   signatures: string[];
//   urls: string[];
// };

// export type RelayerKeys = {
//   response: {
//     fhe_key_info: {
//       fhe_public_key: RelayerKey;
//       fhe_server_key: RelayerKey;
//     }[];
//     verf_public_key: {
//       key_id: string;
//       server_id: number;
//       verf_public_key_address: string;
//       verf_public_key_url: string;
//     }[];
//     crs: {
//       [key: string]: RelayerKeysItem;
//     };
//   };
//   status: string;
// };

const keyurlCache: { [key: string]: any } = {};
export const getKeysFromRelayer = async (
  url: string,
  publicKeyId?: string | null,
) => {
  if (keyurlCache[url]) {
    return keyurlCache[url];
  }

  const data: RelayerKeyUrlResponse = await fetchRelayerGet(
    'KEY_URL',
    `${url}/v1/keyurl`,
  );

  try {
    // const response = await fetch(`${url}/v1/keyurl`);
    // if (!response.ok) {
    //   await throwRelayerResponseError("KEY_URL", response);
    // }
    //const data: RelayerKeys = await response.json();
    //if (data) {
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
    keyurlCache[url] = result;
    return result;
    // } else {
    //   throw new Error('No public key available');
    // }
  } catch (e) {
    throw new Error('Impossible to fetch public key: wrong relayer url.', {
      cause: e,
    });
  }
};
