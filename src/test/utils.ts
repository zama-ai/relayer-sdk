import fetchMock, { type CallLog } from 'fetch-mock';
import type { ChecksummedAddress } from '../utils/address';
import type { FhevmInstanceConfig } from '../config';
import type { RelayerInputProofPayload } from '../relayer/fetchRelayer';
import { Prettify } from '../utils/types';
import { fromHexString, toHexString } from '../utils';
import { computeHandles } from '../relayer/handles';
import { currentCiphertextVersion } from '../relayer/sendEncryption';
import type {
  Bytes32Hex,
  Bytes32HexNo0x,
  Bytes65Hex,
  Bytes65HexNo0x,
} from '../utils/bytes';
import { CoprocessorSigners } from './fhevm-mock/CoprocessorSigners';
import { ENCRYPTION_TYPES } from '../sdk/encryptionTypes';
import { getProvider as config_getProvider } from '../config';
import { KmsSigners } from './fhevm-mock/KmsSigners';
import { setupV1RoutesKeyUrl } from './v1/mockRoutes';
import { setupV2RoutesInputProof, setupV2RoutesKeyUrl } from './v2/mockRoutes';
import type { ethers as EthersT } from 'ethers';
import { Contract } from 'ethers';

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
  bitwidths: (keyof typeof ENCRYPTION_TYPES)[],
  no0x: boolean,
): Promise<
  | {
      handles: Bytes32HexNo0x[];
      signatures: Bytes65HexNo0x[];
    }
  | {
      handles: Bytes32Hex[];
      signatures: Bytes65Hex[];
    }
> {
  const ciphertext = fromHexString(args.ciphertextWithInputVerification);

  const handlesUint8ArrayList: Uint8Array[] = computeHandles(
    ciphertext,
    bitwidths,
    TEST_CONFIG.fhevmInstanceConfig.aclContractAddress,
    TEST_CONFIG.fhevmInstanceConfig.chainId!,
    currentCiphertextVersion(),
  );

  const handlesBytes32HexList: Bytes32Hex[] = handlesUint8ArrayList.map((h) =>
    toHexString(h, true),
  );

  const params = {
    ctHandles: handlesBytes32HexList,
    contractChainId: TEST_CONFIG.fhevmInstanceConfig.chainId!,
    contractAddress: args.contractAddress as `0x${string}`,
    userAddress: args.userAddress as `0x${string}`,
    extraData: '0x00' as `0x${string}`,
  };

  if (no0x) {
    return await TEST_COPROCESSORS.computeSignaturesNo0x(params);
  } else {
    return await TEST_COPROCESSORS.computeSignatures(params);
  }
}

export function setupV1RoutesInputProof(
  bitwidths: (keyof typeof ENCRYPTION_TYPES)[],
) {
  if (TEST_CONFIG.type !== 'fetch-mock') {
    throw new Error('Test is not running using fetch-mock');
  }

  fetchMock.post(TEST_CONFIG.v1.urls.inputProof, async (args: CallLog) => {
    const body = args.options.body as string;

    const json = JSON.parse(body);

    const result = await fetchMockInputProof(json, bitwidths, true /* no0x */);
    return {
      status: 200,
      body: {
        response: result,
      },
      headers: { 'Content-Type': 'application/json' },
    };
  });
}

export function setupAllFetchMockRoutes({
  bitWidths,
}: {
  bitWidths?: (keyof typeof ENCRYPTION_TYPES)[];
}) {
  if (TEST_CONFIG.type !== 'fetch-mock') {
    return;
  }
  setupV1RoutesKeyUrl();
  setupV2RoutesKeyUrl();
  if (bitWidths) {
    setupV1RoutesInputProof(bitWidths);
    setupV2RoutesInputProof(bitWidths);
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
