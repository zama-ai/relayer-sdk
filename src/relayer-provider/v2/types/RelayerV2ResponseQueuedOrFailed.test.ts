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
            code: 'malformed_json',
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
            id: 'hello',
            retry_after: 'Thu, 14 Nov 2024 15:30:00 GMT',
          },
        },
        'Foo',
      ),
    ).not.toThrow();

    expect(() => assertIsRelayerV2ResponseQueuedOrFailed({}, 'Foo')).toThrow(
      'Invalid Foo.status',
    );
    expect(() =>
      assertIsRelayerV2ResponseQueuedOrFailed({ status: 'foo' }, 'Foo'),
    ).toThrow(
      "Invalid value for Foo.status. Expected 'failed' | 'queued'. Got 'foo'.",
    );
  });
});
