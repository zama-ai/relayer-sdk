import type { FhevmInstanceConfig } from '../../config';
import { ethers } from 'ethers';
import { createRelayerProvider } from '../createRelayerFhevm';
import { RelayerV2Provider } from './RelayerV2Provider';
import { createInstance } from '../..';
import { isChecksummedAddress } from '../../utils/address';

// Jest Command line
// =================
//
// Devnet:
// =======
// npx jest --config jest.devnet.config.cjs --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_public-decrypt.test-sepolia.ts --testNamePattern=xxx
//

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const counterABI = ['function getCount() view returns (bytes32)'];

const SepoliaConfigLocal: FhevmInstanceConfig = (global as any)
  .TEST_FHEVM_CONFIG;
const SepoliaConfigLocalV2: FhevmInstanceConfig = {
  ...SepoliaConfigLocal,
  relayerUrl: SepoliaConfigLocal.relayerUrl + '/v2',
};

const FHECounterUserDecryptAddress = (global as any)
  .FHECounterUserDecryptAddress;
const FHECounterPublicDecryptAddress = (global as any)
  .FHECounterPublicDecryptAddress;

const relayerUrlV2 = `${SepoliaConfigLocalV2.relayerUrl!}`;

const consoleLogSpy = jest
  .spyOn(console, 'log')
  .mockImplementation((message) => {
    process.stdout.write(`${message}\n`);
  });

describe('RelayerV2Provider:public-decrypt:sepolia:', () => {
  let relayerProvider: RelayerV2Provider;

  beforeEach(() => {
    const p = createRelayerProvider(relayerUrlV2);
    if (!(p instanceof RelayerV2Provider)) {
      throw new Error(`Unable to create relayer provider`);
    }
    relayerProvider = p;
    expect(relayerProvider.version).toBe(2);
    expect(relayerProvider.url).toBe(relayerUrlV2);
    expect(relayerProvider.publicDecrypt).toBe(
      `${relayerUrlV2}/public-decrypt`,
    );
    expect(isChecksummedAddress(FHECounterPublicDecryptAddress)).toBe(true);
    expect(isChecksummedAddress(FHECounterUserDecryptAddress)).toBe(true);
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  it('xxx v2: succeeded', async () => {
    const counter = new ethers.Contract(
      FHECounterPublicDecryptAddress,
      counterABI,
      new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com'),
    );
    const eCount = await counter.getCount();
    const instance = await createInstance(SepoliaConfigLocalV2);
    await instance.publicDecrypt([eCount]);
  }, 60000);
});
