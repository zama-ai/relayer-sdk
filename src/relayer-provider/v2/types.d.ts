////////////////////////////////////////////////////////////////////////////////
// V2
////////////////////////////////////////////////////////////////////////////////

import type {
  RelayerApiErrorType,
  RelayerFailureStatus,
  RelayerInputProofResult,
  RelayerPublicDecryptResult,
  RelayerSuccessStatus,
  RelayerUserDecryptResult,
} from '../types/public-api';
import type { BytesHex } from '@base/types/primitives';
import type { Flavor, NonEmptyExtract, Prettify } from '@base/types/utils';

// RelayerV2<Response|GetResponse|PostResponse><QueuedOrFailed|Succeeded>

// Notes on 503
// ============
//
// 1. We use 503 when we want to say readiness check timed out or response timedout.
//    In this case, user can make a fresh post request and start another job.
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

// GET:  202 | 400 | 401 | 429 | 500 | 503
export type RelayerV2PostResponseStatus =
  | NonEmptyExtract<RelayerSuccessStatus, 202>
  | NonEmptyExtract<RelayerFailureStatus, 400 | 401 | 429 | 500 | 503>;
export type RelayerV2PostResponse =
  | RelayerV2ResponseFailed
  | RelayerV2PostResponseQueued;

// Local map to avoid circular dependency with public-api.d.ts
interface RelayerV2ResultMap {
  INPUT_PROOF: RelayerV2ResultInputProof;
  PUBLIC_DECRYPT: RelayerV2ResultPublicDecrypt;
  USER_DECRYPT: RelayerV2ResultUserDecrypt;
  DELEGATED_USER_DECRYPT: RelayerV2ResultUserDecrypt;
}

// GET:  200 | 202 | 400 | 401 | 404 | 500 | 503
export type RelayerV2GetResponseStatus =
  | NonEmptyExtract<RelayerSuccessStatus, 200 | 202>
  | NonEmptyExtract<RelayerFailureStatus, 400 | 401 | 404 | 500 | 503>;
export type RelayerV2GetResponse<
  R extends RelayerV2ResultMap[keyof RelayerV2ResultMap],
> =
  | RelayerV2ResponseFailed
  | RelayerV2GetResponseQueued
  | RelayerV2GetResponseSucceeded<R>;

////////////////////////////////////////////////////////////////////////////////
// Failed & Errors
////////////////////////////////////////////////////////////////////////////////

export type RelayerV2ResponseFailed = {
  status: 'failed';
  requestId?: string; // Optional request id field. Would be empty in case of 429 from Cloudflare/Kong. In other cases, use it for identifying the request and asking support
  error: RelayerApiErrorType;
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
  R extends RelayerV2ResultMap[keyof RelayerV2ResultMap],
> = {
  status: 'succeeded';
  requestId: string; // request id field. use it for identifying the request and asking support
  result: R;
};

export type RelayerV2GetResponseSucceededMap = {
  [K in keyof RelayerV2ResultMap]: RelayerV2GetResponseSucceeded<
    RelayerV2ResultMap[K]
  >;
};

export type RelayerV2GetResponseInputProofSucceeded = Prettify<
  RelayerV2GetResponseSucceededMap['INPUT_PROOF']
>;
export type RelayerV2GetResponsePublicDecryptSucceeded = Prettify<
  RelayerV2GetResponseSucceededMap['PUBLIC_DECRYPT']
>;
export type RelayerV2GetResponseUserDecryptSucceeded = Prettify<
  RelayerV2GetResponseSucceededMap['USER_DECRYPT']
>;

export type RelayerV2ResultPublicDecrypt = Flavor<
  RelayerPublicDecryptResult,
  'v2'
>;
export type RelayerV2ResultUserDecrypt = Flavor<
  {
    result: RelayerUserDecryptResult;
  },
  'v2'
>;

export type RelayerV2ResultInputProof =
  | RelayerV2ResultInputProofAccepted
  | RelayerV2ResultInputProofRejected;

export type RelayerV2ResultInputProofAccepted = Flavor<
  Prettify<
    {
      accepted: true;
      extraData: BytesHex;
    } & RelayerInputProofResult
  >,
  'v2'
>;

export type RelayerV2ResultInputProofRejected = Flavor<
  {
    accepted: false;
    extraData: BytesHex;
  },
  'v2'
>;
