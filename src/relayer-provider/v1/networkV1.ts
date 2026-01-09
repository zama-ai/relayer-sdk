import { TFHE as TFHEModule } from '../../sdk/lowlevel/wasm-modules';
import type { RelayerGetResponseKeyUrlSnakeCase } from '../types/private';
import type {
  CompactPkeCrsWasmType,
  TfheCompactPublicKeyWasmType,
} from '@sdk/lowlevel/public-api';
import type { PublicParams } from '../../types/relayer';
import {
  SERIALIZED_SIZE_LIMIT_PK,
  SERIALIZED_SIZE_LIMIT_CRS,
} from '@sdk/lowlevel/constants';
import { fetchRelayerV1Get } from './fetchRelayerV1';
import { isNonEmptyString, removeSuffix } from '@base/string';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type CachedKey = {
  publicKey: TfheCompactPublicKeyWasmType;
  publicKeyId: string;
  publicParams: {
    2048: {
      publicParams: CompactPkeCrsWasmType;
      publicParamsId: string;
    };
  };
};

////////////////////////////////////////////////////////////////////////////////

const keyurlCache: Record<string, CachedKey> = {};

////////////////////////////////////////////////////////////////////////////////

export async function getKeysFromRelayer(
  versionUrl: string,
  publicKeyId?: string | null,
): Promise<CachedKey> {
  if (versionUrl in keyurlCache) {
    return keyurlCache[versionUrl];
  }

  const data: RelayerGetResponseKeyUrlSnakeCase = (await fetchRelayerV1Get(
    'KEY_URL',
    `${versionUrl}/keyurl`,
  )) as RelayerGetResponseKeyUrlSnakeCase;

  try {
    let pubKeyUrl: string;

    // If no publicKeyId is provided, use the first one
    // Warning: if there are multiple keys available, the first one will most likely never be the
    // same between several calls (fetching the infos is non-deterministic)
    if (!isNonEmptyString(publicKeyId)) {
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
      pub_key = TFHEModule.TfheCompactPublicKey.safe_deserialize(
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
      crs = TFHEModule.CompactPkeCrs.safe_deserialize(
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
}

////////////////////////////////////////////////////////////////////////////////

export async function getTfheCompactPublicKey(config: {
  relayerVersionUrl?: string | undefined;
  publicKey?:
    | {
        data: Uint8Array | null;
        id: string | null;
      }
    | undefined;
}): Promise<{
  publicKey: TfheCompactPublicKeyWasmType;
  publicKeyId: string;
}> {
  if (isNonEmptyString(config.relayerVersionUrl) && !config.publicKey) {
    const inputs = await getKeysFromRelayer(
      removeSuffix(config.relayerVersionUrl, '/'),
    );
    return { publicKey: inputs.publicKey, publicKeyId: inputs.publicKeyId };
  } else if (config.publicKey?.data && isNonEmptyString(config.publicKey.id)) {
    const buff = config.publicKey.data;
    try {
      return {
        publicKey: TFHEModule.TfheCompactPublicKey.safe_deserialize(
          buff,
          SERIALIZED_SIZE_LIMIT_PK,
        ),
        publicKeyId: config.publicKey.id,
      };
    } catch (e) {
      throw new Error('Invalid public key (deserialization failed)', {
        cause: e,
      });
    }
  } else {
    throw new Error('You must provide a public key with its public key ID.');
  }
}

////////////////////////////////////////////////////////////////////////////////

export async function getPublicParams(config: {
  relayerVersionUrl?: string | undefined;
  publicParams?: PublicParams<Uint8Array> | null | undefined;
}): Promise<PublicParams<CompactPkeCrsWasmType>> {
  if (isNonEmptyString(config.relayerVersionUrl) && !config.publicParams) {
    const inputs = await getKeysFromRelayer(
      removeSuffix(config.relayerVersionUrl, '/'),
    );
    return inputs.publicParams;
  } else if (config.publicParams?.['2048']) {
    const buff = config.publicParams['2048'].publicParams;
    try {
      return {
        2048: {
          publicParams: TFHEModule.CompactPkeCrs.safe_deserialize(
            buff,
            SERIALIZED_SIZE_LIMIT_CRS,
          ),
          publicParamsId: config.publicParams['2048'].publicParamsId,
        },
      };
    } catch (e) {
      throw new Error('Invalid public key (deserialization failed)', {
        cause: e,
      });
    }
  } else {
    throw new Error('You must provide a valid CRS with its CRS ID.');
  }
}
