export type RelayerV1FetchResponseJson = { response: any };

////////////////////////////////////////////////////////////////////////////////

// https://github.com/zama-ai/console/blob/1d74c413760690d9ad4350e283f609242159331e/apps/relayer/src/http/keyurl_http_listener.rs#L6
export type RelayerV1KeyData = { data_id: string; urls: Array<string> };
export type RelayerV1KeyInfo = { fhe_public_key: RelayerV1KeyData };
export type RelayerV1KeyUrlResponse = {
  response: {
    fhe_key_info: Array<RelayerV1KeyInfo>;
    crs: Record<string, RelayerV1KeyData>;
  };
};

////////////////////////////////////////////////////////////////////////////////

export type RelayerV1ProviderErrorCause =
  | {
      code:
        | 'RELAYER_UNEXPECTED_JSON_ERROR'
        | 'RELAYER_INTERNAL_ERROR'
        | 'RELAYER_UNKNOWN_ERROR';
      operation: RelayerOperation;
      error: unknown;
    }
  | {
      code: 'RELAYER_FETCH_ERROR';
      operation: RelayerOperation;
      status: Response['status'];
      statusText: Response['statusText'];
      url: Response['url'];
      response: Response;
      responseJson: any;
    }
  | {
      code: 'RELAYER_NO_JSON_ERROR';
      operation: RelayerOperation;
      response: Response;
      error: unknown;
    };
