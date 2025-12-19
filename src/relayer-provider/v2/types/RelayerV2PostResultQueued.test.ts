import { InvalidPropertyError } from '../../../errors/InvalidPropertyError';
import { assertIsRelayerV2PostResultQueued } from './RelayerV2PostResultQueued';

// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/types/RelayerV2PostResultQueued.test.ts

describe('RelayerV2ResultQueued', () => {
  it('assertIsRelayerV2PostResultQueued', () => {
    expect(() =>
      assertIsRelayerV2PostResultQueued({ jobId: 'abc' }, 'Foo'),
    ).not.toThrow();

    expect(() => assertIsRelayerV2PostResultQueued({}, 'Foo')).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'jobId',
        expectedType: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerV2PostResultQueued({ jobId: 123 }, 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'jobId',
        expectedType: 'string',
        type: 'number',
      }),
    );
  });
});
