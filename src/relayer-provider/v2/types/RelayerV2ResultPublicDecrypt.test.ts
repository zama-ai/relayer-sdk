import { assertIsRelayerV2ResultPublicDecrypt } from './RelayerV2ResultPublicDecrypt';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2ResultPublicDecrypt.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2ResultPublicDecrypt.ts

describe('RelayerV2ResultPublicDecrypt', () => {
  it('assertIsRelayerV2ResultPublicDecrypt', () => {
    expect(() => assertIsRelayerV2ResultPublicDecrypt({}, 'Foo')).toThrow(
      'Invalid Foo.extra_data',
    );
    expect(() =>
      assertIsRelayerV2ResultPublicDecrypt({ extra_data: 123 }, 'Foo'),
    ).toThrow('Invalid bytes hex Foo.extra_data');
    expect(() =>
      assertIsRelayerV2ResultPublicDecrypt({ extra_data: '0x00' }, 'Foo'),
    ).toThrow('Invalid Foo.signatures');
    expect(() =>
      assertIsRelayerV2ResultPublicDecrypt(
        { extra_data: '0x00', signatures: 'hello' },
        'Foo',
      ),
    ).toThrow('Invalid array Foo.signatures');
    expect(() =>
      assertIsRelayerV2ResultPublicDecrypt(
        { extra_data: '0x00', signatures: ['hello'] },
        'Foo',
      ),
    ).toThrow('Invalid bytes hex without 0x prefix Foo.signatures[0]');
    expect(() =>
      assertIsRelayerV2ResultPublicDecrypt(
        { extra_data: '0x00', signatures: ['0xdeadbeef'] },
        'Foo',
      ),
    ).toThrow('Invalid bytes hex without 0x prefix Foo.signatures[0]');
    expect(() =>
      assertIsRelayerV2ResultPublicDecrypt(
        { extra_data: '0x00', signatures: ['deadbeef'] },
        'Foo',
      ),
    ).toThrow('Invalid Foo.decrypted_value');
    expect(() =>
      assertIsRelayerV2ResultPublicDecrypt(
        {
          extra_data: '0x00',
          signatures: ['deadbeef'],
          decrypted_value: 'dead',
        },
        'Foo',
      ),
    ).not.toThrow();
  });
});
