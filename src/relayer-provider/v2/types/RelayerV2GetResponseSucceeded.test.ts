import { assertIsRelayerV2GetResponseSucceeded } from './RelayerV2GetResponseSucceeded';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2GetResponseSucceeded.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2GetResponseSucceeded.ts

describe('RelayerV2GetResponseSucceeded', () => {
  it('assertIsRelayerV2ResultPublicDecrypt', () => {
    expect(() => assertIsRelayerV2GetResponseSucceeded({}, 'Foo')).toThrow(
      'Invalid Foo.result',
    );
    expect(() =>
      assertIsRelayerV2GetResponseSucceeded({ result: null }, 'Foo'),
    ).toThrow('Invalid Foo.result');
    expect(() =>
      assertIsRelayerV2GetResponseSucceeded({ result: {} }, 'Foo'),
    ).toThrow('Invalid Foo.status');
    expect(() =>
      assertIsRelayerV2GetResponseSucceeded(
        { result: {}, status: 'hello' },
        'Foo',
      ),
    ).toThrow('Invalid string Foo.status');
  });

  it('assertIsRelayerV2ResultPublicDecrypt succeeded', () => {
    expect(() =>
      assertIsRelayerV2GetResponseSucceeded(
        { result: {}, status: 'succeeded' },
        'Foo',
      ),
    ).toThrow('Invalid Foo.result');
    expect(() =>
      assertIsRelayerV2GetResponseSucceeded(
        {
          result: { decrypted_value: 'hello', extra_data: 'hello' },
          status: 'succeeded',
        },
        'Foo',
      ),
    ).toThrow('Invalid bytes hex Foo.result.extra_data');
    expect(() =>
      assertIsRelayerV2GetResponseSucceeded(
        {
          result: { decrypted_value: 'hello', extra_data: '0xdead' },
          status: 'succeeded',
        },
        'Foo',
      ),
    ).toThrow('Invalid Foo.result.signatures');
    expect(() =>
      assertIsRelayerV2GetResponseSucceeded(
        {
          result: {
            decrypted_value: 'hello',
            extra_data: '0xdead',
            signatures: 123,
          },
          status: 'succeeded',
        },
        'Foo',
      ),
    ).toThrow('Invalid array Foo.result.signatures');
    expect(() =>
      assertIsRelayerV2GetResponseSucceeded(
        {
          result: {
            decrypted_value: 'hello',
            extra_data: '0xdead',
            signatures: ['hello'],
          },
          status: 'succeeded',
        },
        'Foo',
      ),
    ).toThrow('Invalid bytes hex without 0x prefix Foo.result.signatures[0]');
    expect(() =>
      assertIsRelayerV2GetResponseSucceeded(
        {
          result: {
            decrypted_value: 'hello',
            extra_data: '0xdead',
            signatures: ['0xdead'],
          },
          status: 'succeeded',
        },
        'Foo',
      ),
    ).toThrow('Invalid bytes hex without 0x prefix Foo.result.signatures[0]');
    expect(() =>
      assertIsRelayerV2GetResponseSucceeded(
        {
          result: {
            decrypted_value: 'hello',
            extra_data: '0xdead',
            signatures: ['dead'],
          },
          status: 'succeeded',
        },
        'Foo',
      ),
    ).toThrow('Invalid bytes hex without 0x prefix Foo.result.decrypted_value');
    expect(() =>
      assertIsRelayerV2GetResponseSucceeded(
        {
          result: {
            decrypted_value: '0xdead',
            extra_data: '0xdead',
            signatures: ['dead'],
          },
          status: 'succeeded',
        },
        'Foo',
      ),
    ).toThrow('Invalid bytes hex without 0x prefix Foo.result.decrypted_value');
    expect(() =>
      assertIsRelayerV2GetResponseSucceeded(
        {
          result: {
            decrypted_value: 'dead',
            extra_data: '0xdead',
            signatures: ['dead'],
          },
          status: 'succeeded',
        },
        'Foo',
      ),
    ).not.toThrow();
  });
});
