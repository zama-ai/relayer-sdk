////////////////////////////////////////////////////////////////////////////////
// V2
////////////////////////////////////////////////////////////////////////////////

import { Bytes32Hex, BytesHex, BytesHexNo0x } from 'src/utils/bytes';

// RelayerV2<Response|GetResponse|PostResponse><QueuedOrFailed|Succeeded>

// GET:  200 | 202 | 404 | 422 | 500
// POST: 202 | 400 | 429 | 500

// Readiness (400)
// 1. ACL check not propagated
// 2. S3 upload not completed
// 3. 1 & 2
// 4. Ciphertext is garbage

// GMT time stamp RFC 7231 timestamp indicating when client should retry (e.g. "Wed, 21 Oct 2015 07:28:00 GMT")
export type Timestamp = string;

// GET:  202 (queued) | 400 | 429 | 500
// POST: 202 (queued) | 400 | 429 | 500
export type RelayerV2ResponseQueuedOrFailed =
  | RelayerV2ResponseFailed
  | RelayerV2ResponseQueued;

// POST : 202 (queued) | 400 | 429 | 500
export type RelayerV2PostResponse = RelayerV2ResponseQueuedOrFailed;

// GET:  200 | 202 | 404 | 422 | 500
export type RelayerV2GetResponse =
  | RelayerV2ResponseQueuedOrFailed
  | RelayerV2GetResponseSucceeded;

// GET : 404 | 422 | 500
// POST: 400 | 429 | 500
export type RelayerV2ResponseFailed = {
  status: 'failed';
  error: RelayerV2ApiError;
};

// https://github.com/zama-ai/console/blob/1d74c413760690d9ad4350e283f609242159331e/apps/relayer/src/http/utils.rs#L626
export type RelayerV2ApiError =
  | RelayerV2ApiPostError400
  | RelayerV2ApiPostError400WithDetails
  | RelayerV2ApiPostError429
  | RelayerV2ApiError500;

// GET:  500
// POST: 500
export type RelayerV2ApiError500 = {
  code: 'internal_server_error';
  message: string;
  request_id: string;
};

// POST: 429
export type RelayerV2ApiPostError429 = {
  code: 'rate_limited';
  message: string;
  // RFC 7231 timestamp indicating when client should retry (e.g. "Wed, 21 Oct 2015 07:28:00 GMT").
  // Uses absolute timestamp instead of relative seconds for cache-safety.
  // retry_after is only used in the case of Rate limit errors.
  // example = "Thu, 14 Nov 2024 15:30:00 GMT"
  retry_after: Timestamp;
  request_id?: string;
};

// POST: 400
export type RelayerV2ApiPostError400 = {
  code: 'malformed_json' | 'request_error' | 'not_ready_for_decryption';
  message: string;
  request_id: string;
};

// POST: 400
export type RelayerV2ApiPostError400WithDetails = {
  code: 'missing_fields' | 'validation_failed';
  message: string;
  request_id: string;
  details: Array<RelayerV2PostErrorDetail>;
};

// POST: 400
export type RelayerV2PostErrorDetail = {
  field: string;
  issue: string;
};

// GET:  202
// POST: 202
export type RelayerV2ResponseQueued = {
  status: 'queued';
  result: RelayerV2ResultQueued;
};

// GET: 200
export type RelayerV2GetResponseSucceeded = {
  status: 'succeeded';
  result:
    | RelayerV2ResultPublicDecrypt
    | RelayerV2ResultUserDecrypt
    | RelayerV2ResultInputProof;
};

// GET:  202
// POST: 202
export type RelayerV2ResultQueued = {
  id: string;
  retry_after: Timestamp; // Timestamp
};

// GET: 200
export type RelayerV2ResultPublicDecrypt = {
  // Hex encoded value without 0x prefix.
  decrypted_value: BytesHexNo0x;
  // Hex encoded value without 0x prefix.
  signatures: BytesHexNo0x[];
  extra_data: BytesHex;
};

// GET: 200
export type RelayerV2ResultUserDecrypt = {
  // Hex encoded key without 0x prefix.
  payloads: BytesHexNo0x[];
  // Hex encoded key without 0x prefix. (len=130)
  signatures: BytesHexNo0x[];
};

// GET: 200
export type RelayerV2ResultInputProof =
  | RelayerV2ResultInputProofAcceped
  | RelayerV2ResultInputProofRejected;

// GET: 200
export type RelayerV2ResultInputProofAcceped = {
  accepted: true;
  extra_data: BytesHex;
  // Ordered List of hex encoded handles with 0x prefix.
  handles: Bytes32Hex[];
  // Attestation signatures for Input verification for the ordered list of handles with 0x prefix.
  signatures: BytesHex[];
};

// GET: 200
export type RelayerV2ResultInputProofRejected = {
  accepted: false;
  extra_data: BytesHex;
};

// GET
export type RelayerV2KeyInfo = { fhe_public_key: RelayerV2KeyData };
export type RelayerV2KeyData = { data_id: string; urls: Array<string> };
export type RelayerV2GetResponseKeyUrl = {
  response: {
    fhe_key_info: Array<RelayerV2KeyInfo>;
    crs: Record<string, RelayerV2KeyData>;
  };
};
