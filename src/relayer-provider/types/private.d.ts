////////////////////////////////////////////////////////////////////////////////
// KeyUrl
////////////////////////////////////////////////////////////////////////////////

export type RelayerGetResponseKeyUrl =
  | RelayerGetResponseKeyUrlCamelCase
  | RelayerGetResponseKeyUrlSnakeCase;

export type RelayerKeyInfoCamelCase = { fhePublicKey: RelayerKeyDataCamelCase };
export type RelayerKeyDataCamelCase = { dataId: string; urls: string[] };
export type RelayerGetResponseKeyUrlCamelCase = {
  response: {
    fheKeyInfo: RelayerKeyInfoCamelCase[];
    crs: Record<string, RelayerKeyDataCamelCase>;
  };
};

export type RelayerKeyInfoSnakeCase = {
  fhe_public_key: RelayerKeyDataSnakeCase;
};
export type RelayerKeyDataSnakeCase = { data_id: string; urls: string[] };
export type RelayerGetResponseKeyUrlSnakeCase = {
  response: {
    fhe_key_info: RelayerKeyInfoSnakeCase[];
    crs: Record<string, RelayerKeyDataSnakeCase>;
  };
};
