import { InvalidPropertyError } from '../../../errors/InvalidPropertyError';
import { assertIsRelayerV2GetResponseSucceeded } from './RelayerV2GetResponseSucceeded';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2GetResponseSucceeded.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2GetResponseSucceeded.ts

describe('RelayerV2GetResponseSucceeded', () => {
  it('assertIsRelayerV2ResultPublicDecrypt', () => {
    expect(() => assertIsRelayerV2GetResponseSucceeded({}, 'Foo')).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'result',
        expectedType: 'non-nullable',
        type: 'undefined',
      }),
    );
    expect(() =>
      assertIsRelayerV2GetResponseSucceeded({ result: null }, 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'result',
        expectedType: 'non-nullable',
        type: 'undefined',
      }),
    );
    expect(() =>
      assertIsRelayerV2GetResponseSucceeded({ result: {} }, 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'status',
        expectedType: 'string',
        expectedValue: 'succeeded',
        type: 'undefined',
      }),
    );
    expect(() =>
      assertIsRelayerV2GetResponseSucceeded(
        { result: {}, status: 'hello' },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'status',
        expectedType: 'string',
        expectedValue: 'succeeded',
        value: 'hello',
        type: 'string',
      }),
    );
  });

  it('assertIsRelayerV2ResultPublicDecrypt succeeded', () => {
    // True
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

    // False
    expect(() =>
      assertIsRelayerV2GetResponseSucceeded(
        { result: {}, status: 'succeeded' },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'result',
        expectedType: 'unknown',
      }),
    );

    expect(() =>
      assertIsRelayerV2GetResponseSucceeded(
        {
          result: { decrypted_value: 'hello', extra_data: 'hello' },
          status: 'succeeded',
        },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo.result',
        property: 'extra_data',
        expectedType: 'BytesHex',
        type: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerV2GetResponseSucceeded(
        {
          result: { decrypted_value: 'hello', extra_data: '0xdead' },
          status: 'succeeded',
        },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo.result',
        property: 'signatures',
        expectedType: 'Array',
        type: 'undefined',
      }),
    );

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
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo.result',
        property: 'signatures',
        expectedType: 'Array',
        type: 'number',
      }),
    );

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
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo.result',
        index: 0,
        property: 'signatures',
        expectedType: 'BytesHexNo0x',
        type: 'string',
      }),
    );

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
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo.result',
        index: 0,
        property: 'signatures',
        expectedType: 'BytesHexNo0x',
        type: 'string',
      }),
    );

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
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo.result',
        property: 'decrypted_value',
        expectedType: 'BytesHexNo0x',
        type: 'string',
      }),
    );

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
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo.result',
        property: 'decrypted_value',
        expectedType: 'BytesHexNo0x',
        type: 'string',
      }),
    );
  });
});
