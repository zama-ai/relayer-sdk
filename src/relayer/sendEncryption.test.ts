import fs from 'fs';
import path from 'path';
import { createRelayerEncryptedInput } from './sendEncryption';
import { InvalidPropertyError } from '../errors/InvalidPropertyError';
import {
  removeAllFetchMockRoutes,
  setupAllFetchMockRoutes,
  TEST_CONFIG,
} from '../test/config';
import { createRelayerFhevm } from '@relayer-provider/createRelayerFhevm';
import { RelayerV2ResponseInvalidBodyError } from '@relayer-provider/v2/errors/RelayerV2ResponseInvalidBodyError';
import { AbstractRelayerFhevm } from '@relayer-provider/AbstractRelayerFhevm';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/relayer/sendEncryption.test.ts
// npx jest --colors --passWithNoTests ./src/relayer/sendEncryption.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/relayer/sendEncryption.test.ts --collectCoverageFrom=./src/relayer/sendEncryption.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/relayer/sendEncryption.test.ts --collectCoverageFrom=./src/relayer/sendEncryption.ts
//
// Devnet:
// =======
// npx jest --config jest.devnet.config.cjs --colors --passWithNoTests ./src/relayer/sendEncryption.test.ts
//
////////////////////////////////////////////////////////////////////////////////

jest.setTimeout(60000); // 60 seconds for all tests in this file

////////////////////////////////////////////////////////////////////////////////

jest.mock('ethers', () => {
  const { setupEthersJestMock } = jest.requireActual('../test/config');
  return setupEthersJestMock();
});

////////////////////////////////////////////////////////////////////////////////

async function createFhevm(version: 1 | 2) {
  const relayerFhevm = await createRelayerFhevm({
    ...TEST_CONFIG[`v${version}`].fhevmInstanceConfig,
    defaultRelayerVersion: 1,
  });
  return relayerFhevm;
}

////////////////////////////////////////////////////////////////////////////////

const describeIfFetchMock =
  TEST_CONFIG.type === 'fetch-mock' ? describe : describe.skip;

const consoleLogSpy = jest
  .spyOn(console, 'log')
  .mockImplementation((message) => {
    process.stdout.write(`${message}\n`);
  });

////////////////////////////////////////////////////////////////////////////////
// Constants
////////////////////////////////////////////////////////////////////////////////

const INPUT_PROOF_ASSET_3 = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../test/assets/input-proof-payload-3.json'),
    'utf-8',
  ),
);

////////////////////////////////////////////////////////////////////////////////

describeIfFetchMock('sendEncryption', () => {
  beforeEach(() => {
    removeAllFetchMockRoutes();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  //////////////////////////////////////////////////////////////////////////////
  // Encrypt
  //////////////////////////////////////////////////////////////////////////////

  it('v1: encrypt', async () => {
    const version = 1;
    setupAllFetchMockRoutes({
      enableInputProofRoutes: true,
    });
    const fhevm = await createFhevm(version);

    const input = createRelayerEncryptedInput({
      fhevm,
      capacity: 2048,
    })(
      '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );
    input.addBool(false);
    input.add8(43n);
    input.add16(87n);
    input.add32(2339389323n);
    input.add64(23393893233n);
    input.add128(233938932390n);
    input.addAddress('0xa5e1defb98EFe38EBb2D958CEe052410247F4c80');
    input.add256(2339389323922393930n);

    const { inputProof, handles } = await input.encrypt();
    expect(inputProof).toBeDefined();
    expect(handles.length).toBe(8);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v2: encrypt', async () => {
    const version = 2;
    setupAllFetchMockRoutes({
      enableInputProofRoutes: true,
    });
    const fhevm = await createFhevm(version);

    const input = createRelayerEncryptedInput({
      fhevm,
      capacity: 2048,
    })(
      '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );
    input.addBool(false);
    input.add8(43n);
    input.add16(87n);
    input.add32(2339389323n);
    input.add64(23393893233n);
    input.add128(233938932390n);
    input.addAddress('0xa5e1defb98EFe38EBb2D958CEe052410247F4c80');
    input.add256(2339389323922393930n);

    const { inputProof, handles } = await input.encrypt();
    expect(inputProof).toBeDefined();
    expect(handles.length).toBe(8);
  });

  //////////////////////////////////////////////////////////////////////////////
  // Encrypt single 0
  //////////////////////////////////////////////////////////////////////////////

  it('v1: encrypt one 0 value', async () => {
    const version = 1;
    setupAllFetchMockRoutes({
      enableInputProofRoutes: true,
    });
    const fhevm = await createFhevm(version);

    const input = createRelayerEncryptedInput({
      fhevm,
      capacity: 2048,
    })(
      '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );
    input.add128(BigInt(0));

    const { inputProof, handles } = await input.encrypt();

    expect(inputProof).toBeDefined();
    expect(handles.length).toBe(1);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v2: encrypt one 0 value', async () => {
    const version = 2;
    setupAllFetchMockRoutes({
      enableInputProofRoutes: true,
    });
    const fhevm = await createFhevm(version);

    const input = createRelayerEncryptedInput({
      fhevm,
      capacity: 2048,
    })(
      '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );
    input.add128(BigInt(0));

    const { inputProof, handles } = await input.encrypt();

    expect(inputProof).toBeDefined();
    expect(handles.length).toBe(1);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v1: encrypt zero handles', async () => {
    const version = 1;
    setupAllFetchMockRoutes({
      enableInputProofRoutes: true,
    });
    const fhevm = await createFhevm(version);

    const input = createRelayerEncryptedInput({
      fhevm,
      capacity: 2048,
    })(
      '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );

    await expect(input.encrypt()).rejects.toThrow(
      `Encrypted input must contain at least one value`,
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v2: encrypt zero handles', async () => {
    const version = 2;
    setupAllFetchMockRoutes({
      enableInputProofRoutes: true,
    });
    const fhevm = await createFhevm(version);

    const input = createRelayerEncryptedInput({
      fhevm,
      capacity: 2048,
    })(
      '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );

    await expect(input.encrypt()).rejects.toThrow(
      `Encrypted input must contain at least one value`,
    );
  });

  //////////////////////////////////////////////////////////////////////////////
  // Throws errors
  //////////////////////////////////////////////////////////////////////////////

  it('v1: throws errors', async () => {
    const version = 1;
    setupAllFetchMockRoutes({
      enableInputProofRoutes: true,
    });
    const fhevm = await createFhevm(version);
    testThrowsErrorsSuite(fhevm);
  });

  it('v2: throws errors', async () => {
    const version = 2;
    setupAllFetchMockRoutes({
      enableInputProofRoutes: true,
    });
    const fhevm = await createFhevm(version);
    testThrowsErrorsSuite(fhevm);
  });

  function testThrowsErrorsSuite(fhevm: AbstractRelayerFhevm) {
    expect(() =>
      createRelayerEncryptedInput({
        fhevm,
        capacity: 2048,
      })('0xa5e1defb98EFe38EBb2D958CEe052410247F4c80', '0'),
    ).toThrow('User address is not a valid address.');

    expect(() =>
      createRelayerEncryptedInput({
        fhevm,
        capacity: 2048,
      })('0x0', '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80'),
    ).toThrow('Contract address is not a valid address.');

    expect(() =>
      createRelayerEncryptedInput({
        fhevm,
        capacity: 2048,
      })(
        '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
        '0xa5e1defb98EFe38EBb2D958CEe052410247F4c',
      ),
    ).toThrow('User address is not a valid address.');

    const input = createRelayerEncryptedInput({
      fhevm,
      capacity: 2048,
    })(
      '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );

    expect(() => input.addBool('hello' as any)).toThrow(
      'The value must be a boolean, a number or a bigint.',
    );

    expect(() => input.addBool({} as any)).toThrow(
      'The value must be a boolean, a number or a bigint.',
    );

    expect(() => input.addBool(29393 as any)).toThrow(
      'The value must be 1 or 0.',
    );

    expect(() => input.add8(2 ** 8)).toThrow(
      'The value exceeds the limit for 8bits integer (255)',
    );

    expect(() => input.add16(2 ** 16)).toThrow(
      `The value exceeds the limit for 16bits integer (65535).`,
    );

    expect(() => input.add32(2 ** 32)).toThrow(
      'The value exceeds the limit for 32bits integer (4294967295).',
    );

    expect(() => input.add64(0xffffffffffffffffn + 1n)).toThrow(
      'The value exceeds the limit for 64bits integer (18446744073709551615).',
    );

    expect(() =>
      input.add128(0xffffffffffffffffffffffffffffffffn + 1n),
    ).toThrow(
      'The value exceeds the limit for 128bits integer (340282366920938463463374607431768211455).',
    );

    expect(() => input.addAddress('0x00')).toThrow(
      'The value must be a valid address.',
    );
  }

  //////////////////////////////////////////////////////////////////////////////
  // 2048 bits limit
  //////////////////////////////////////////////////////////////////////////////

  it('v1: throws if total bits is above 2048', async () => {
    const version = 1;
    setupAllFetchMockRoutes({
      enableInputProofRoutes: true,
    });
    const fhevm = await createFhevm(version);

    const input = createRelayerEncryptedInput({
      fhevm,
      capacity: 2048,
    })(
      '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );

    for (let i = 0; i < 8; ++i) {
      input.add256(242);
    }
    expect(() => input.addBool(false)).toThrow(
      'Packing more than 2048 bits in a single input ciphertext is unsupported',
    );
  });

  it('v2: throws if total bits is above 2048', async () => {
    const version = 2;
    setupAllFetchMockRoutes({
      enableInputProofRoutes: true,
    });
    const fhevm = await createFhevm(version);

    const input = createRelayerEncryptedInput({
      fhevm,
      capacity: 2048,
    })(
      '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );
    for (let i = 0; i < 8; ++i) {
      input.add256(242);
    }
    expect(() => input.addBool(false)).toThrow(
      'Packing more than 2048 bits in a single input ciphertext is unsupported',
    );
  });

  //////////////////////////////////////////////////////////////////////////////
  // 256 items limit
  //////////////////////////////////////////////////////////////////////////////

  it('v1: throws if total items is above 256', async () => {
    const version = 1;
    setupAllFetchMockRoutes({
      enableInputProofRoutes: true,
    });
    const fhevm = await createFhevm(version);

    const input = createRelayerEncryptedInput({
      fhevm,
      capacity: 2048,
    })(
      '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );
    for (let i = 0; i < 256; ++i) {
      input.addBool(true);
    }
    expect(() => input.addBool(false)).toThrow(
      'Packing more than 256 variables in a single input ciphertext is unsupported',
    );
  });

  it('v2:  throws if total items is above 256', async () => {
    const version = 2;
    setupAllFetchMockRoutes({
      enableInputProofRoutes: true,
    });
    const fhevm = await createFhevm(version);

    const input = createRelayerEncryptedInput({
      fhevm,
      capacity: 2048,
    })(
      '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );
    for (let i = 0; i < 256; ++i) {
      input.addBool(true);
    }
    expect(() => input.addBool(false)).toThrow(
      'Packing more than 256 variables in a single input ciphertext is unsupported',
    );
  });

  //////////////////////////////////////////////////////////////////////////////
  // Wrong number of handles in reply
  //////////////////////////////////////////////////////////////////////////////

  it('v1: throws if incorrect handles list size', async () => {
    const version = 1;
    setupAllFetchMockRoutes({
      enableInputProofRoutes: true,
      inputProofResult: {
        handles: INPUT_PROOF_ASSET_3.fetch_json.response.handles,
        signatures: INPUT_PROOF_ASSET_3.fetch_json.response.signatures,
      },
    });
    const fhevm = await createFhevm(version);

    const input = createRelayerEncryptedInput({
      fhevm,
      capacity: 2048,
    })(
      '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );
    input.add128(BigInt(0));
    input.add128(BigInt(0));
    await expect(input.encrypt()).rejects.toThrow(
      `Incorrect Handles list sizes: (expected) 2 != ${INPUT_PROOF_ASSET_3.fetch_json.response.handles.length} (received)`,
    );
  });

  //////////////////////////////////////////////////////////////////////////////

  it('v2: throws if incorrect handles list size', async () => {
    const version = 2;
    setupAllFetchMockRoutes({
      enableInputProofRoutes: true,
      inputProofResult: {
        handles: INPUT_PROOF_ASSET_3.fetch_json.response.handles,
        signatures: INPUT_PROOF_ASSET_3.fetch_json.response.signatures,
      },
    });
    const fhevm = await createFhevm(version);

    const input = createRelayerEncryptedInput({
      fhevm,
      capacity: 2048,
    })(
      '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );
    input.add128(BigInt(0));
    input.add128(BigInt(0));
    await expect(input.encrypt()).rejects.toThrow(
      `Incorrect Handles list sizes: (expected) 2 != ${INPUT_PROOF_ASSET_3.fetch_json.response.handles.length} (received)`,
    );
  });

  //////////////////////////////////////////////////////////////////////////////
  // Invalid handle
  //////////////////////////////////////////////////////////////////////////////

  it('v1: throws if incorrect handle', async () => {
    const version = 1;
    setupAllFetchMockRoutes({
      enableInputProofRoutes: true,
      inputProofResult: {
        handles: [
          '0x0034ab0034ab00340034abe034cb00340034ab0034ab00340034ab0934ab0034',
        ],
        signatures: ['dead3232'],
      },
    });
    const fhevm = await createFhevm(version);

    const input = createRelayerEncryptedInput({
      fhevm,
      capacity: 2048,
    })(
      '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );
    input.add128(BigInt(1));

    await expect(input.encrypt()).rejects.toThrow(
      new InvalidPropertyError({
        objName: 'fetchPostInputProof()',
        property: 'signatures',
        index: 0,
        expectedType: 'Bytes65Hex',
        type: 'string',
      }),
    );
  });

  it('v2: throws if incorrect handle', async () => {
    const version = 2;
    setupAllFetchMockRoutes({
      enableInputProofRoutes: true,
      inputProofResult: {
        handles: [
          '0x0034ab0034ab00340034abe034cb00340034ab0034ab00340034ab0934ab0034',
        ],
        signatures: ['dead3232'],
      },
    });
    const fhevm = await createFhevm(version);

    const input = createRelayerEncryptedInput({
      fhevm,
      capacity: 2048,
    })(
      '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
    );
    input.add128(BigInt(1));

    await expect(input.encrypt()).rejects.toThrow(
      RelayerV2ResponseInvalidBodyError,
    );
  }, 60000);

  //////////////////////////////////////////////////////////////////////////////
  // Unauthorized, wrong x-api-key
  //////////////////////////////////////////////////////////////////////////////

  describe('when api keys are enabled', () => {
    it('v1: returns Unauthorized if api key is invalid', async () => {
      const version = 1;
      setupAllFetchMockRoutes({
        enableInputProofRoutes: true,
        instanceOptions: {
          ...TEST_CONFIG[`v${version}`].fhevmInstanceConfig,
          auth: { __type: 'ApiKeyHeader', value: 'my-api-key' },
        },
      });
      const fhevm = await createFhevm(version);

      const input = createRelayerEncryptedInput({
        fhevm,
        capacity: 2048,
      })(
        '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
        '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
      );
      input.addBool(true);

      expect(
        input.encrypt({
          auth: { __type: 'ApiKeyHeader', value: 'my-wrong-api-key' },
        }),
      ).rejects.toThrow(/Unauthorized/);
    });

    it('v2: returns Unauthorized if api key is invalid', async () => {
      const version = 2;
      setupAllFetchMockRoutes({
        enableInputProofRoutes: true,
        instanceOptions: {
          ...TEST_CONFIG[`v${version}`].fhevmInstanceConfig,
          auth: { __type: 'ApiKeyHeader', value: 'my-api-key' },
        },
      });
      const fhevm = await createFhevm(version);

      const input = createRelayerEncryptedInput({
        fhevm,
        capacity: 2048,
      })(
        '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
        '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
      );
      input.addBool(true);

      expect(
        input.encrypt({
          auth: { __type: 'ApiKeyHeader', value: 'my-wrong-api-key' },
        }),
      ).rejects.toThrow(/Unauthorized/);
    });

    ////////////////////////////////////////////////////////////////////////////
    // Unauthorized, missing x-api-key
    ////////////////////////////////////////////////////////////////////////////

    it('v1: returns Unauthorized if the api key is missing', async () => {
      const version = 1;
      setupAllFetchMockRoutes({
        enableInputProofRoutes: true,
        instanceOptions: {
          ...TEST_CONFIG[`v${version}`].fhevmInstanceConfig,
          auth: { __type: 'ApiKeyHeader', value: 'my-api-key' },
        },
      });
      const fhevm = await createFhevm(version);

      const input = createRelayerEncryptedInput({
        fhevm,
        capacity: 2048,
      })(
        '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
        '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
      );
      input.addBool(true);

      expect(input.encrypt()).rejects.toThrow(/Unauthorized/);
    });

    it('v2: returns Unauthorized if the api key is missing', async () => {
      const version = 2;
      setupAllFetchMockRoutes({
        enableInputProofRoutes: true,
        instanceOptions: {
          ...TEST_CONFIG[`v${version}`].fhevmInstanceConfig,
          auth: { __type: 'ApiKeyHeader', value: 'my-api-key' },
        },
      });
      const fhevm = await createFhevm(version);

      const input = createRelayerEncryptedInput({
        fhevm,
        capacity: 2048,
      })(
        '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
        '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
      );
      input.addBool(true);

      expect(input.encrypt()).rejects.toThrow(/Unauthorized/);
    });

    ////////////////////////////////////////////////////////////////////////////
    // Authorized using x-api-key
    ////////////////////////////////////////////////////////////////////////////

    it('v1: returns ok if the api key is valid', async () => {
      const version = 1;
      setupAllFetchMockRoutes({
        enableInputProofRoutes: true,
        instanceOptions: {
          ...TEST_CONFIG[`v${version}`].fhevmInstanceConfig,
          auth: { __type: 'ApiKeyHeader', value: 'my-api-key' },
        },
      });
      const fhevm = await createFhevm(version);

      const input = createRelayerEncryptedInput({
        fhevm,
        capacity: 2048,
      })(
        '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
        '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
      );
      input.addBool(true);

      const { inputProof } = await input.encrypt({
        auth: { __type: 'ApiKeyHeader', value: 'my-api-key' },
      });
      expect(inputProof).toBeDefined();
    });

    it('v2: returns ok if the api key is valid', async () => {
      const version = 2;
      setupAllFetchMockRoutes({
        enableInputProofRoutes: true,
        instanceOptions: {
          ...TEST_CONFIG[`v${version}`].fhevmInstanceConfig,
          auth: { __type: 'ApiKeyHeader', value: 'my-api-key' },
        },
      });
      const fhevm = await createFhevm(version);

      const input = createRelayerEncryptedInput({
        fhevm,
        capacity: 2048,
      })(
        '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
        '0xa5e1defb98EFe38EBb2D958CEe052410247F4c80',
      );
      input.addBool(true);

      const { inputProof } = await input.encrypt({
        auth: { __type: 'ApiKeyHeader', value: 'my-api-key' },
      });
      expect(inputProof).toBeDefined();
    }, 60000);
  });
});
