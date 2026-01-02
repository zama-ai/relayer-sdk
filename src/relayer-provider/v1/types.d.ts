import type { RelayerOperation } from '../types/public-api';

export type RelayerV1FetchResponseJson = { response: any };

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
