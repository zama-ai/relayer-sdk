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
  assertRecordArrayProperty(value, 'result', name);
  for (let i = 0; i < value.result.length; ++i) {
    // Missing extraData
    assertRecordBytesHexNo0xProperty(
      value.result[i],
      'payload',
      `${name}.result[${i}]`,
    );
    assertRecordBytesHexNo0xProperty(
      value.result[i],
      'signature',
      `${name}.result[${i}]`,
    );
  }
}
