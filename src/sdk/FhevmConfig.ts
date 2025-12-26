import type { FhevmInstanceConfig } from '../types/relayer';
import type { ChecksummedAddress, Uint64 } from '../types/primitives';
import {
  ethers,
  type Eip1193Provider as EthersEip1193ProviderType,
  type Provider as EthersProviderType,
} from 'ethers';
import { isChecksummedAddress } from 'src/internal';
import { FhevmConfigError } from 'src/errors/FhevmConfigError';
import { isUint64 } from 'src/utils/uint';
import { removeSuffix } from 'src/utils/string';

function _checkChecksummedAddressArg(
  addr: unknown,
  argName: string,
): asserts addr is ChecksummedAddress {
  if (addr === undefined || addr === '') {
    throw new FhevmConfigError({
      message: `Missing ${argName} checksummed address`,
    });
  }
  if (!isChecksummedAddress(addr)) {
    throw new FhevmConfigError({
      message: `Invalid ${argName} checksummed address`,
    });
  }
}

function _checkChainIdArg(
  num: unknown,
  argName: string,
): asserts num is Uint64 {
  if (num === undefined) {
    throw new FhevmConfigError({
      message: `Missing ${argName}`,
    });
  }
  if (!isUint64(num)) {
    throw new FhevmConfigError({
      message: `Invalid ${argName}`,
    });
  }
}

function _isEip1193Provider(
  value: unknown,
): value is EthersEip1193ProviderType {
  return (
    typeof value === 'object' &&
    value !== null &&
    'request' in value &&
    typeof (value as EthersEip1193ProviderType).request === 'function'
  );
}

/*
export type FhevmInstanceConfig = Prettify<
  {
    publicParams?: PublicParams<Uint8Array> | null;
    publicKey?: {
      data: Uint8Array | null;
      id: string | null;
    };
  } & FhevmInstanceOptions
>;
*/

type FhevmHostNetworkConfigType =
  | { type: 'rpc'; rpcUrl: string }
  | { type: 'eip1193'; provider: EthersEip1193ProviderType };

export class FhevmConfig {
  // ACL.sol host contract address
  #aclHostContractAddress: ChecksummedAddress;
  // KMSVerifier.sol host contract address
  #kmsHostContractAddress: ChecksummedAddress;
  // InputVerifier.sol host contract address
  #inputVerifierHostContractAddress: ChecksummedAddress;
  // Host chainId (Uint64)
  #hostChainId: bigint;

  // Decryption.sol gateway contract address
  #gatewayVerifyingContractAddressDecryption: ChecksummedAddress;
  // InputVerification.sol gateway contract address
  #gatewayVerifyingContractAddressInputVerification: ChecksummedAddress;
  // Gateway chainId (Uint64)
  #gatewayChainId: bigint;
  // Relayer Url
  #relayerUrl: string;
  // Host Rpc Url or Host eip-1193 provider
  #hostNetworkConfig: FhevmHostNetworkConfigType;

  // The Host provider in ether.js format
  #ethersProvider: EthersProviderType | undefined;

  private constructor(params: {
    aclHostContractAddress: ChecksummedAddress;
    kmsVerifierHostContractAddress: ChecksummedAddress;
    inputVerifierHostContractAddress: ChecksummedAddress;
    gatewayVerifyingContractAddressDecryption: ChecksummedAddress;
    gatewayVerifyingContractAddressInputVerification: ChecksummedAddress;
    chainId: bigint;
    gatewayChainId: bigint;
    relayerUrl: string;
    hostNetworkConfig: FhevmHostNetworkConfigType;
  }) {
    this.#aclHostContractAddress = params.aclHostContractAddress;
    this.#kmsHostContractAddress = params.kmsVerifierHostContractAddress;
    this.#inputVerifierHostContractAddress =
      params.inputVerifierHostContractAddress;
    this.#gatewayVerifyingContractAddressDecryption =
      params.gatewayVerifyingContractAddressDecryption;
    this.#gatewayVerifyingContractAddressInputVerification =
      params.gatewayVerifyingContractAddressInputVerification;
    this.#hostChainId = params.chainId;
    this.#gatewayChainId = params.gatewayChainId;
    this.#relayerUrl = params.relayerUrl;
    this.#hostNetworkConfig = params.hostNetworkConfig;
    Object.freeze(this.#hostNetworkConfig);
  }

  public get aclContractAddress(): ChecksummedAddress {
    return this.#aclHostContractAddress;
  }
  public get kmsContractAddress(): ChecksummedAddress {
    return this.#kmsHostContractAddress;
  }
  public get inputVerifierContractAddress(): ChecksummedAddress {
    return this.#inputVerifierHostContractAddress;
  }
  public get verifyingContractAddressDecryption(): ChecksummedAddress {
    return this.#gatewayVerifyingContractAddressDecryption;
  }
  public get verifyingContractAddressInputVerification(): ChecksummedAddress {
    return this.#gatewayVerifyingContractAddressInputVerification;
  }
  public get chainId(): bigint {
    return this.#hostChainId;
  }
  public get gatewayChainId(): bigint {
    return this.#gatewayChainId;
  }
  public get relayerUrl(): string {
    return this.#relayerUrl;
  }
  public get network(): string | EthersEip1193ProviderType {
    if (this.#hostNetworkConfig.type === 'rpc') {
      return this.#hostNetworkConfig.rpcUrl;
    } else {
      return this.#hostNetworkConfig.provider;
    }
  }

  public getEthersProvider(): EthersProviderType {
    if (!this.#ethersProvider) {
      if (this.#hostNetworkConfig.type === 'rpc') {
        this.#ethersProvider = new ethers.JsonRpcProvider(
          this.#hostNetworkConfig.rpcUrl,
        );
      } else {
        this.#ethersProvider = new ethers.BrowserProvider(
          this.#hostNetworkConfig.provider,
        );
      }
    }
    return this.#ethersProvider;
  }

  static fromUserConfig(instanceConfig: FhevmInstanceConfig) {
    const aclContractAddress = instanceConfig.aclContractAddress;
    const kmsContractAddress = instanceConfig.kmsContractAddress;
    const inputVerifierContractAddress =
      instanceConfig.inputVerifierContractAddress;
    const verifyingContractAddressDecryption =
      instanceConfig.verifyingContractAddressDecryption;
    const verifyingContractAddressInputVerification =
      instanceConfig.verifyingContractAddressInputVerification;
    const chainId = instanceConfig.chainId;
    const gatewayChainId = instanceConfig.gatewayChainId;
    const relayerUrl = instanceConfig.relayerUrl;
    const network = instanceConfig.network;

    _checkChecksummedAddressArg(aclContractAddress, 'ACL contract');
    _checkChecksummedAddressArg(kmsContractAddress, 'KMS contract');
    _checkChecksummedAddressArg(
      inputVerifierContractAddress,
      'InputVerifier contract',
    );
    _checkChecksummedAddressArg(
      verifyingContractAddressDecryption,
      'Verifying contract for Decryption',
    );
    _checkChecksummedAddressArg(
      verifyingContractAddressInputVerification,
      'Verifying contract for InputVerification',
    );
    _checkChainIdArg(chainId, 'host chain ID');
    _checkChainIdArg(gatewayChainId, 'gateway chain ID');

    if (typeof relayerUrl !== 'string') {
      throw new FhevmConfigError({
        message: `Missing relayer url`,
      });
    }
    const sanitizedRelayerUrl = removeSuffix(relayerUrl, '/');
    if (!URL.canParse(sanitizedRelayerUrl)) {
      throw new FhevmConfigError({
        message: `Invalid relayer url: ${relayerUrl}`,
      });
    }

    let hostNetworkConfig: FhevmHostNetworkConfigType;
    if (network === undefined) {
      throw new FhevmConfigError({ message: 'Missing network' });
    }

    if (typeof network === 'string') {
      // It's a URL string - validate it
      if (!URL.canParse(network)) {
        throw new FhevmConfigError({
          message: `Invalid network URL: ${network}`,
        });
      }
      hostNetworkConfig = {
        type: 'rpc',
        rpcUrl: network,
      };
    } else if (_isEip1193Provider(network)) {
      hostNetworkConfig = {
        type: 'eip1193',
        provider: network,
      };
    } else {
      throw new FhevmConfigError({
        message: 'Invalid network: must be a URL string or Eip1193Provider',
      });
    }

    return new FhevmConfig({
      aclHostContractAddress: aclContractAddress,
      kmsVerifierHostContractAddress: kmsContractAddress,
      inputVerifierHostContractAddress: inputVerifierContractAddress,
      gatewayVerifyingContractAddressDecryption:
        verifyingContractAddressDecryption,
      gatewayVerifyingContractAddressInputVerification:
        verifyingContractAddressInputVerification,
      chainId: BigInt(chainId),
      gatewayChainId: BigInt(gatewayChainId),
      relayerUrl: sanitizedRelayerUrl,
      hostNetworkConfig,
    });
  }
}
