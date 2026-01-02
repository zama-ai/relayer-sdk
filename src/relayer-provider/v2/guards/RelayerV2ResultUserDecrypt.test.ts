import { InvalidPropertyError } from '../../../errors/InvalidPropertyError';
import { assertIsRelayerV2ResultUserDecrypt } from './RelayerV2ResultUserDecrypt';

// Jest Command line
// =================
// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/types/RelayerV2ResultUserDecrypt.test.ts
// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2ResultUserDecrypt.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2ResultUserDecrypt.ts

describe('RelayerV2ResultUserDecrypt', () => {
  it('assertIsRelayerV2ResultUserDecrypt', () => {
    // True
    expect(() =>
      assertIsRelayerV2ResultUserDecrypt(
        {
          result: [
            {
              payload: 'deadbeef',
              signature: 'deadbeef',
              //extraData: '0x00',
            },
          ],
        },
        'Foo',
      ),
    ).not.toThrow();

    // False
    expect(() =>
      assertIsRelayerV2ResultUserDecrypt({ foo: 'bar' }, 'Foo'),
    ).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo',
        property: 'result',
        expectedType: 'Array',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultUserDecrypt({ result: 'bar' }, 'Foo'),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo',
        property: 'result',
        expectedType: 'Array',
        type: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultUserDecrypt({ result: [{}] }, 'Foo'),
    ).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo.result[0]',
        property: 'payload',
        expectedType: 'BytesHexNo0x',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultUserDecrypt(
        { result: [{ payload: 'deadbeef' }] },
        'Foo',
      ),
    ).toThrow(
      InvalidPropertyError.missingProperty({
        objName: 'Foo.result[0]',
        property: 'signature',
        expectedType: 'BytesHexNo0x',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultUserDecrypt(
        { result: [{ payload: '0xdeadbeef' }] },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo.result[0]',
        property: 'payload',
        expectedType: 'BytesHexNo0x',
        type: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultUserDecrypt(
        { result: [{ payload: 'deadbeef', signature: 'hello' }] },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo.result[0]',
        property: 'signature',
        expectedType: 'BytesHexNo0x',
        type: 'string',
      }),
    );

    expect(() =>
      assertIsRelayerV2ResultUserDecrypt(
        { result: [{ payload: 'deadbeef', signature: '0xdeadbeef' }] },
        'Foo',
      ),
    ).toThrow(
      new InvalidPropertyError({
        objName: 'Foo.result[0]',
        property: 'signature',
        expectedType: 'BytesHexNo0x',
        type: 'string',
      }),
    );
  });
});
