import type {
  Eip1193Provider as EthersEip1193ProviderType,
  Provider as EthersProviderType,
} from 'ethers';
import type { ChecksummedAddress, Uint64 } from '@base/types/primitives';
import type { FhevmInstanceConfig } from '../types/relayer';
import { JsonRpcProvider, BrowserProvider } from 'ethers';
import { isChecksummedAddress } from '@base/address';
import { isUint64 } from '@base/uint';
import { FhevmConfigError } from '../errors/FhevmConfigError';
import { InputVerifier } from './InputVerifier';
import { KMSVerifier } from './KMSVerifier';

////////////////////////////////////////////////////////////////////////////////
// FhevmHostChainConfig
////////////////////////////////////////////////////////////////////////////////

type FhevmHostChainNetworkConfigType =
  | { type: 'rpc'; rpcUrl: string }
  | { type: 'eip1193'; provider: EthersEip1193ProviderType };

export class FhevmHostChainConfig {
  // ACL.sol host contract address
  readonly #hostACLContractAddress: ChecksummedAddress;
  // KMSVerifier.sol host contract address
  readonly #hostKMSVerifierContractAddress: ChecksummedAddress;
  // InputVerifier.sol host contract address
  readonly #hostInputVerifierContractAddress: ChecksummedAddress;
  // Host chainId (Uint64)
  readonly #hostChainId: bigint;
  // Host Rpc Url or Host eip-1193 provider
  readonly #hostNetworkConfig: FhevmHostChainNetworkConfigType;
  // The Host provider in ether.js format
  readonly #hostEthersProvider: EthersProviderType;

  // Decryption.sol gateway contract address
  readonly #gatewayVerifyingContractAddressDecryption: ChecksummedAddress;
  // InputVerification.sol gateway contract address
  readonly #gatewayVerifyingContractAddressInputVerification: ChecksummedAddress;
  // Gateway chainId (Uint64)
  readonly #gatewayChainId: bigint;

  private constructor(params: {
    hostChainId: bigint;
    hostNetworkConfig: FhevmHostChainNetworkConfigType;
    hostACLContractAddress: ChecksummedAddress;
    hostKMSVerifierContractAddress: ChecksummedAddress;
    hostInputVerifierContractAddress: ChecksummedAddress;
    gatewayVerifyingContractAddressDecryption: ChecksummedAddress;
    gatewayVerifyingContractAddressInputVerification: ChecksummedAddress;
    gatewayChainId: bigint;
  }) {
    // Host
    this.#hostChainId = params.hostChainId;
    this.#hostACLContractAddress = params.hostACLContractAddress;
    this.#hostKMSVerifierContractAddress =
      params.hostKMSVerifierContractAddress;
    this.#hostInputVerifierContractAddress =
      params.hostInputVerifierContractAddress;

    this.#hostNetworkConfig = params.hostNetworkConfig;
    Object.freeze(this.#hostNetworkConfig);

    if (this.#hostNetworkConfig.type === 'rpc') {
      this.#hostEthersProvider = new JsonRpcProvider(
        this.#hostNetworkConfig.rpcUrl,
      );
    } else {
      this.#hostEthersProvider = new BrowserProvider(
        this.#hostNetworkConfig.provider,
      );
    }

    // Gateway
    this.#gatewayVerifyingContractAddressDecryption =
      params.gatewayVerifyingContractAddressDecryption;
    this.#gatewayVerifyingContractAddressInputVerification =
      params.gatewayVerifyingContractAddressInputVerification;
    this.#gatewayChainId = params.gatewayChainId;
  }

  // Host
  public get chainId(): bigint {
    return this.#hostChainId;
  }
  public get aclContractAddress(): ChecksummedAddress {
    return this.#hostACLContractAddress;
  }
  public get kmsContractAddress(): ChecksummedAddress {
    return this.#hostKMSVerifierContractAddress;
  }
  public get inputVerifierContractAddress(): ChecksummedAddress {
    return this.#hostInputVerifierContractAddress;
  }
  public get network(): string | EthersEip1193ProviderType {
    if (this.#hostNetworkConfig.type === 'rpc') {
      return this.#hostNetworkConfig.rpcUrl;
    } else {
      return this.#hostNetworkConfig.provider;
    }
  }
  public get ethersProvider(): EthersProviderType {
    return this.#hostEthersProvider;
  }

  // Gateway
  public get verifyingContractAddressDecryption(): ChecksummedAddress {
    return this.#gatewayVerifyingContractAddressDecryption;
  }
  public get verifyingContractAddressInputVerification(): ChecksummedAddress {
    return this.#gatewayVerifyingContractAddressInputVerification;
  }
  public get gatewayChainId(): bigint {
    return this.#gatewayChainId;
  }

  public static fromUserConfig(
    instanceConfig: FhevmInstanceConfig,
  ): FhevmHostChainConfig {
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

    let hostNetworkConfig: FhevmHostChainNetworkConfigType;
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

    if (instanceConfig.publicKey) {
      if (!instanceConfig.publicParams) {
        throw new FhevmConfigError({ message: 'Missing config publicParams.' });
      }
    } else {
      if (instanceConfig.publicParams) {
        throw new FhevmConfigError({ message: 'Missing config publicKey.' });
      }
    }

    return new FhevmHostChainConfig({
      hostChainId: BigInt(chainId),
      hostNetworkConfig,
      hostACLContractAddress: aclContractAddress,
      hostKMSVerifierContractAddress: kmsContractAddress,
      hostInputVerifierContractAddress: inputVerifierContractAddress,
      gatewayVerifyingContractAddressDecryption:
        verifyingContractAddressDecryption,
      gatewayVerifyingContractAddressInputVerification:
        verifyingContractAddressInputVerification,
      gatewayChainId: BigInt(gatewayChainId),
    });
  }

  public async loadFromChain(): Promise<FhevmHostChain> {
    return FhevmHostChain.loadFromChain(this);
  }
}

////////////////////////////////////////////////////////////////////////////////
// FhevmHostChain
////////////////////////////////////////////////////////////////////////////////

export class FhevmHostChain {
  readonly #config: FhevmHostChainConfig;
  readonly #inputVerifier: InputVerifier;
  readonly #kmsVerifier: KMSVerifier;

  private constructor(params: {
    config: FhevmHostChainConfig;
    inputVerifier: InputVerifier;
    kmsVerifier: KMSVerifier;
  }) {
    this.#config = params.config;
    this.#inputVerifier = params.inputVerifier;
    this.#kmsVerifier = params.kmsVerifier;
  }

  public static async loadFromChain(
    config: FhevmHostChainConfig,
  ): Promise<FhevmHostChain> {
    const res = await Promise.all([
      InputVerifier.loadFromChain({
        inputVerifierContractAddress: config.inputVerifierContractAddress,
        provider: config.ethersProvider,
      }),
      KMSVerifier.loadFromChain({
        kmsContractAddress: config.kmsContractAddress,
        provider: config.ethersProvider,
      }),
    ]);

    return new FhevmHostChain({
      config,
      inputVerifier: res[0],
      kmsVerifier: res[1],
    });
  }

  public get config(): FhevmHostChainConfig {
    return this.#config;
  }

  public get coprocessorSigners(): ChecksummedAddress[] {
    return this.#inputVerifier.coprocessorSigners;
  }

  public get coprocessorSignerThreshold(): number {
    return this.#inputVerifier.threshold;
  }

  public get kmsSigners(): ChecksummedAddress[] {
    return this.#kmsVerifier.kmsSigners;
  }

  public get kmsSignerThreshold(): number {
    return this.#kmsVerifier.threshold;
  }
}

////////////////////////////////////////////////////////////////////////////////
// Private Helpers
////////////////////////////////////////////////////////////////////////////////

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
