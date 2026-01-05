import type { ethers as EthersT } from 'ethers';
import type { RelayerInputProofPayload } from '../relayer-provider/types/public-api';
import type {
  FhevmInstanceConfig,
  FhevmInstanceOptions,
} from '../types/relayer';
import type { Prettify } from '../base/types/utils';
import type {
  Bytes32Hex,
  Bytes65Hex,
  ChecksummedAddress,
  FheTypeName,
} from '../base/types/primitives';
import fetchMock from 'fetch-mock';
import { hexToBytesFaster } from '../base/bytes';
import { CoprocessorSigners } from './fhevm-mock/CoprocessorSigners';
import { getProvider as config_getProvider } from '../config';
import { KmsSigners } from './fhevm-mock/KmsSigners';
import { setupV1RoutesInputProof, setupV1RoutesKeyUrl } from './v1/mockRoutes';
import { setupV2RoutesInputProof, setupV2RoutesKeyUrl } from './v2/mockRoutes';
import { Contract, HDNodeWallet, Wallet } from 'ethers';
import { FhevmHandle } from '../sdk/FhevmHandle';
import { ZKProof } from '../sdk/ZKProof';

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type TestRelayerConfig<V extends 1 | 2> = {
  version: V;
  urls: TestRelayerUrls;
  fhevmInstanceConfig: Omit<FhevmInstanceConfig, 'chainId'> & {
    chainId: number;
  };
};

export type TestRelayerUrls = {
  base: string;
  inputProof: string;
  publicDecrypt: string;
  userDecrypt: string;
  keyUrl: string;
};

export type TestConfig = {
  type: 'devnet' | 'testnet' | 'mainnet' | 'fetch-mock';
  testContracts: {
    FHETestAddress: ChecksummedAddress;
  };
  fhevmInstanceConfig: Prettify<
    Omit<FhevmInstanceConfig, 'relayerUrl' | 'chainId'> & { chainId: number }
  >;
  v1: TestRelayerConfig<1>;
  v2: TestRelayerConfig<2>;
  mnemonic: string;
  signerAddress: ChecksummedAddress;
};

const relayerUrlV1 =
  (global as any).JEST_FHEVM_CONFIG.fhevmInstanceConfig.relayerUrl + '/v1';
const relayerUrlV2 =
  (global as any).JEST_FHEVM_CONFIG.fhevmInstanceConfig.relayerUrl + '/v2';

export const TEST_CONFIG: TestConfig = {
  mnemonic: (global as any).JEST_FHEVM_CONFIG.mnemonic,
  signerAddress: getAddressFromMnemonic(
    (global as any).JEST_FHEVM_CONFIG.mnemonic,
  ),
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
  contractAddress: TEST_CONFIG.testContracts.FHETestAddress,
  userAddress: TEST_CONFIG.signerAddress,
  ciphertextWithInputVerification: '0xdeadbeef',
  contractChainId: ('0x' +
    Number(TEST_CONFIG.fhevmInstanceConfig.chainId!).toString(
      16,
    )) as `0x${string}`,
  extraData: '0x00',
} as const;

// Lazy initialization to avoid issues with jest mocking
let _testCoprocessors: CoprocessorSigners | null = null;
export function getTestCoprocessors(): CoprocessorSigners {
  if (!_testCoprocessors) {
    _testCoprocessors = CoprocessorSigners.fromPrivateKeys({
      privateKeys: [
        '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
      ],
      gatewayChainId: BigInt(TEST_CONFIG.fhevmInstanceConfig.gatewayChainId!),
      verifyingContractAddressInputVerification: TEST_CONFIG.fhevmInstanceConfig
        .verifyingContractAddressInputVerification! as ChecksummedAddress,
    });
  }
  return _testCoprocessors;
}

// Keep for backwards compatibility - getter that lazily initializes
export const TEST_COPROCESSORS = {
  get addresses() {
    return getTestCoprocessors().addresses;
  },
  computeSignatures: (params: any) =>
    getTestCoprocessors().computeSignatures(params),
};

export const TEST_INPUT_VERIFIER = {
  eip712Domain: [
    '0x0f', // fields
    'InputVerification', // name
    '1', // version
    BigInt(TEST_CONFIG.fhevmInstanceConfig.gatewayChainId),
    TEST_CONFIG.fhevmInstanceConfig.verifyingContractAddressInputVerification,
    '0x0000000000000000000000000000000000000000000000000000000000000000' as Bytes32Hex, //salt
    [], // extensions
  ],
};

export const TEST_KMS_VERIFIER = {
  eip712Domain: [
    '0x0f', // fields
    'Decryption', // name
    '1', // version
    BigInt(TEST_CONFIG.fhevmInstanceConfig.gatewayChainId),
    TEST_CONFIG.fhevmInstanceConfig.verifyingContractAddressDecryption,
    '0x0000000000000000000000000000000000000000000000000000000000000000' as Bytes32Hex, //salt
    [], // extensions
  ],
};

// Must have the same number of signers as TEST_COPROCESSORS
// Lazy initialization to avoid issues with jest mocking
let _testKms: KmsSigners | null = null;
export function getTestKms(): KmsSigners {
  if (!_testKms) {
    _testKms = KmsSigners.fromPrivateKeys({
      privateKeys: [
        '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadffff',
      ],
      chainId: BigInt(TEST_CONFIG.fhevmInstanceConfig.gatewayChainId!),
      verifyingContractAddressDecryption: TEST_CONFIG.fhevmInstanceConfig
        .verifyingContractAddressDecryption! as ChecksummedAddress,
    });
  }
  return _testKms;
}
// Keep for backwards compatibility - getter that lazily initializes
export const TEST_KMS = {
  get addresses() {
    return getTestKms().addresses;
  },
};

export async function fetchMockInputProof(args: {
  contractAddress: string;
  userAddress: string;
  ciphertextWithInputVerification: string;
}): Promise<{
  readonly handles: readonly Bytes32Hex[];
  readonly signatures: readonly Bytes65Hex[];
}> {
  const ciphertext = hexToBytesFaster(args.ciphertextWithInputVerification, {
    strict: true,
  });

  const zkProof = ZKProof.fromComponents({
    ciphertextWithZKProof: ciphertext,
    aclContractAddress: TEST_CONFIG.fhevmInstanceConfig
      .aclContractAddress as `0x{string}`,
    chainId: BigInt(TEST_CONFIG.fhevmInstanceConfig.chainId),
    userAddress: args.userAddress as ChecksummedAddress,
    contractAddress: args.contractAddress as ChecksummedAddress,
  });

  const handlesBytes32HexList = FhevmHandle.fromZKProof(zkProof).map(
    (handle: FhevmHandle) => handle.toBytes32Hex(),
  );

  const params = {
    ctHandles: handlesBytes32HexList,
    contractChainId: BigInt(TEST_CONFIG.fhevmInstanceConfig.chainId!),
    contractAddress: args.contractAddress as `0x${string}`,
    userAddress: args.userAddress as `0x${string}`,
    extraData: '0x00' as `0x${string}`,
  };

  return await TEST_COPROCESSORS.computeSignatures(params);
}

export function setupAllFetchMockRoutes(params?: {
  enableInputProofRoutes?: boolean;
  jobId?: string;
  instanceOptions?: FhevmInstanceOptions;
  retry?: number;
  inputProofResult?: {
    readonly handles: readonly string[];
    readonly signatures: readonly string[];
  };
}) {
  if (TEST_CONFIG.type !== 'fetch-mock') {
    return;
  }
  setupV1RoutesKeyUrl();
  setupV2RoutesKeyUrl();
  if (params?.enableInputProofRoutes === true) {
    setupV1RoutesInputProof(params);
    setupV2RoutesInputProof(params);
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

export function getTestSigner(mnemonic: string, provider: EthersT.Provider) {
  const basePath = "m/44'/60'/0'/0/";
  const index = 0;
  const hdNode = HDNodeWallet.fromPhrase(
    mnemonic,
    undefined, // password
    `${basePath}${index}`,
  );
  return {
    signer: hdNode.connect(provider),
    wallet: hdNode,
    address: hdNode.address,
  };
}

export function getAddressFromMnemonic(mnemonic: string) {
  const hdNode = Wallet.fromPhrase(mnemonic);
  return hdNode.address as ChecksummedAddress;
}

export async function fheTestGet(
  type: FheTypeName,
  address: ChecksummedAddress,
  provider: EthersT.Provider,
  from: ChecksummedAddress,
) {
  const typeNameUpperCase = 'E' + type.substring(1);
  const getFuncName = `get${typeNameUpperCase}`;

  const abi = [`function ${getFuncName}() view returns (bytes32)`];
  const contract = new Contract(address, abi, provider);
  return await contract[getFuncName]({ from });
}

export function timestampNow(): number {
  return Math.floor(Date.now() / 1000);
}

////////////////////////////////////////////////////////////////////////////////
// setupJestMock
////////////////////////////////////////////////////////////////////////////////

export function setupEthersJestMock() {
  // Use global config directly to avoid module resolution issues
  const getJestConfig = () => (global as any).JEST_FHEVM_CONFIG;

  const actualEthers = jest.requireActual('ethers');

  return {
    ...actualEthers,
    // Keep getAddress and isAddress as real implementations - all test addresses are valid
    // Only mock the network-related functions
    JsonRpcProvider: jest.fn((...args: any[]) => {
      const config = getJestConfig();
      if (config.type !== 'fetch-mock') {
        return new actualEthers.JsonRpcProvider(...args);
      }
      return {
        getNetwork: () =>
          Promise.resolve({
            chainId: BigInt(config.fhevmInstanceConfig.chainId),
          }),
      };
    }),
    Contract: jest.fn((...args: any[]) => {
      const config = getJestConfig();
      if (config.type !== 'fetch-mock') {
        return new actualEthers.Contract(...args);
      }

      // Determine which contract is being created based on address
      const contractAddress = args[0] as string;

      if (
        contractAddress ===
        config.fhevmInstanceConfig.inputVerifierContractAddress
      ) {
        // InputVerifier contract mock
        return {
          eip712Domain: () => Promise.resolve(TEST_INPUT_VERIFIER.eip712Domain),
          getCoprocessorSigners: () =>
            Promise.resolve(getTestCoprocessors().addresses),
          getThreshold: () =>
            Promise.resolve(BigInt(getTestCoprocessors().addresses.length)),
        };
      } else if (
        contractAddress === config.fhevmInstanceConfig.kmsContractAddress
      ) {
        // KMSVerifier contract mock
        return {
          eip712Domain: () =>
            Promise.resolve(Promise.resolve(TEST_KMS_VERIFIER.eip712Domain)),
          getKmsSigners: () => Promise.resolve(getTestKms().addresses),
          getThreshold: () =>
            Promise.resolve(BigInt(getTestKms().addresses.length)),
        };
      } else if (
        contractAddress === config.fhevmInstanceConfig.aclContractAddress
      ) {
        // ACL contract mock - always return true for valid inputs
        // These are called at test runtime, so module imports are available
        return {
          persistAllowed: () => Promise.resolve(true),
          isAllowedForDecryption: () => Promise.resolve(true),
        };
      }

      // Default mock for unknown contracts
      return {};
    }),
  };
}

////////////////////////////////////////////////////////////////////////////////
// Mock Eip1193Provider
////////////////////////////////////////////////////////////////////////////////

export function createMockEip1193Provider() {
  return {
    request: async () => {},
  };
}
