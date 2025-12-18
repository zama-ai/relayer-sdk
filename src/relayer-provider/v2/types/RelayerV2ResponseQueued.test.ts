import { InvalidPropertyError } from '../../../errors/InvalidPropertyError';
import {
  assertIsRelayerV2GetResponseQueued,
  assertIsRelayerV2PostResponseQueued,
} from './RelayerV2ResponseQueued';

// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/types/RelayerV2ResponseQueued.test.ts

describe('RelayerV2ResponseQueued', () => {
  it('assertIsRelayerV2PostResponseQueued', () => {
    // True
    expect(() =>
      assertIsRelayerV2PostResponseQueued(
        {
          status: 'queued',
          requestId: 'bar',
          result: {
            jobId: 'hello',
          },
        },
        'Foo',
      ),
    ).not.toThrow();

    // False
    expect(() => assertIsRelayerV2PostResponseQueued({}, 'Foo')).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'status',
        expectedType: 'string',
        expectedValue: 'queued',
      }),
    );

    expect(() =>
      assertIsRelayerV2PostResponseQueued({ status: 'foo' }, 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'status',
        type: 'string',
        value: 'foo',
        expectedType: 'string',
        expectedValue: 'queued',
      }),
    );

    expect(() =>
      assertIsRelayerV2PostResponseQueued({ status: 'queued' }, 'Foo'),
    ).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'requestId',
        expectedType: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerV2PostResponseQueued(
        { status: 'queued', requestId: 'bar' },
        'Foo',
      ),
    ).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'result',
        expectedType: 'non-nullable',
      }),
    );

    expect(() =>
      assertIsRelayerV2PostResponseQueued(
        { status: 'queued', requestId: 'bar', result: {} },
        'Foo',
      ),
    ).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo.result',
        property: 'jobId',
        expectedType: 'string',
      }),
    );
  });

  it('assertIsRelayerV2GetResponseQueued', () => {
    // True
    expect(() =>
      assertIsRelayerV2GetResponseQueued(
        {
          status: 'queued',
          requestId: 'bar',
        },
        'Foo',
      ),
    ).not.toThrow();

    // False
    expect(() => assertIsRelayerV2GetResponseQueued({}, 'Foo')).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'status',
        expectedType: 'string',
        expectedValue: 'queued',
      }),
    );

    expect(() =>
      assertIsRelayerV2GetResponseQueued({ status: 'foo' }, 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'status',
        type: 'string',
        value: 'foo',
        expectedType: 'string',
        expectedValue: 'queued',
      }),
    );

    expect(() =>
      assertIsRelayerV2GetResponseQueued({ status: 'queued' }, 'Foo'),
    ).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'requestId',
        expectedType: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerV2GetResponseQueued(
        { status: 'queued', requestId: 123 },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'requestId',
        expectedType: 'string',
        type: 'number',
        value: '123',
      }),
    );
  });
});
