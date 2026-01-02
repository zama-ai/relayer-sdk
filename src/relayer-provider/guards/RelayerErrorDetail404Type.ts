import type { RelayerApiError404Type } from '../types/public-api';
import { assertRecordArrayProperty } from '@base/record';
import { assertRecordStringProperty } from '@base/string';

export function assertIsRelayerApiError404Type(
  value: unknown,
  name: string,
): asserts value is RelayerApiError404Type {
  type T = RelayerApiError404Type;
  type DetailItem = T['details'][number];
  assertRecordStringProperty(
    value,
    'label' satisfies keyof T,
    name,
    'not_found' satisfies T['label'],
  );
  assertRecordStringProperty(value, 'message' satisfies keyof T, name);
  assertRecordStringProperty(value, 'message' satisfies keyof T, name);
  assertRecordArrayProperty(value, 'details' satisfies keyof T, name);
  const arr = value.details;
  for (let i = 0; i < arr.length; ++i) {
    const detail = arr[i];
    assertRecordStringProperty(
      detail,
      'field' satisfies keyof DetailItem,
      `${name}.details[${i}]`,
    );
    assertRecordStringProperty(
      detail,
      'issue' satisfies keyof DetailItem,
      `${name}.details[${i}]`,
    );
  }
}
