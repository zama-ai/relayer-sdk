import { InvalidPropertyError } from '../../../errors/InvalidPropertyError';
import { assertIsRelayerV2GetResponseInputProofSucceeded } from './RelayerV2GetResponseInputProofSucceeded';

// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/types/RelayerV2GetResponseInputProofSucceeded.test.ts
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2GetResponseInputProofSucceeded.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2GetResponseInputProofSucceeded.ts --testNamePattern=BBB
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2GetResponseInputProofSucceeded.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2GetResponseInputProofSucceeded.ts

describe('RelayerV2GetResponseInputProofSucceeded', () => {
  it('assertIsRelayerV2GetResponseInputProofSucceeded', () => {
    // True
    expect(() =>
      assertIsRelayerV2GetResponseInputProofSucceeded(
        {
          result: {
            accepted: true,
            extraData: '0xdead',
            handles: [
              '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
            ],
            signatures: ['0xdead'],
          },
          status: 'succeeded',
          requestId: 'hello',
        },
        'Foo',
      ),
    ).not.toThrow();

    // False
    expect(() =>
      assertIsRelayerV2GetResponseInputProofSucceeded({}, 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'result',
        expectedType: 'non-nullable',
        type: 'undefined',
      }),
    );

    expect(() =>
      assertIsRelayerV2GetResponseInputProofSucceeded({ result: null }, 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'result',
        expectedType: 'non-nullable',
        type: 'undefined',
      }),
    );

    expect(() =>
      assertIsRelayerV2GetResponseInputProofSucceeded({ result: {} }, 'Foo'),
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
      assertIsRelayerV2GetResponseInputProofSucceeded(
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

    expect(() =>
      assertIsRelayerV2GetResponseInputProofSucceeded(
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
      assertIsRelayerV2GetResponseInputProofSucceeded(
        { result: {}, status: 'succeeded', requestId: 'hello' },
        'Foo',
      ),
    ).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo.result',
        property: 'accepted',
        expectedType: 'boolean',
      }),
    );

    expect(() =>
      assertIsRelayerV2GetResponseInputProofSucceeded(
        {
          result: { accepted: true },
          status: 'succeeded',
          requestId: 'hello',
        },
        'Foo',
      ),
    ).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo.result',
        property: 'handles',
        expectedType: 'Array',
      }),
    );

    expect(() =>
      assertIsRelayerV2GetResponseInputProofSucceeded(
        {
          result: {
            accepted: true,
            handles: ['hello'],
          },
          status: 'succeeded',
          requestId: 'hello',
        },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo.result',
        property: 'handles',
        index: 0,
        expectedType: 'Bytes32Hex',
        type: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerV2GetResponseInputProofSucceeded(
        {
          result: {
            accepted: true,
            handles: [
              '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
            ],
          },
          status: 'succeeded',
          requestId: 'hello',
        },
        'Foo',
      ),
    ).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo.result',
        property: 'signatures',
        expectedType: 'Array',
      }),
    );

    expect(() =>
      assertIsRelayerV2GetResponseInputProofSucceeded(
        {
          result: {
            accepted: true,
            handles: [
              '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
            ],
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
        property: 'signatures',
        index: 0,
        expectedType: 'BytesHex',
        type: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerV2GetResponseInputProofSucceeded(
        {
          result: {
            accepted: true,
            handles: [
              '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
            ],
            signatures: ['0xdead'],
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
      assertIsRelayerV2GetResponseInputProofSucceeded(
        {
          result: {
            accepted: true,
            handles: [
              '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
            ],
            signatures: ['0xdead'],
            extraData: 123,
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
        type: 'number',
      }),
    );
  });
});
