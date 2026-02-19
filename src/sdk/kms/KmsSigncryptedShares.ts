import type {
  KmsSigncryptedSharesMetadata,
  KmsSigncryptedShare,
} from '../types/private';

import type {
  KmsSigncryptedShares,
  KmsSigncryptedSharesBrand,
} from '../types/public-api';

////////////////////////////////////////////////////////////////////////////////

const PRIVATE_KMS_SIGNCRYPTED_SHARES_TOKEN = Symbol(
  'KmsSigncryptedShares.token',
);

const GET_METADATA_FUNC = Symbol('KmsSigncryptedShares.getMetadata');
const GET_SHARES_FUNC = Symbol('KmsSigncryptedShares.getShares');

////////////////////////////////////////////////////////////////////////////////

class KmsSigncryptedSharesImpl implements KmsSigncryptedShares {
  declare readonly [KmsSigncryptedSharesBrand]: never;
  readonly #metadata: KmsSigncryptedSharesMetadata;
  readonly #shares: readonly KmsSigncryptedShare[];

  constructor(
    metadata: KmsSigncryptedSharesMetadata,
    shares: readonly KmsSigncryptedShare[],
  ) {
    this.#metadata = {
      kmsVerifier: metadata.kmsVerifier,
      eip712Signature: metadata.eip712Signature,
      eip712SignerAddress: metadata.eip712SignerAddress,
      fhevmHandles: [...metadata.fhevmHandles],
    };
    Object.freeze(this.#metadata);
    Object.freeze(this.#metadata.fhevmHandles);

    this.#shares = [...shares];
    Object.freeze(this.#shares);
    this.#shares.forEach((share) => Object.freeze(share));
  }

  public [GET_SHARES_FUNC](token: symbol): readonly KmsSigncryptedShare[] {
    if (token !== PRIVATE_KMS_SIGNCRYPTED_SHARES_TOKEN) {
      throw new Error('Unauthorized');
    }
    return this.#shares;
  }

  public [GET_METADATA_FUNC](token: symbol): KmsSigncryptedSharesMetadata {
    if (token !== PRIVATE_KMS_SIGNCRYPTED_SHARES_TOKEN) {
      throw new Error('Unauthorized');
    }
    return this.#metadata;
  }
}

export function createKmsSigncryptedShares(
  metadata: KmsSigncryptedSharesMetadata,
  shares: readonly KmsSigncryptedShare[],
): KmsSigncryptedShares {
  return new KmsSigncryptedSharesImpl(metadata, shares);
}

// Internal to SDK
export function getSharesInternal(
  signcryptedShares: KmsSigncryptedShares,
): readonly KmsSigncryptedShare[] {
  if (!(signcryptedShares instanceof KmsSigncryptedSharesImpl)) {
    throw new Error('');
  }
  return signcryptedShares[GET_SHARES_FUNC](
    PRIVATE_KMS_SIGNCRYPTED_SHARES_TOKEN,
  );
}

export function getMetadataInternal(
  signcryptedShares: KmsSigncryptedShares,
): KmsSigncryptedSharesMetadata {
  if (!(signcryptedShares instanceof KmsSigncryptedSharesImpl)) {
    throw new Error('');
  }
  return signcryptedShares[GET_METADATA_FUNC](
    PRIVATE_KMS_SIGNCRYPTED_SHARES_TOKEN,
  );
}
