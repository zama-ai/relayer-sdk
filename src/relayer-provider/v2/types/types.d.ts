////////////////////////////////////////////////////////////////////////////////
// V2
////////////////////////////////////////////////////////////////////////////////

import { Bytes32Hex, BytesHex, BytesHexNo0x } from 'src/utils/bytes';

// RelayerV2<Response|GetResponse|PostResponse><QueuedOrFailed|Succeeded>

// GET:  200 | 202 | 404 | 500 | 503 | 504
// POST: 202 | 400 | 429 | 500 | 503

// Notes on 504
// ============
//
// 1. We use 504 when we want to say readiness check timed out or response timedout.
//    In this case, user can make a fresh post request and start another job.
//
// Notes on 503
// ============
//
// 2. This is to deal with protocol pausing. If protocol is paused, we cannot do any operations.
//    So, event POST (paused when making a request) or GET (paused while processing a request).
//    We treat this specially becasue, at this point, relayer cannot do anything.
//    User has to be informed and waits for information from external world that protocol has been unpaused.
//
// 3. As an improvement, to the above point we could provide protocol pause status in a status endpoint (for user).
//

// Readiness (400)
// 1. ACL check not propagated
// 2. S3 upload not completed
// 3. 1 & 2
// 4. Ciphertext is garbage

// GMT time stamp RFC 7231 timestamp indicating when client should retry (e.g. "Wed, 21 Oct 2015 07:28:00 GMT")
export type Timestamp = string;

// POST : 202 (queued) | 400 | 429 | 500 | 503
export type RelayerV2PostResponse = RelayerV2ResponseQueuedOrFailed;

// GET:  200 | 202 | 404 | 500 | 503 | 504
export type RelayerV2GetResponse =
  | RelayerV2ResponseQueuedOrFailed
  | RelayerV2GetResponseSucceeded;

// GET:  202 (queued) | 400 | 500 | 503 | 504
// POST: 202 (queued) | 400 | 429 | 500 | 503
export type RelayerV2ResponseQueuedOrFailed =
  | RelayerV2ResponseFailed
  | RelayerV2ResponseQueued;

// GET : 404 | 500 | 503 | 504
// POST: 400 | 429 | 500 | 503
export type RelayerV2ResponseFailed = {
  status: 'failed';
  request_id?: string; // Optional request id field. Would be empty in case of 429 from Cloudflare/Kong. In other cases, use it for identifying the request and asking support
  error: RelayerV2ApiError;
};

// https://github.com/zama-ai/console/blob/1d74c413760690d9ad4350e283f609242159331e/apps/relayer/src/http/utils.rs#L626
export type RelayerV2ApiError =
  | RelayerV2ApiError400
  | RelayerV2ApiPostError429
  | RelayerV2ApiError500
  | RelayerV2ApiError503
  | RelayerV2ApiGetError504;

// GET:  500
// POST: 500
export type RelayerV2ApiError500 = {
  label: 'internal_server_error';
  message: string;
};

// GET:  503
// POST: 503
export type RelayerV2ApiError503 = {
  label: 'protocol_paused' | 'gateway_not_reachable';
  message: string;
};

// GET:  504
export type RelayerV2ApiGetError504 = {
  label: 'readiness_check_timedout' | 'response_timedout';
  message: string;
};

// Note: 429 will use only the following headers
// Retry-After in duration seconds. Since this value is populated by the rate
// limiting element (Cloudflare, Kong, Relayer), it will always be an up to date
// value.
// Makes it simpler and avoids issues with clock skew between client and server.
// POST: 429
// The body will be  still contain status=failed, and error field with a label and message
export type RelayerV2ApiPostError429 = {
  label: 'rate_limited';
  message: string;
  // RFC 7231 timestamp indicating when client should retry (e.g. "Wed, 21 Oct 2015 07:28:00 GMT").
  // Uses absolute timestamp instead of relative seconds for cache-safety.
  // retry_after is only used in the case of Rate limit errors.
  // example = "Thu, 14 Nov 2024 15:30:00 GMT"
  // retry_after: Timestamp;
};

// GET : 400
// POST: 400
export type RelayerV2ApiError400 =
  | RelayerV2ApiError400NoDetails
  | RelayerV2ApiError400WithDetails;

// GET : 400
// POST: 400
export type RelayerV2ApiError400NoDetails = {
  label: 'malformed_json' | 'request_error' | 'not_ready_for_decryption';
  message: string;
};

// GET : 400 (jobId format invalid)
// POST: 400
export type RelayerV2ApiError400WithDetails = {
  label: 'missing_fields' | 'validation_failed';
  message: string;
  details: Array<RelayerV2PostErrorDetail>;
};

// GET : 400
// POST: 400
export type RelayerV2PostErrorDetail = {
  field: string;
  issue: string;
};

// GET:  202
// POST: 202
export type RelayerV2ResponseQueued = {
  status: 'queued';
  request_id: string; // request id field. use it for identifying the request and asking support
  result: RelayerV2ResultQueued;
};

// GET: 200
export type RelayerV2GetResponseSucceeded = {
  status: 'succeeded';
  request_id: string; // request id field. use it for identifying the request and asking support
  result:
    | RelayerV2ResultPublicDecrypt
    | RelayerV2ResultUserDecrypt
    | RelayerV2ResultInputProof;
};

// GET:  202
// POST: 202
// We change the strategy to use absolute duration here (to again not be affected by clock skew.)
// For, we will not cache it.
// Later, even if we decide to cache, we can use the Age and Max field inj cache headers to decide on the staleness of the response
export type RelayerV2ResultQueued = {
  job_id: string;
  retry_after_seconds: number;
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
