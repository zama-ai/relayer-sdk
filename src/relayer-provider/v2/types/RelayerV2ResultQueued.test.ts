import { assertIsRelayerV2ResultQueued } from './RelayerV2ResultQueued';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2ResultQueued.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2ResultQueued.ts

describe('RelayerV2ResultQueued', () => {
  it('assertIsRelayerV2ResultQueued', () => {
    expect(() =>
      assertIsRelayerV2ResultQueued(
        { id: 'abc', retry_after: 'Thu, 14 Nov 2024 15:30:00 GMT' },
        'Foo',
      ),
    ).not.toThrow();
    expect(() =>
      assertIsRelayerV2ResultQueued({ id: 'abc', retry_after: 'Thu' }, 'Foo'),
    ).toThrow('Invalid timestamp Foo.retry_after');
    expect(() =>
      assertIsRelayerV2ResultQueued(
        { id: 123, retry_after: 'Thu, 14 Nov 2024 15:30:00 GMT' },
        'Foo',
      ),
    ).toThrow('Invalid string Foo.id');
    expect(() => assertIsRelayerV2ResultQueued({}, 'Foo')).toThrow(
      'Invalid Foo.id',
    );
  });
});
