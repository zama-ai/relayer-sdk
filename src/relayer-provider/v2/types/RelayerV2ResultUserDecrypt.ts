import type { RelayerV2ResultUserDecrypt } from './types';
import { assertRecordBytesHexNo0xProperty } from '../../../utils/bytes';
import { assertRecordArrayProperty } from '../../../utils/record';

/**
 * Assertion function that validates a value is a valid `RelayerV2ResultUserDecrypt` object.
 * Validates the structure returned from the relayer for user decryption operations.
 * Throws an `InvalidPropertyError` if validation fails.
 *
 * @param value - The value to validate (can be any type)
 * @param name - The name of the value being validated (used in error messages)
 * @throws {InvalidPropertyError} When any required property is missing or has an invalid format
 * @throws {never} No other errors are thrown
 */
export function assertIsRelayerV2ResultUserDecrypt(
  value: unknown,
  name: string,
): asserts value is RelayerV2ResultUserDecrypt {
  type T = RelayerV2ResultUserDecrypt;
  type ResultItem = T['result'][number];

  assertRecordArrayProperty(value, 'result' satisfies keyof T, name);
  for (let i = 0; i < value.result.length; ++i) {
    // Missing extraData
    assertRecordBytesHexNo0xProperty(
      value.result[i],
      'payload' satisfies keyof ResultItem,
      `${name}.result[${i}]`,
    );
    assertRecordBytesHexNo0xProperty(
      value.result[i],
      'signature' satisfies keyof ResultItem,
      `${name}.result[${i}]`,
    );
  }
}
