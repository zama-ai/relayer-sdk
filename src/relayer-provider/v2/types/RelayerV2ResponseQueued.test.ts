import { InvalidPropertyError } from '../../../errors/InvalidPropertyError';
import { assertIsRelayerV2ResponseQueued } from './RelayerV2ResponseQueued';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2ResponseQueued.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2ResponseQueued.ts

describe('RelayerV2ResponseQueued', () => {
  it('assertIsRelayerV2ResponseQueued', () => {
    // True
    expect(() =>
      assertIsRelayerV2ResponseQueued(
        {
          status: 'queued',
          result: {
            jobId: 'hello',
            retryAfterSeconds: 2,
          },
        },
        'Foo',
      ),
    ).not.toThrow();

    expect(() => assertIsRelayerV2ResponseQueued({}, 'Foo')).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'status',
        expectedType: 'string',
        expectedValue: 'queued',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResponseQueued({ status: 'foo' }, 'Foo'),
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
  });
});
