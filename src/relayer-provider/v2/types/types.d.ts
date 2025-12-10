////////////////////////////////////////////////////////////////////////////////
// V2
////////////////////////////////////////////////////////////////////////////////

import { Bytes32Hex, BytesHex, BytesHexNo0x } from 'src/utils/bytes';

// Do not add KEYURL here!
export type RelayerV2OperationResult =
  | RelayerV2OperationResultMap['INPUT_PROOF']
  | RelayerV2OperationResultMap['PUBLIC_DECRYPT']
  | RelayerV2OperationResultMap['USER_DECRYPT'];

export interface RelayerV2OperationResultMap {
  INPUT_PROOF: RelayerV2ResultInputProof;
  PUBLIC_DECRYPT: RelayerV2ResultPublicDecrypt;
  USER_DECRYPT: RelayerV2ResultUserDecrypt;
}

export type RelayerV2Operation = keyof RelayerV2OperationResultMap;

// RelayerV2<Response|GetResponse|PostResponse><QueuedOrFailed|Succeeded>

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

export type RelayerV2PostResponseStatus = 202 | 400 | 429 | 500 | 503;
export type RelayerV2PostResponse = RelayerV2ResponseQueuedOrFailed;

// GET:  200 | 202 | 404 | 500 | 503 | 504
export type RelayerV2GetResponseStatus = 200 | 202 | 404 | 500 | 503 | 504;
export type RelayerV2GetResponse =
  | RelayerV2ResponseQueuedOrFailed
  | RelayerV2GetResponseSucceeded;

export type RelayerV2ResponseQueuedOrFailed =
  | RelayerV2ResponseFailed
  | RelayerV2ResponseQueued;

////////////////////////////////////////////////////////////////////////////////
// Failed & Errors
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2ResponseFailed = {
  status: 'failed';
  requestId?: string; // Optional request id field. Would be empty in case of 429 from Cloudflare/Kong. In other cases, use it for identifying the request and asking support
  error: RelayerV2ApiError;
};

export type RelayerV2ApiError =
  | RelayerV2ApiError400
  | RelayerV2ApiError404
  | RelayerV2ApiError429
  | RelayerV2ApiError500
  | RelayerV2ApiError503
  | RelayerV2ApiError504;

export type RelayerV2ApiError500 = {
  label: 'internal_server_error';
  message: string;
};

export type RelayerV2ApiError503 = {
  label: 'protocol_paused' | 'gateway_not_reachable';
  message: string;
};

// 'readiness_check_timedout' is only for decrypt endpoints (user-decrypt, public-decrypt).
export type RelayerV2ApiError504 = {
  label: 'readiness_check_timedout' | 'response_timedout';
  message: string;
};

// Note: 429 will use only the following headers
// Retry-After in duration seconds. Since this value is populated by the rate
// limiting element (Cloudflare, Kong, Relayer), it will always be an up to date
// value.
// Makes it simpler and avoids issues with clock skew between client and server.
export type RelayerV2ApiError429 = {
  label: 'rate_limited';
  message: string;
};

export type RelayerV2ApiError400 =
  | RelayerV2ApiError400NoDetails
  | RelayerV2ApiError400WithDetails;

export type RelayerV2ApiError400NoDetails = {
  label: 'malformed_json' | 'request_error' | 'not_ready_for_decryption';
  message: string;
};

export type RelayerV2ApiError400WithDetails = {
  label: 'missing_fields' | 'validation_failed';
  message: string;
  details: Array<RelayerV2ErrorDetail>;
};

export type RelayerV2ErrorDetail = {
  field: string;
  issue: string;
};

export type RelayerV2ApiError404 = {
  label: 'not_found';
  message: string;
  details: Array<RelayerV2ErrorDetail>;
};

////////////////////////////////////////////////////////////////////////////////
// Queued: 202
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2ResponseQueued = {
  status: 'queued';
  request_id: string; // request id field. use it for identifying the request and asking support
  result: RelayerV2ResultQueued;
};

export type RelayerV2ResultQueued = {
  job_id: string;
  retry_after_seconds: number;
};

////////////////////////////////////////////////////////////////////////////////
// Succeeded: 200
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2GetResponseSucceeded<R extends RelayerV2OperationResult> =
  {
    status: 'succeeded';
    request_id: string; // request id field. use it for identifying the request and asking support
    result: R;
  };

export type RelayerV2GetResponseSucceededMap = {
  [K in RelayerV2Operation]: RelayerV2GetResponseSucceeded<
    RelayerV2OperationResultMap[K]
  >;
};

export type RelayerV2GetResponseInputProofSucceeded =
  RelayerV2GetResponseSucceededMap['INPUT_PROOF'];
export type RelayerV2GetResponsePublicDecryptSucceeded =
  RelayerV2GetResponseSucceededMap['PUBLIC_DECRYPT'];
export type RelayerV2GetResponseUserDecryptSucceeded =
  RelayerV2GetResponseSucceededMap['USER_DECRYPT'];

export type RelayerV2ResultPublicDecrypt = {
  // Hex encoded value without 0x prefix.
  decrypted_value: BytesHexNo0x;
  // Hex encoded value without 0x prefix.
  signatures: BytesHexNo0x[];
  extra_data: BytesHex;
};

export type RelayerV2ResultUserDecrypt = {
  // Hex encoded key without 0x prefix.
  payloads: BytesHexNo0x[];
  // Hex encoded key without 0x prefix. (len=130)
  signatures: BytesHexNo0x[];
  extra_data: BytesHex;
};

export type RelayerV2ResultInputProof =
  | RelayerV2ResultInputProofAcceped
  | RelayerV2ResultInputProofRejected;

export type RelayerV2ResultInputProofAcceped = {
  accepted: true;
  // Ordered List of hex encoded handles with 0x prefix.
  handles: Bytes32Hex[];
  // Attestation signatures for Input verification for the ordered list of handles with 0x prefix.
  signatures: BytesHex[];
  extra_data: BytesHex;
};

export type RelayerV2ResultInputProofRejected = {
  accepted: false;
  extra_data: BytesHex;
};

////////////////////////////////////////////////////////////////////////////////
// KeyUrl
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2KeyInfo = { fhe_public_key: RelayerV2KeyData };
export type RelayerV2KeyData = { data_id: string; urls: Array<string> };
export type RelayerV2GetResponseKeyUrl = {
  response: {
    fhe_key_info: Array<RelayerV2KeyInfo>;
    crs: Record<string, RelayerV2KeyData>;
  };
};
