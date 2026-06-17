////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/core.test.ts
//
////////////////////////////////////////////////////////////////////////////////

type CommonJsLoad = (
  request: string,
  parent: unknown,
  isMain: boolean,
) => unknown;

type CommonJsModule = {
  _load: CommonJsLoad;
};

const CJSModule = require('module') as CommonJsModule;

describe('core entrypoint', () => {
  it('does not import WASM bootstrap modules on load', () => {
    jest.resetModules();

    const banned = new Set(['node-tfhe', 'node-tkms', 'tfhe', 'tkms']);
    const touched: string[] = [];

    const originalLoad = CJSModule._load;
    CJSModule._load = ((request: string, parent: unknown, isMain: boolean) => {
      if (banned.has(request)) {
        touched.push(request);
        throw new Error(`Unexpected import from core entrypoint: ${request}`);
      }
      return originalLoad(request, parent, isMain);
    }) as CommonJsLoad;

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const core = require('./core');
      expect(typeof core.KmsEIP712).toBe('function');
      expect(typeof core.isAddress).toBe('function');
    } finally {
      CJSModule._load = originalLoad;
    }

    expect(touched).toStrictEqual([]);
  });

  it('exposes KmsEIP712 with expected behavior', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { KmsEIP712 } = require('./core') as {
      KmsEIP712: new (args: {
        chainId: bigint;
        verifyingContractAddressDecryption: string;
      }) => {
        createUserDecryptEIP712: (args: {
          publicKey: string;
          contractAddresses: string[];
          startTimestamp: number;
          durationDays: number;
          extraData: `0x${string}`;
        }) => {
          primaryType: string;
          message: {
            publicKey: string;
            startTimestamp: string;
          };
        };
      };
    };

    const kms = new KmsEIP712({
      chainId: 31337n,
      verifyingContractAddressDecryption:
        '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    });

    const eip712 = kms.createUserDecryptEIP712({
      publicKey: 'deadbeef',
      contractAddresses: ['0x5FbDB2315678afecb367f032d93F642f64180aa3'],
      startTimestamp: 1700000000,
      durationDays: 30,
      extraData: '0x00',
    });

    expect(eip712.primaryType).toBe('UserDecryptRequestVerification');
    expect(eip712.message.publicKey.startsWith('0x')).toBe(true);
    expect(eip712.message.startTimestamp).toBe('1700000000');
  });
});
