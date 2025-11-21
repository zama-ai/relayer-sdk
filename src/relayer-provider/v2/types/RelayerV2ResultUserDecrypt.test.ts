import { assertIsRelayerV2ResultUserDecrypt } from './RelayerV2ResultUserDecrypt';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2ResultUserDecrypt.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2ResultUserDecrypt.ts

describe('RelayerV2ResultUserDecrypt', () => {
  it('assertIsRelayerV2ResultUserDecrypt', () => {
    expect(() =>
      assertIsRelayerV2ResultUserDecrypt({ foo: 'bar' }, 'Foo'),
    ).toThrow('Invalid Foo.payloads');

    expect(() =>
      assertIsRelayerV2ResultUserDecrypt({ payloads: 'bar' }, 'Foo'),
    ).toThrow('Invalid array Foo.payloads');

    expect(() =>
      assertIsRelayerV2ResultUserDecrypt({ payloads: ['bar'] }, 'Foo'),
    ).toThrow('Invalid bytes hex without 0x prefix Foo.payloads[0]');

    expect(() =>
      assertIsRelayerV2ResultUserDecrypt({ payloads: ['deadbeef'] }, 'Foo'),
    ).toThrow('Invalid Foo.signatures');

    expect(() =>
      assertIsRelayerV2ResultUserDecrypt({ payloads: ['0xdeadbeef'] }, 'Foo'),
    ).toThrow('Invalid bytes hex without 0x prefix Foo.payloads[0]');

    expect(() =>
      assertIsRelayerV2ResultUserDecrypt(
        { payloads: ['deadbeef'], signatures: 'hello' },
        'Foo',
      ),
    ).toThrow('Invalid array Foo.signatures');

    expect(() =>
      assertIsRelayerV2ResultUserDecrypt(
        { payloads: ['deadbeef'], signatures: ['hello'] },
        'Foo',
      ),
    ).toThrow('Invalid bytes hex without 0x prefix Foo.signatures[0]');

    expect(() =>
      assertIsRelayerV2ResultUserDecrypt(
        { payloads: ['deadbeef'], signatures: ['deadbeef'] },
        'Foo',
      ),
    ).not.toThrow();
  });
});
