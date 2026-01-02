////////////////////////////////////////////////////////////////////////////////
// KeyUrl
////////////////////////////////////////////////////////////////////////////////

export type RelayerGetResponseKeyUrl =
  | RelayerGetResponseKeyUrlCamelCase
  | RelayerGetResponseKeyUrlSnakeCase;

export type RelayerKeyInfoCamelCase = { fhePublicKey: RelayerKeyDataCamelCase };
export type RelayerKeyDataCamelCase = { dataId: string; urls: Array<string> };
export type RelayerGetResponseKeyUrlCamelCase = {
  response: {
    fheKeyInfo: Array<RelayerKeyInfoCamelCase>;
    crs: Record<string, RelayerKeyDataCamelCase>;
  };
};

export type RelayerKeyInfoSnakeCase = {
  fhe_public_key: RelayerKeyDataSnakeCase;
};
export type RelayerKeyDataSnakeCase = { data_id: string; urls: Array<string> };
export type RelayerGetResponseKeyUrlSnakeCase = {
  response: {
    fhe_key_info: Array<RelayerKeyInfoSnakeCase>;
    crs: Record<string, RelayerKeyDataSnakeCase>;
  };
};
