import type { RelayerErrorDetailType } from '../types/public-api';
import { assertRecordStringProperty } from '@base/string';

export function assertIsRelayerErrorDetailType(
  value: unknown,
  name: string,
): asserts value is RelayerErrorDetailType {
  assertRecordStringProperty(
    value,
    'field' satisfies keyof RelayerErrorDetailType,
    name,
  );
  assertRecordStringProperty(
    value,
    'issue' satisfies keyof RelayerErrorDetailType,
    name,
  );
}
