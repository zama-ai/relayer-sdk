import type { RelayerV2KeyData, RelayerV2GetResponseKeyUrl } from './types';
import {
  assertNonNullableRecordProperty,
  assertRecordArrayProperty,
} from '../../../utils/record';
import {
  assertRecordStringArrayProperty,
  assertRecordStringProperty,
} from '../../../utils/string';
import {
  RelayerV1KeyData,
  RelayerV1KeyInfo,
  RelayerV1KeyUrlResponse,
} from '../../../relayer-provider/v1/types';

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
  assertRecordArrayProperty(value.response, 'fheKeyInfo', `${name}.response`);
  const fheKeyInfo = value.response.fheKeyInfo;
  for (let i = 0; i < fheKeyInfo.length; ++i) {
    const ki = fheKeyInfo[i];
    const kiName = `${name}.response.fheKeyInfo[${i}]`;
    assertNonNullableRecordProperty(ki, 'fhePublicKey', kiName);
    assertIsRelayerV2KeyData(ki.fhePublicKey, `${kiName}.fhePublicKey`);
  }
}

export function assertIsRelayerV2KeyData(
  value: unknown,
  name: string,
): asserts value is RelayerV2KeyData {
  assertRecordStringProperty(value, 'dataId', name);
  assertRecordStringArrayProperty(value, 'urls', name);
}

export function toRelayerV1KeyUrlResponse(
  response: RelayerV2GetResponseKeyUrl,
): RelayerV1KeyUrlResponse {
  const fheKeyInfoV1: Array<RelayerV1KeyInfo> =
    response.response.fheKeyInfo.map((v2Info) => ({
      fhe_public_key: {
        data_id: v2Info.fhePublicKey.dataId,
        urls: v2Info.fhePublicKey.urls,
      },
    }));

  const crsV1: Record<string, RelayerV1KeyData> = {};
  for (const [key, v2Data] of Object.entries(response.response.crs)) {
    crsV1[key] = {
      data_id: v2Data.dataId,
      urls: v2Data.urls,
    };
  }

  return {
    response: {
      fhe_key_info: fheKeyInfoV1,
      crs: crsV1,
    },
  };
}
