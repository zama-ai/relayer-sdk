import { InvalidPropertyError } from '../../../errors/InvalidPropertyError';
import { assertIsRelayerV2ResultQueued } from './RelayerV2ResultQueued';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2ResultQueued.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2ResultQueued.ts

describe('RelayerV2ResultQueued', () => {
  it('assertIsRelayerV2ResultQueued', () => {
    expect(() =>
      assertIsRelayerV2ResultQueued(
        { job_id: 'abc', retry_after_seconds: 3 },
        'Foo',
      ),
    ).not.toThrow();

    expect(() =>
      assertIsRelayerV2ResultQueued(
        { job_id: 'abc', retry_after_seconds: 'Thu' },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'retry_after_seconds',
        expectedType: 'Uint',
        type: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultQueued(
        { job_id: 123, retry_after_seconds: 2 },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'job_id',
        expectedType: 'string',
        type: 'number',
      }),
    );

    expect(() => assertIsRelayerV2ResultQueued({}, 'Foo')).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'job_id',
        expectedType: 'string',
      }),
    );
  });
});
