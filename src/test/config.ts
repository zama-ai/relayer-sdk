import type { FhevmInstanceConfig } from '../index';
import type { Prettify } from '@base/types/utils';
import type { ChecksummedAddress } from '@base/types/primitives';
import { Wallet } from 'ethers';

export function getAddressFromMnemonic(mnemonic: string) {
  const hdNode = Wallet.fromPhrase(mnemonic);
  return hdNode.address as ChecksummedAddress;
}

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
  relayerUrlBase: string;
  v2: TestRelayerConfig<2>;
  mnemonic: string;
  signerAddress: ChecksummedAddress;
};

const relayerUrlBase = (global as any).JEST_FHEVM_CONFIG.fhevmInstanceConfig
  .relayerUrl;
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
  relayerUrlBase,
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
