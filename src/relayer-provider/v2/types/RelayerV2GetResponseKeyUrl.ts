import type { RelayerV2KeyData, RelayerV2GetResponseKeyUrl } from './types';
import {
  assertNonNullableRecordProperty,
  assertRecordArrayProperty,
} from '../../../utils/record';
import {
  assertRecordStringArrayProperty,
  assertRecordStringProperty,
} from '../../../utils/string';

export function isRelayerV2GetResponseKeyUrl(
  value: unknown,
): value is RelayerV2GetResponseKeyUrl {
  try {
    assertIsRelayerV2GetResponseKeyUrl(value, 'RelayerV2GetResponseKeyUrl');
    return true;
  } catch {
    return false;
  }
}

export function assertIsRelayerV2GetResponseKeyUrl(
  value: unknown,
  name: string,
): asserts value is RelayerV2GetResponseKeyUrl {
  assertNonNullableRecordProperty(value, 'response', name);

  // crs
  assertNonNullableRecordProperty(value.response, 'crs', `${name}.response`);
  const crs = value.response.crs as Record<string, unknown>;
  const keys = Object.keys(crs);
  for (let i = 0; i < keys.length; ++i) {
    // RelayerV2KeyData
    assertIsRelayerV2KeyData(crs[keys[i]], `${name}.response.crs.${keys[i]}`);
  }

  // fhe_key_info
  assertRecordArrayProperty(value.response, 'fhe_key_info', `${name}.response`);
  const fhe_key_info = value.response.fhe_key_info;
  for (let i = 0; i < fhe_key_info.length; ++i) {
    const ki = fhe_key_info[i];
    const kiName = `${name}.response.fhe_key_info[${i}]`;
    assertNonNullableRecordProperty(ki, 'fhe_public_key', kiName);
    assertIsRelayerV2KeyData(ki.fhe_public_key, `${kiName}.fhe_public_key`);
  }
}

export function assertIsRelayerV2KeyData(
  value: unknown,
  name: string,
): asserts value is RelayerV2KeyData {
  assertRecordStringProperty(value, 'data_id', name);
  assertRecordStringArrayProperty(value, 'urls', name);
}
