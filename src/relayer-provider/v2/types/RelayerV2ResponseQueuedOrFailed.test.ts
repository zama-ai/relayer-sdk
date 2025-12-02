import { InvalidPropertyError } from '../../../errors/InvalidPropertyError';
import { assertIsRelayerV2ResponseQueuedOrFailed } from './RelayerV2ResponseQueuedOrFailed';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2ResponseQueuedOrFailed.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2ResponseQueuedOrFailed.ts

describe('RelayerV2ResponseQueuedOrFailed', () => {
  it('assertIsRelayerV2ResponseQueuedOrFailed', () => {
    // True
    expect(() =>
      assertIsRelayerV2ResponseQueuedOrFailed(
        {
          status: 'failed',
          error: {
            label: 'malformed_json',
            message: 'hello',
            request_id: 'world',
          },
        },
        'Foo',
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerV2ResponseQueuedOrFailed(
        {
          status: 'queued',
          result: {
            job_id: 'hello',
            retry_after_seconds: 2,
          },
        },
        'Foo',
      ),
    ).not.toThrow();

    expect(() => assertIsRelayerV2ResponseQueuedOrFailed({}, 'Foo')).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'status',
        expectedType: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResponseQueuedOrFailed({ status: 'foo' }, 'Foo'),
    ).toThrow(
      InvalidPropertyError.invalidFormat({
        objName: 'Foo',
        property: 'result',
      }),
    );
  });
});
