import { assertIsRelayerV2GetResponsePublicDecryptSucceeded } from './RelayerV2GetResponsePublicDecryptSucceeded';
import { InvalidPropertyError } from '../../../errors/InvalidPropertyError';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2GetResponsePublicDecryptSucceeded.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2GetResponsePublicDecryptSucceeded.ts

describe('RelayerV2GetResponsePublicDecryptSucceeded', () => {
  it('assertIsRelayerV2GetResponsePublicDecryptSucceeded', () => {
    // True
    expect(() =>
      assertIsRelayerV2GetResponsePublicDecryptSucceeded(
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
      assertIsRelayerV2GetResponsePublicDecryptSucceeded({}, 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'result',
        expectedType: 'non-nullable',
        type: 'undefined',
      }),
    );
    expect(() =>
      assertIsRelayerV2GetResponsePublicDecryptSucceeded(
        { result: null },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'result',
        expectedType: 'non-nullable',
        type: 'undefined',
      }),
    );
    expect(() =>
      assertIsRelayerV2GetResponsePublicDecryptSucceeded({ result: {} }, 'Foo'),
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
      assertIsRelayerV2GetResponsePublicDecryptSucceeded(
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

    // False
    expect(() =>
      assertIsRelayerV2GetResponsePublicDecryptSucceeded(
        { result: {}, status: 'succeeded' },
        'Foo',
      ),
    ).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo.result',
        property: 'extra_data',
        expectedType: 'BytesHex',
      }),
    );

    expect(() =>
      assertIsRelayerV2GetResponsePublicDecryptSucceeded(
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
      assertIsRelayerV2GetResponsePublicDecryptSucceeded(
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
      assertIsRelayerV2GetResponsePublicDecryptSucceeded(
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
      assertIsRelayerV2GetResponsePublicDecryptSucceeded(
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
      assertIsRelayerV2GetResponsePublicDecryptSucceeded(
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
      assertIsRelayerV2GetResponsePublicDecryptSucceeded(
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
      assertIsRelayerV2GetResponsePublicDecryptSucceeded(
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
