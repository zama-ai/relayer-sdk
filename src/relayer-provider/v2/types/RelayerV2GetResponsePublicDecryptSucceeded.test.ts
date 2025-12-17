import { assertIsRelayerV2GetResponsePublicDecryptSucceeded } from './RelayerV2GetResponsePublicDecryptSucceeded';
import { InvalidPropertyError } from '../../../errors/InvalidPropertyError';

// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/types/RelayerV2GetResponsePublicDecryptSucceeded.test.ts
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/types/RelayerV2GetResponsePublicDecryptSucceeded.test.ts --testNamePattern=xxx
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2GetResponsePublicDecryptSucceeded.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2GetResponsePublicDecryptSucceeded.ts

describe('RelayerV2GetResponsePublicDecryptSucceeded', () => {
  it('assertIsRelayerV2GetResponsePublicDecryptSucceeded', () => {
    // True
    expect(() =>
      assertIsRelayerV2GetResponsePublicDecryptSucceeded(
        {
          result: {
            decryptedValue: 'dead',
            extraData: '0xdead',
            signatures: ['dead'],
          },
          requestId: 'hello',
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
        objName: 'Foo',
        property: 'requestId',
        expectedType: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerV2GetResponsePublicDecryptSucceeded(
        {
          result: { decryptedValue: 'hello' },
          status: 'succeeded',
          requestId: 'hello',
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
            decryptedValue: 'hello',
            signatures: 123,
          },
          status: 'succeeded',
          requestId: 'hello',
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
            decryptedValue: 'hello',
            signatures: ['hello'],
          },
          status: 'succeeded',
          requestId: 'hello',
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
            decryptedValue: 'hello',
            signatures: ['0xdead'],
          },
          status: 'succeeded',
          requestId: 'hello',
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
            decryptedValue: 'hello',
            signatures: ['dead'],
          },
          status: 'succeeded',
          requestId: 'hello',
        },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo.result',
        property: 'decryptedValue',
        expectedType: 'BytesHexNo0x',
        type: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerV2GetResponsePublicDecryptSucceeded(
        {
          result: {
            decryptedValue: '0xdead',
            signatures: ['dead'],
          },
          status: 'succeeded',
          requestId: 'hello',
        },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo.result',
        property: 'decryptedValue',
        expectedType: 'BytesHexNo0x',
        type: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerV2GetResponsePublicDecryptSucceeded(
        {
          result: {
            decryptedValue: 'dead',
            signatures: ['dead'],
          },
          status: 'succeeded',
          requestId: 'hello',
        },
        'Foo',
      ),
    ).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo.result',
        property: 'extraData',
        expectedType: 'BytesHex',
      }),
    );

    expect(() =>
      assertIsRelayerV2GetResponsePublicDecryptSucceeded(
        {
          result: {
            decryptedValue: 'dead',
            signatures: ['dead'],
            extraData: 'hello',
          },
          status: 'succeeded',
          requestId: 'hello',
        },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo.result',
        property: 'extraData',
        expectedType: 'BytesHex',
        type: 'string',
      }),
    );
  });
});
