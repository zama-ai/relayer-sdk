import {
  BrowserProvider,
  Contract,
  Eip1193Provider,
  JsonRpcProvider,
  Provider,
} from 'ethers';
import { PublicParams } from './sdk/encrypt';
import { getKeysFromRelayer } from './relayer/network';
import {
  removeSlashSuffix,
  SERIALIZED_SIZE_LIMIT_PK,
  SERIALIZED_SIZE_LIMIT_CRS,
} from './utils';
import type { TFHEType } from './tfheType';
import { Auth } from './auth';
import { Prettify } from './utils/types';

const abiKmsVerifier = [
  'function getKmsSigners() view returns (address[])',
  'function getThreshold() view returns (uint256)',
];

const abiInputVerifier = [
  'function getCoprocessorSigners() view returns (address[])',
  'function getThreshold() view returns (uint256)',
];

export type FhevmInstanceOptions = {
  auth?: Auth;
};

export type FhevmInstanceConfig = Prettify<
  {
    verifyingContractAddressDecryption: string;
    verifyingContractAddressInputVerification: string;
    kmsContractAddress: string;
    inputVerifierContractAddress: string;
    aclContractAddress: string;
    gatewayChainId: number;
    chainId?: number;
    relayerUrl?: string;
    network?: Eip1193Provider | string;
    publicParams?: PublicParams<Uint8Array> | null;
    publicKey?: {
      data: Uint8Array | null;
      id: string | null;
    };
  } & FhevmInstanceOptions
>;

export const getProvider = (network: string | Eip1193Provider | undefined) => {
  if (typeof network === 'string') {
    return new JsonRpcProvider(network);
  } else if (network) {
    return new BrowserProvider(network);
  }
  throw new Error(
    'You must provide a network URL or a EIP1193 object (eg: window.ethereum)',
  );
};

export const getChainId = async (
  provider: Provider,
  config: FhevmInstanceConfig,
): Promise<number> => {
  if (config.chainId && typeof config.chainId === 'number') {
    return config.chainId;
  } else if (config.chainId && typeof config.chainId !== 'number') {
    throw new Error('chainId must be a number.');
  } else {
    const chainId = (await provider.getNetwork()).chainId;
    return Number(chainId);
  }
};

export const getTfheCompactPublicKey = async (config: {
  relayerVersionUrl?: string;
  publicKey?: {
    data: Uint8Array | null;
    id: string | null;
  };
}): Promise<{
  publicKey: TFHEType['TfheCompactPublicKey'];
  publicKeyId: string;
}> => {
  if (config.relayerVersionUrl && !config.publicKey) {
    const inputs = await getKeysFromRelayer(
      removeSlashSuffix(config.relayerVersionUrl),
    );
    return { publicKey: inputs.publicKey, publicKeyId: inputs.publicKeyId };
  } else if (config.publicKey && config.publicKey.data && config.publicKey.id) {
    const buff = config.publicKey.data;
    try {
      return {
        publicKey: TFHE.TfheCompactPublicKey.safe_deserialize(
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
};

export const getPublicParams = async (config: {
  relayerVersionUrl?: string;
  publicParams?: PublicParams<Uint8Array> | null;
}): Promise<PublicParams> => {
  if (config.relayerVersionUrl && !config.publicParams) {
    const inputs = await getKeysFromRelayer(
      removeSlashSuffix(config.relayerVersionUrl),
    );
    return inputs.publicParams;
  } else if (config.publicParams && config.publicParams['2048']) {
    const buff = config.publicParams['2048'].publicParams;
    try {
      return {
        2048: {
          publicParams: TFHE.CompactPkeCrs.safe_deserialize(
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
};

export const getKMSSigners = async (
  provider: Provider,
  kmsContractAddress: `0x${string}`,
): Promise<string[]> => {
  const kmsContract = new Contract(
    kmsContractAddress,
    abiKmsVerifier,
    provider,
  );
  const signers: string[] = await kmsContract.getKmsSigners();
  return signers;
};

export const getKMSSignersThreshold = async (
  provider: Provider,
  kmsContractAddress: `0x${string}`,
): Promise<number> => {
  const kmsContract = new Contract(
    kmsContractAddress,
    abiKmsVerifier,
    provider,
  );
  const threshold: bigint = await kmsContract.getThreshold();
  return Number(threshold); // threshold is always supposed to fit in a number
};

export const getCoprocessorSigners = async (
  provider: Provider,
  inputVerifierContractAddress: `0x${string}`,
): Promise<string[]> => {
  const inputContract = new Contract(
    inputVerifierContractAddress,
    abiInputVerifier,
    provider,
  );
  const signers: string[] = await inputContract.getCoprocessorSigners();
  return signers;
};

export const getCoprocessorSignersThreshold = async (
  provider: Provider,
  inputVerifierContractAddress: `0x${string}`,
): Promise<number> => {
  const inputContract = new Contract(
    inputVerifierContractAddress,
    abiInputVerifier,
    provider,
  );
  const threshold: bigint = await inputContract.getThreshold();
  return Number(threshold); // threshold is always supposed to fit in a number
};
