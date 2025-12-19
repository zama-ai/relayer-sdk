import fetchMock from 'fetch-mock';
import { hexToBytes } from '../utils/bytes';
import { currentCiphertextVersion } from '../relayer/sendEncryption';
import { CoprocessorSigners } from './fhevm-mock/CoprocessorSigners';
import { getProvider as config_getProvider } from '../config';
import { KmsSigners } from './fhevm-mock/KmsSigners';
import { setupV1RoutesInputProof, setupV1RoutesKeyUrl } from './v1/mockRoutes';
import { setupV2RoutesInputProof, setupV2RoutesKeyUrl } from './v2/mockRoutes';
import { Contract } from 'ethers';
import { FhevmHandle } from '../sdk/FhevmHandle';
import type {
  FhevmInstanceConfig,
  RelayerInputProofPayload,
} from '../types/relayer';
import type { Prettify } from '../utils/types';
import type {
  Bytes32Hex,
  Bytes65Hex,
  ChecksummedAddress,
  EncryptionBits,
} from '../types/primitives';
import type { ethers as EthersT } from 'ethers';

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type TestRelayerConfig<V extends 1 | 2> = {
  version: V;
  urls: TestRelayerUrls;
  fhevmInstanceConfig: FhevmInstanceConfig;
};

export type TestRelayerUrls = {
  base: string;
  inputProof: string;
  publicDecrypt: string;
  userDecrypt: string;
  keyUrl: string;
};

export type TestConfig = {
  type: 'devnet' | 'testnet' | 'fetch-mock';
  testContracts: {
    FHECounterUserDecryptAddress: ChecksummedAddress;
    FHECounterPublicDecryptAddress: ChecksummedAddress;
    DeployerAddress: ChecksummedAddress;
  };
  fhevmInstanceConfig: Prettify<Omit<FhevmInstanceConfig, 'relayerUrl'>>;
  v1: TestRelayerConfig<1>;
  v2: TestRelayerConfig<2>;
  mnemonic: string;
};

const relayerUrlV1 =
  (global as any).JEST_FHEVM_CONFIG.fhevmInstanceConfig.relayerUrl + '/v1';
const relayerUrlV2 =
  (global as any).JEST_FHEVM_CONFIG.fhevmInstanceConfig.relayerUrl + '/v2';

export const TEST_CONFIG: TestConfig = {
  mnemonic: (global as any).JEST_FHEVM_CONFIG.mnemonic,
  type: (global as any).JEST_FHEVM_CONFIG.type,
  testContracts: (global as any).JEST_FHEVM_CONFIG.testContracts,
  fhevmInstanceConfig: {
    ...(global as any).JEST_FHEVM_CONFIG.fhevmInstanceConfig,
    relayerUrl: undefined,
  },
  v1: {
    version: 1,
    fhevmInstanceConfig: {
      ...(global as any).JEST_FHEVM_CONFIG.fhevmInstanceConfig,
      relayerUrl: relayerUrlV1,
    },
    urls: {
      base: relayerUrlV1,
      inputProof: relayerUrlV1 + '/input-proof',
      publicDecrypt: relayerUrlV1 + '/public-decrypt',
      userDecrypt: relayerUrlV1 + '/user-decrypt',
      keyUrl: relayerUrlV1 + '/keyurl',
    },
  },
  v2: {
    version: 2,
    fhevmInstanceConfig: {
      ...(global as any).JEST_FHEVM_CONFIG.fhevmInstanceConfig,
      relayerUrl: relayerUrlV2,
    },
    urls: {
      base: relayerUrlV2,
      inputProof: relayerUrlV2 + '/input-proof',
      publicDecrypt: relayerUrlV2 + '/public-decrypt',
      userDecrypt: relayerUrlV2 + '/user-decrypt',
      keyUrl: relayerUrlV2 + '/keyurl',
    },
  },
};

export const DEADBEEF_INPUT_PROOF_PAYLOAD: RelayerInputProofPayload = {
  contractAddress: TEST_CONFIG.testContracts.FHECounterPublicDecryptAddress,
  userAddress: TEST_CONFIG.testContracts.DeployerAddress,
  ciphertextWithInputVerification: '0xdeadbeef',
  contractChainId: ('0x' +
    Number(TEST_CONFIG.fhevmInstanceConfig.chainId!).toString(
      16,
    )) as `0x${string}`,
  extraData: '0x00',
} as const;

export const TEST_COPROCESSORS: CoprocessorSigners =
  CoprocessorSigners.fromPrivateKeys({
    privateKeys: [
      '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    ],
    gatewayChainId: TEST_CONFIG.fhevmInstanceConfig.gatewayChainId!,
    verifyingContractAddressInputVerification: TEST_CONFIG.fhevmInstanceConfig
      .verifyingContractAddressInputVerification! as ChecksummedAddress,
  });

// Must have the same number of signers as TEST_COPROCESSORS
export const TEST_KMS: KmsSigners = KmsSigners.fromPrivateKeys({
  privateKeys: [
    '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadffff',
  ],
  chainId: TEST_CONFIG.fhevmInstanceConfig.gatewayChainId!,
  verifyingContractAddressDecryption: TEST_CONFIG.fhevmInstanceConfig
    .verifyingContractAddressDecryption! as ChecksummedAddress,
});

export async function fetchMockInputProof(
  args: {
    contractAddress: string;
    userAddress: string;
    ciphertextWithInputVerification: string;
  },
  bitwidths: EncryptionBits[],
): Promise<{
  handles: Bytes32Hex[];
  signatures: Bytes65Hex[];
}> {
  const ciphertext = hexToBytes(args.ciphertextWithInputVerification);

  // const handlesUint8ArrayList: Uint8Array[] = computeHandles(
  //   ciphertext,
  //   bitwidths,
  //   TEST_CONFIG.fhevmInstanceConfig.aclContractAddress,
  //   TEST_CONFIG.fhevmInstanceConfig.chainId!,
  //   currentCiphertextVersion(),
  // );
  const handlesBytes32HexList = FhevmHandle.fromZKProof({
    ciphertextWithZKProof: ciphertext,
    aclAddress: TEST_CONFIG.fhevmInstanceConfig
      .aclContractAddress as `0x{string}`,
    chainId: TEST_CONFIG.fhevmInstanceConfig.chainId!,
    fheTypeEncryptionBitwidths: bitwidths,
    ciphertextVersion: currentCiphertextVersion(),
  }).map((handle: FhevmHandle) => handle.toBytes32Hex());

  const params = {
    ctHandles: handlesBytes32HexList,
    contractChainId: TEST_CONFIG.fhevmInstanceConfig.chainId!,
    contractAddress: args.contractAddress as `0x${string}`,
    userAddress: args.userAddress as `0x${string}`,
    extraData: '0x00' as `0x${string}`,
  };

  return await TEST_COPROCESSORS.computeSignatures(params);
}

export function setupAllFetchMockRoutes(params: {
  bitWidths?: EncryptionBits[];
  retry?: number;
}) {
  if (TEST_CONFIG.type !== 'fetch-mock') {
    return;
  }
  setupV1RoutesKeyUrl();
  setupV2RoutesKeyUrl();
  if (params.bitWidths) {
    setupV1RoutesInputProof(params.bitWidths);
    setupV2RoutesInputProof(params.bitWidths, params.retry);
  }
}

export function removeAllFetchMockRoutes() {
  if (TEST_CONFIG.type !== 'fetch-mock') {
    return;
  }
  fetchMock.removeRoutes();
}

export function getTestProvider(
  network?: string | EthersT.Eip1193Provider | undefined,
): EthersT.Provider {
  return config_getProvider(network);
}

export async function fheCounterGeCount(
  address: ChecksummedAddress,
  provider: EthersT.Provider,
) {
  const counterABI = ['function getCount() view returns (bytes32)'];
  const counter = new Contract(address, counterABI, provider);
  const eCount = await counter.getCount();
  return eCount;
}

export function timestampNow(): number {
  return Math.floor(Date.now() / 1000);
}
