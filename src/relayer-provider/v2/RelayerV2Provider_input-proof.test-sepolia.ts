import type { FhevmInstanceConfig } from '../../config';
import { createRelayerProvider } from '../createRelayerFhevm';
import { uintToHex } from '../../utils/uint';
import { RelayerV2Provider } from './RelayerV2Provider';
import { RelayerV2ProgressArgs } from './RelayerV2AsyncRequest';
import { createInstance } from '../..';
import { isChecksummedAddress } from '../../utils/address';

// Jest Command line
// =================
//
// Devnet:
// =======
// npx jest --config jest.devnet.config.cjs --colors --passWithNoTests ./src/relayer-provider/v2/RelayerV2Provider_input-proof.test-sepolia.ts --testNamePattern=xxx
//

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

describe('RelayerV2Provider:input-proof:sepolia:', () => {
  let relayerProvider: RelayerV2Provider;

  beforeEach(() => {
    const p = createRelayerProvider(relayerUrlV2);
    if (!(p instanceof RelayerV2Provider)) {
      throw new Error(`Unable to create relayer provider`);
    }
    relayerProvider = p;
    expect(relayerProvider.version).toBe(2);
    expect(relayerProvider.url).toBe(relayerUrlV2);
    expect(relayerProvider.inputProof).toBe(`${relayerUrlV2}/input-proof`);
    expect(isChecksummedAddress(FHECounterPublicDecryptAddress)).toBe(true);
    expect(isChecksummedAddress(FHECounterUserDecryptAddress)).toBe(true);
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  it('v2: wrong ciphertextWithInputVerification', async () => {
    const raceGuard: { onProgressFailedArgs: RelayerV2ProgressArgs | null } = {
      onProgressFailedArgs: null,
    };
    try {
      const res = await relayerProvider.fetchPostInputProof(
        {
          userAddress: '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
          contractAddress: '0x8ba1f109551bd432803012645ac136ddd64dba72',
          contractChainId: uintToHex(SepoliaConfigLocalV2.chainId!),
          ciphertextWithInputVerification: 'dead',
          extraData: '0x00',
        },
        undefined,
        {
          onProgress: (args) => {
            console.log(
              `type:${args.type} status:${args.status} url:${args.url} method:${args.method}`,
            );
            if (args.type === 'failed') {
              raceGuard.onProgressFailedArgs = args;
            }
          },
        },
      );
      expect(res).toBeUndefined();
    } catch (e) {
      console.log(e);
    }
    expect(raceGuard.onProgressFailedArgs?.type).toBe('failed');
  });

  it('v2: generateKeypair', async () => {
    const instance = await createInstance(SepoliaConfigLocalV2);
    const keypair = instance.generateKeypair();
    expect(keypair.privateKey.length > 1000).toBe(true);
    expect(keypair.publicKey.length > 1000).toBe(true);
  }, 60000);

  it('v2: succeeded', async () => {
    const instance = await createInstance(SepoliaConfigLocalV2);

    const builder = instance.createEncryptedInput(
      FHECounterPublicDecryptAddress,
      '0x37AC010c1c566696326813b840319B58Bb5840E4',
    );
    const enc = await builder.add32(123).encrypt();

    expect(Array.isArray(enc.handles)).toBe(true);
    expect(enc.handles.length).toBe(1);
    expect(enc.handles[0] instanceof Uint8Array).toBe(true);
    expect(enc.handles[0].length).toBe(32);
    expect(enc.inputProof instanceof Uint8Array).toBe(true);
    // (1+1+NUM_HANDLES*32+65*numSigners) + extraData
    expect(enc.inputProof.length).toBeGreaterThanOrEqual(
      1 + 1 + 1 * 32 + 65 * 1,
    );
  }, 60000);
});
