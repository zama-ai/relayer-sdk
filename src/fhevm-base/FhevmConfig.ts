import type {
  FhevmConfig,
  FhevmGatewayChainConfig,
  FhevmHostChainConfig,
} from './types/public-api';
import type {
  InputVerifierContractData,
  KMSVerifierContractData,
} from './types/public-api';
import type { FhevmChainClient } from '@fhevm-base-types/public-api';
import { fetchInputVerifierContractData } from './host-contracts/InputVerifierContractData';
import { fetchKMSVerifierContractData } from './host-contracts/KMSVerifierContractData';
import { executeWithBatching } from '@base/promise';
import { FhevmConfigError } from './errors/FhevmConfigError';
import { createFhevmHostChainConfig } from './FhevmHostChainConfig';
import { createFhevmGatewayChainConfig } from './FhevmGatewayChainConfig';
import { addressToChecksummedAddress, assertIsAddress } from '@base/address';

////////////////////////////////////////////////////////////////////////////////
// FhevmConfig
////////////////////////////////////////////////////////////////////////////////

class FhevmConfigImpl implements FhevmConfig {
  readonly #hostChainConfig: FhevmHostChainConfig;
  readonly #gatewayChainConfig: FhevmGatewayChainConfig;
  readonly #inputVerifier: InputVerifierContractData;
  readonly #kmsVerifier: KMSVerifierContractData;

  constructor(params: {
    readonly hostChainConfig: FhevmHostChainConfig;
    readonly gatewayChainConfig: FhevmGatewayChainConfig;
    readonly inputVerifier: InputVerifierContractData;
    readonly kmsVerifier: KMSVerifierContractData;
  }) {
    this.#hostChainConfig = params.hostChainConfig;
    this.#gatewayChainConfig = params.gatewayChainConfig;
    this.#inputVerifier = params.inputVerifier;
    this.#kmsVerifier = params.kmsVerifier;
  }

  public get hostChainConfig(): FhevmHostChainConfig {
    return this.#hostChainConfig;
  }
  public get gatewayChainConfig(): FhevmGatewayChainConfig {
    return this.#gatewayChainConfig;
  }
  public get inputVerifier(): InputVerifierContractData {
    return this.#inputVerifier;
  }
  public get kmsVerifier(): KMSVerifierContractData {
    return this.#kmsVerifier;
  }
}

////////////////////////////////////////////////////////////////////////////////
// Public API
////////////////////////////////////////////////////////////////////////////////

export async function fetchFhevmConfig(
  client: FhevmChainClient,
  args: {
    aclContractAddress: string;
    chainId?: number | bigint | undefined;
    inputVerifierContractAddress: string;
    kmsVerifierContractAddress: string;
    gatewayChainId?: number | bigint | undefined;
    verifyingContractAddressInputVerification?: string | undefined;
    verifyingContractAddressDecryption?: string | undefined;
  },
): Promise<FhevmConfig> {
  const { inputVerifierContractAddress, kmsVerifierContractAddress } = args;

  assertIsAddress(inputVerifierContractAddress, {});
  assertIsAddress(kmsVerifierContractAddress, {});

  const fhevmClient = {
    ...client,
    config: {
      hostChainConfig: {
        inputVerifierContractAddress: addressToChecksummedAddress(
          inputVerifierContractAddress,
        ),
        kmsVerifierContractAddress: addressToChecksummedAddress(
          kmsVerifierContractAddress,
        ),
      },
    },
  };

  const rpcCalls = [
    () => fhevmClient.libs.publicClientLib.getChainId(fhevmClient.nativeClient),
    () => fetchInputVerifierContractData(fhevmClient),
    () => fetchKMSVerifierContractData(fhevmClient),
  ];

  const res = await executeWithBatching<unknown>(
    rpcCalls,
    client.batchRpcCalls,
  );

  const chainId: bigint = res[0] as bigint;
  const inputVerifier: InputVerifierContractData =
    res[1] as InputVerifierContractData;
  const kmsVerifier: KMSVerifierContractData =
    res[2] as KMSVerifierContractData;

  if (args.chainId !== undefined) {
    if (chainId !== BigInt(args.chainId)) {
      throw new FhevmConfigError({
        message: `Host chainId mismatch: args.chainId=${args.chainId}, client chainId=${chainId}.`,
      });
    }
  }

  if (kmsVerifier.gatewayChainId !== inputVerifier.gatewayChainId) {
    throw new FhevmConfigError({
      message: `Gateway chainId mismatch: InputVerifier at ${inputVerifier.address} reports ${String(inputVerifier.gatewayChainId)}, KMSVerifier at ${kmsVerifier.address} reports ${String(kmsVerifier.gatewayChainId)}.`,
    });
  }

  if (args.gatewayChainId !== undefined) {
    if (inputVerifier.gatewayChainId !== BigInt(args.gatewayChainId)) {
      throw new FhevmConfigError({
        message: `Invalid args.gatewayChainId ${String(args.gatewayChainId)}. Expecting ${String(inputVerifier.gatewayChainId)}.`,
      });
    }
  }

  if (args.verifyingContractAddressInputVerification !== undefined) {
    if (
      inputVerifier.verifyingContractAddressInputVerification.toLowerCase() !==
      args.verifyingContractAddressInputVerification.toLowerCase()
    ) {
      throw new FhevmConfigError({
        message: `Invalid args.verifyingContractAddressInputVerification=${args.verifyingContractAddressInputVerification}. Expecting ${inputVerifier.verifyingContractAddressInputVerification}.`,
      });
    }
  }

  if (args.verifyingContractAddressDecryption !== undefined) {
    if (
      kmsVerifier.verifyingContractAddressDecryption.toLowerCase() !==
      args.verifyingContractAddressDecryption.toLowerCase()
    ) {
      throw new FhevmConfigError({
        message: `Invalid  args.verifyingContractAddressDecryption=${args.verifyingContractAddressDecryption}. Expecting ${kmsVerifier.verifyingContractAddressDecryption}.`,
      });
    }
  }

  return new FhevmConfigImpl({
    hostChainConfig: createFhevmHostChainConfig({
      chainId,
      aclContractAddress: args.aclContractAddress,
      inputVerifierContractAddress: args.inputVerifierContractAddress,
      kmsVerifierContractAddress: args.kmsVerifierContractAddress,
    }),
    gatewayChainConfig: createFhevmGatewayChainConfig({
      chainId: inputVerifier.gatewayChainId,
      verifyingContractAddressDecryption:
        kmsVerifier.verifyingContractAddressDecryption,
      verifyingContractAddressInputVerification:
        inputVerifier.verifyingContractAddressInputVerification,
    }),
    inputVerifier,
    kmsVerifier,
  });
}
