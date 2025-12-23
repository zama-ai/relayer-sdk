////////////////////////////////////////////////////////////////////////////////
// V2
////////////////////////////////////////////////////////////////////////////////

import type {
  RelayerPostOperation,
  FhevmInstanceOptions,
} from '../../../types/relayer';
import type {
  BytesHex,
  BytesHexNo0x,
  Bytes32Hex,
} from '../../../types/primitives';

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
export type RelayerV2PostResponse =
  | RelayerV2ResponseFailed
  | RelayerV2PostResponseQueued;

// GET:  200 | 202 | 400 | 404 | 500 | 503 | 504
export type RelayerV2GetResponseStatus =
  | 200
  | 202
  | 400
  | 404
  | 500
  | 503
  | 504;
export type RelayerV2GetResponse =
  | RelayerV2ResponseFailed
  | RelayerV2GetResponseQueued
  | RelayerV2GetResponseSucceeded;

////////////////////////////////////////////////////////////////////////////////
// Failed & Errors
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2ResponseFailed = {
  status: 'failed';
  requestId?: string; // Optional request id field. Would be empty in case of 429 from Cloudflare/Kong. In other cases, use it for identifying the request and asking support
  error: RelayerV2ResponseApiErrorCode;
};

export type RelayerV2ResponseApiErrorCode =
  | RelayerV2ResponseApiError400
  | RelayerV2ResponseApiError404
  | RelayerV2ResponseApiError429
  | RelayerV2ResponseApiError500
  | RelayerV2ResponseApiError503
  | RelayerV2ResponseApiError504;

export type RelayerV2ResponseApiError500 = {
  label: 'internal_server_error';
  message: string;
};

export type RelayerV2ResponseApiError503 = {
  label: 'protocol_paused' | 'gateway_not_reachable';
  message: string;
};

// 'readiness_check_timedout' is only for decrypt endpoints (user-decrypt, public-decrypt).
export type RelayerV2ResponseApiError504 = {
  label: 'readiness_check_timedout' | 'response_timedout';
  message: string;
};

// Note: 429 will use only the following headers
// Retry-After in duration seconds. Since this value is populated by the rate
// limiting element (Cloudflare, Kong, Relayer), it will always be an up to date
// value.
// Makes it simpler and avoids issues with clock skew between client and server.
export type RelayerV2ResponseApiError429 = {
  label: 'rate_limited';
  message: string;
};

export type RelayerV2ResponseApiError400 =
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

export type RelayerV2ResponseApiError404 = {
  label: 'not_found';
  message: string;
  details: Array<RelayerV2ErrorDetail>;
};

////////////////////////////////////////////////////////////////////////////////
// Queued: 202
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2GetResponseQueued = {
  status: 'queued';
  requestId: string; // request id field. use it for identifying the request and asking support
};

export type RelayerV2PostResponseQueued = {
  status: 'queued';
  requestId: string; // request id field. use it for identifying the request and asking support
  result: RelayerV2PostResultQueued;
};

export type RelayerV2PostResultQueued = {
  jobId: string;
};

////////////////////////////////////////////////////////////////////////////////
// Succeeded: 200
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2GetResponseSucceeded<
  R extends RelayerV2PostOperationResult,
> = {
  status: 'succeeded';
  requestId: string; // request id field. use it for identifying the request and asking support
  result: R;
};

export type RelayerV2GetResponseSucceededMap = {
  [K in RelayerPostOperation]: RelayerV2GetResponseSucceeded<
    RelayerV2PostOperationResultMap[K]
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
  decryptedValue: BytesHexNo0x;
  // Hex encoded value without 0x prefix.
  signatures: BytesHexNo0x[];
  extraData: BytesHex;
};

export type RelayerV2ResultUserDecrypt = {
  result: Array<{
    // Hex encoded key without 0x prefix.
    payload: BytesHexNo0x;
    // Hex encoded key without 0x prefix. (len=130)
    signature: BytesHexNo0x;
    //extraData: BytesHex;
  }>;
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
  extraData: BytesHex;
};

export type RelayerV2ResultInputProofRejected = {
  accepted: false;
  extraData: BytesHex;
};

////////////////////////////////////////////////////////////////////////////////
// KeyUrl
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2KeyInfo = { fhePublicKey: RelayerV2KeyData };
export type RelayerV2KeyData = { dataId: string; urls: Array<string> };
export type RelayerV2GetResponseKeyUrl = {
  response: {
    fheKeyInfo: Array<RelayerV2KeyInfo>;
    crs: Record<string, RelayerV2KeyData>;
  };
};

////////////////////////////////////////////////////////////////////////////////

export type RelayerV2PostOperationResult =
  | RelayerV2PostOperationResultMap['INPUT_PROOF']
  | RelayerV2PostOperationResultMap['PUBLIC_DECRYPT']
  | RelayerV2PostOperationResultMap['USER_DECRYPT'];

export interface RelayerV2PostOperationResultMap {
  INPUT_PROOF: RelayerV2ResultInputProof;
  PUBLIC_DECRYPT: RelayerV2ResultPublicDecrypt;
  USER_DECRYPT: RelayerV2ResultUserDecrypt;
}

////////////////////////////////////////////////////////////////////////////////
// Progress
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2ProgressQueued = {
  type: 'queued';
  url: string;
  method: 'POST' | 'GET';
  status: 202;
  jobId: string;
  operation: RelayerPostOperation;
  requestId: string;
  retryAfterMs: number;
  retryCount: number;
  elapsed: number;
};

export type RelayerV2ProgressRateLimited = {
  type: 'ratelimited';
  url: string;
  method: 'POST';
  status: 429;
  retryAfterMs: number;
  retryCount: number;
  elapsed: number;
  relayerApiError: RelayerV2ResponseApiError429;
};

export type RelayerV2ProgressSucceeded<O extends RelayerPostOperation> = {
  type: 'succeeded';
  url: string;
  method: 'GET';
  status: 200;
  jobId: string;
  requestId: string;
  retryCount: number;
  elapsed: number;
  operation: O;
  result: RelayerV2PostOperationResultMap[O];
};

export type RelayerV2ProgressPublicDecryptSucceeded =
  RelayerV2ProgressSucceeded<'PUBLIC_DECRYPT'>;
export type RelayerV2ProgressUserDecryptSucceeded =
  RelayerV2ProgressSucceeded<'USER_DECRYPT'>;
export type RelayerV2ProgressInputProofSucceeded =
  RelayerV2ProgressSucceeded<'INPUT_PROOF'>;

export type RelayerV2ProgressArgs =
  | RelayerV2PublicDecryptProgressArgs
  | RelayerV2UserDecryptProgressArgs
  | RelayerV2InputProofProgressArgs;

export type RelayerV2PublicDecryptProgressArgs =
  | RelayerV2ProgressQueued
  | RelayerV2ProgressRateLimited
  | RelayerV2ProgressPublicDecryptSucceeded
  | RelayerV2ProgressTimeout
  | RelayerV2ProgressAbort
  | RelayerV2ProgressFailed;

export type RelayerV2UserDecryptProgressArgs =
  | RelayerV2ProgressQueued
  | RelayerV2ProgressRateLimited
  | RelayerV2ProgressPublicDecryptSucceeded
  | RelayerV2ProgressTimeout
  | RelayerV2ProgressAbort
  | RelayerV2ProgressFailed;

export type RelayerV2InputProofProgressArgs =
  | RelayerV2ProgressQueued
  | RelayerV2ProgressRateLimited
  | RelayerV2ProgressPublicDecryptSucceeded
  | RelayerV2ProgressTimeout
  | RelayerV2ProgressAbort
  | RelayerV2ProgressFailed;

export type RelayerV2ProgressFailureStatus = 400 | 404 | 500 | 503 | 504;

export type RelayerV2ProgressFailed = {
  type: 'failed';
  url: string;
  method: 'GET' | 'POST';
  status: RelayerV2ProgressFailureStatus;
  jobId?: string;
  retryCount: number;
  elapsed: number;
  operation: RelayerPostOperation;
  relayerApiError: RelayerV2ResponseApiErrorCode;
};

export type RelayerV2ProgressTimeout = {
  type: 'timeout';
  url: string;
  jobId?: string;
  retryCount: number;
  operation: RelayerPostOperation;
};

export type RelayerV2ProgressAbort = {
  type: 'abort';
  url: string;
  jobId?: string;
  retryCount: number;
  operation: RelayerPostOperation;
};

export type RelayerV2InputProofOptions = FhevmInstanceOptions & {
  signal?: AbortSignal;
  onProgress?: (args: RelayerV2InputProofProgressArgs) => void;
};
export type RelayerV2UserDecryptOptions = FhevmInstanceOptions & {
  signal?: AbortSignal;
  onProgress?: (args: RelayerV2UserDecryptProgressArgs) => void;
};
export type RelayerV2PublicDecryptOptions = FhevmInstanceOptions & {
  signal?: AbortSignal;
  onProgress?: (args: RelayerV2PublicDecryptProgressArgs) => void;
};
