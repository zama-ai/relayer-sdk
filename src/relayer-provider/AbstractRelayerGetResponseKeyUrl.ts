import {
  assertRecordNonNullableProperty,
  assertRecordArrayProperty,
} from '@base/record';
import {
  assertRecordStringArrayProperty,
  assertRecordStringProperty,
} from '@base/string';
import type {
  RelayerGetResponseKeyUrlCamelCase,
  RelayerGetResponseKeyUrlSnakeCase,
  RelayerKeyDataCamelCase,
  RelayerKeyDataSnakeCase,
  RelayerKeyInfoSnakeCase,
} from './types/private';

export function isRelayerGetResponseKeyUrlCamelCase(
  value: unknown,
): value is RelayerGetResponseKeyUrlCamelCase {
  try {
    assertIsRelayerGetResponseKeyUrlCamelCase(
      value,
      'RelayerGetResponseKeyUrlCamelCase',
    );
    return true;
  } catch {
    return false;
  }
}

export function isRelayerGetResponseKeyUrlSnakeCase(
  value: unknown,
): value is RelayerGetResponseKeyUrlSnakeCase {
  try {
    assertIsRelayerGetResponseKeyUrlSnakeCase(
      value,
      'RelayerGetResponseKeyUrlSnakeCase',
    );
    return true;
  } catch {
    return false;
  }
}

export function assertIsRelayerGetResponseKeyUrlCamelCase(
  value: unknown,
  name: string,
): asserts value is RelayerGetResponseKeyUrlCamelCase {
  _assertIsRelayerGetResponseKeyUrl(value, name, {
    fheKeyInfoName: 'fheKeyInfo',
    fhePublicKeyName: 'fhePublicKey',
    dataIdName: 'dataId',
  });
}

export function assertIsRelayerGetResponseKeyUrlSnakeCase(
  value: unknown,
  name: string,
): asserts value is RelayerGetResponseKeyUrlSnakeCase {
  _assertIsRelayerGetResponseKeyUrl(value, name, {
    fheKeyInfoName: 'fhe_key_info',
    fhePublicKeyName: 'fhe_public_key',
    dataIdName: 'data_id',
  });
}

function _assertIsRelayerGetResponseKeyUrl(
  value: unknown,
  name: string,
  names:
    | {
        fheKeyInfoName: 'fheKeyInfo';
        fhePublicKeyName: 'fhePublicKey';
        dataIdName: 'dataId';
      }
    | {
        fheKeyInfoName: 'fhe_key_info';
        fhePublicKeyName: 'fhe_public_key';
        dataIdName: 'data_id';
      },
): void {
  assertRecordNonNullableProperty(value, 'response', name);

  // crs
  assertRecordNonNullableProperty(value.response, 'crs', `${name}.response`);
  const crs = value.response.crs as Record<string, unknown>;
  const keys = Object.keys(crs);
  for (let i = 0; i < keys.length; ++i) {
    // RelayerKeyDataSnakeCase
    _assertIsRelayerKeyData(
      crs[keys[i]],
      `${name}.response.crs.${keys[i]}`,
      names.dataIdName,
    );
  }

  assertRecordArrayProperty(
    value.response,
    names.fheKeyInfoName,
    `${name}.response`,
  );
  const fheKeyInfo = value.response[names.fheKeyInfoName];
  for (let i = 0; i < fheKeyInfo.length; ++i) {
    const ki = fheKeyInfo[i];
    const kiName = `${name}.response.${names.fheKeyInfoName}[${i}]`;
    assertRecordNonNullableProperty(ki, names.fhePublicKeyName, kiName);
    _assertIsRelayerKeyData(
      ki[names.fhePublicKeyName],
      `${kiName}.${names.fhePublicKeyName}`,
      names.dataIdName,
    );
  }
}

////////////////////////////////////////////////////////////////////////////////
// RelayerKeyData<CamelCase|SnakeCase>
////////////////////////////////////////////////////////////////////////////////

export function assertIsRelayerKeyDataCamelCase(
  value: unknown,
  name: string,
): asserts value is RelayerKeyDataCamelCase {
  _assertIsRelayerKeyData(value, name, 'dataId');
}

export function assertIsRelayerKeyDataSnakeCase(
  value: unknown,
  name: string,
): asserts value is RelayerKeyDataSnakeCase {
  _assertIsRelayerKeyData(value, name, 'data_id');
}

function _assertIsRelayerKeyData(
  value: unknown,
  name: string,
  dataIdName: 'data_id' | 'dataId',
): void {
  assertRecordStringProperty(value, dataIdName, name);
  assertRecordStringArrayProperty(value, 'urls', name);
}

////////////////////////////////////////////////////////////////////////////////

function _toRelayerGetResponseKeyUrlSnakeCase(
  response: RelayerGetResponseKeyUrlCamelCase,
): RelayerGetResponseKeyUrlSnakeCase {
  const fheKeyInfoSnakeCase: RelayerKeyInfoSnakeCase[] =
    response.response.fheKeyInfo.map((infoCamelCase) => ({
      fhe_public_key: {
        data_id: infoCamelCase.fhePublicKey.dataId,
        urls: infoCamelCase.fhePublicKey.urls,
      },
    }));

  const crsSnakeCase: Record<string, RelayerKeyDataSnakeCase> = {};
  for (const [key, dataCamelCase] of Object.entries(response.response.crs)) {
    crsSnakeCase[key] = {
      data_id: dataCamelCase.dataId,
      urls: dataCamelCase.urls,
    };
  }

  return {
    response: {
      fhe_key_info: fheKeyInfoSnakeCase,
      crs: crsSnakeCase,
    },
  };
}

export function toRelayerGetResponseKeyUrlSnakeCase(
  response: unknown,
): RelayerGetResponseKeyUrlSnakeCase | undefined {
  if (isRelayerGetResponseKeyUrlSnakeCase(response)) {
    return response;
  }
  if (isRelayerGetResponseKeyUrlCamelCase(response)) {
    return _toRelayerGetResponseKeyUrlSnakeCase(response);
  }
  return undefined;
}
