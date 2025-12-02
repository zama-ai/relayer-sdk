import { InvalidPropertyError } from '../../../errors/InvalidPropertyError';
import {
  assertIsRelayerV2ResultInputProof,
  assertIsRelayerV2ResultInputProofAccepted,
  assertIsRelayerV2ResultInputProofRejected,
} from './RelayerV2ResultInputProof';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2ResultInputProof.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2ResultInputProof.ts

describe('RelayerV2ResultInputProof', () => {
  it('assertIsRelayerV2ResultInputProof accepted', () => {
    // Success
    expect(() =>
      assertIsRelayerV2ResultInputProof(
        {
          accepted: true,
          extra_data: '0xdead',
          handles: [
            '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
          ],
          signatures: ['0x12'],
        },
        'Foo',
      ),
    ).not.toThrow();

    // Failure
    expect(() =>
      assertIsRelayerV2ResultInputProof({ foo: 'bar' }, 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'accepted',
        expectedType: 'boolean',
        type: 'undefined',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultInputProofAccepted(
        { accepted: false, extra_data: '0xdead' },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'accepted',
        expectedType: 'boolean',
        type: 'boolean',
        value: 'false',
        expectedValue: 'true',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultInputProof({ accepted: true }, 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'extra_data',
        expectedType: 'BytesHex',
        type: 'undefined',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultInputProof(
        { accepted: true, extra_data: 'dead' },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'extra_data',
        expectedType: 'BytesHex',
        type: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultInputProof(
        { accepted: true, extra_data: '0xdead' },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'handles',
        expectedType: 'Array',
        type: 'undefined',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultInputProof(
        { accepted: true, extra_data: '0xdead', handles: 'hello' },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'handles',
        expectedType: 'Array',
        type: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultInputProof(
        { accepted: true, extra_data: '0xdead', handles: ['hello'] },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'handles',
        expectedType: 'Bytes32Hex',
        type: 'string',
        index: 0,
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultInputProof(
        {
          accepted: true,
          extra_data: '0xdead',
          handles: [
            '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
          ],
        },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'signatures',
        expectedType: 'Array',
        type: 'undefined',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultInputProof(
        {
          accepted: true,
          extra_data: '0xdead',
          handles: [
            '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
          ],
          signatures: {},
        },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'signatures',
        expectedType: 'Array',
        type: 'object',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultInputProof(
        {
          accepted: true,
          extra_data: '0xdead',
          handles: [
            '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
          ],
          signatures: [123],
        },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'signatures',
        expectedType: 'BytesHex',
        type: 'number',
        index: 0,
      }),
    );
  });

  it('assertIsRelayerV2ResultInputProof rejected', () => {
    expect(() =>
      assertIsRelayerV2ResultInputProof({ accepted: false }, 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        expectedType: 'BytesHex',
        property: 'extra_data',
        type: 'undefined',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultInputProofRejected(
        { accepted: true, extra_data: '0xdead' },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        expectedType: 'boolean',
        property: 'accepted',
        type: 'boolean',
        value: 'true',
        expectedValue: 'false',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultInputProof(
        { accepted: false, extra_data: 'dead' },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        expectedType: 'BytesHex',
        property: 'extra_data',
        type: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultInputProof(
        { accepted: false, extra_data: '0xdead' },
        'Foo',
      ),
    ).not.toThrow();
  });
});
