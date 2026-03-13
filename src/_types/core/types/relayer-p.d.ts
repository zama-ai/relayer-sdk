import type { Bytes32Hex, Bytes65Hex, Bytes65HexNo0x, BytesHex, BytesHexNo0x, ChecksummedAddress } from "./primitives.js";
import type { NonEmptyExtract } from "./utils.js";
import type { FetchInputProofResult, FetchPublicDecryptResult, FetchUserDecryptResult } from "./relayer.js";
import type { FhevmHandleBytes32Hex } from "./fhevmHandle.js";
export interface FetchPostOperationResultMap {
    INPUT_PROOF: FetchInputProofResult;
    PUBLIC_DECRYPT: FetchPublicDecryptResult;
    USER_DECRYPT: FetchUserDecryptResult;
    DELEGATED_USER_DECRYPT: FetchUserDecryptResult;
}
export type RelayerGetOperation = "KEY_URL";
export type RelayerPostOperation = keyof FetchPostOperationResultMap;
export type RelayerOperation = RelayerPostOperation | RelayerGetOperation;
export type FetchInputProofPayload = {
    readonly contractChainId: `0x${string}`;
    readonly contractAddress: ChecksummedAddress;
    readonly userAddress: ChecksummedAddress;
    readonly ciphertextWithInputVerification: BytesHexNo0x;
    readonly extraData: BytesHex;
};
export type RelayerFetchPublicDecryptPayload = {
    readonly ciphertextHandles: readonly BytesHex[];
    readonly extraData: BytesHex;
};
export type HandleContractPair = {
    readonly handle: FhevmHandleBytes32Hex;
    readonly contractAddress: ChecksummedAddress;
};
export type FetchUserDecryptPayload = {
    readonly handleContractPairs: readonly HandleContractPair[];
    readonly requestValidity: {
        readonly startTimestamp: string;
        readonly durationDays: string;
    };
    readonly contractsChainId: string;
    readonly contractAddresses: readonly ChecksummedAddress[];
    readonly userAddress: ChecksummedAddress;
    readonly signature: Bytes65HexNo0x;
    readonly publicKey: BytesHexNo0x;
    readonly extraData: BytesHex;
};
export type FetchDelegatedUserDecryptPayload = {
    readonly handleContractPairs: readonly HandleContractPair[];
    readonly contractsChainId: string;
    readonly contractAddresses: readonly ChecksummedAddress[];
    readonly delegatorAddress: ChecksummedAddress;
    readonly delegateAddress: ChecksummedAddress;
    readonly startTimestamp: string;
    readonly durationDays: string;
    readonly signature: Bytes65HexNo0x;
    readonly publicKey: BytesHexNo0x;
    readonly extraData: BytesHex;
};
export type RelayerAsyncRequestState = {
    aborted: boolean;
    canceled: boolean;
    failed: boolean;
    fetching: boolean;
    running: boolean;
    succeeded: boolean;
    terminated: boolean;
    timeout: boolean;
};
export type RelayerTerminateReason = "succeeded" | "failed" | "timeout" | "abort";
export type RelayerFetchMethod = "GET" | "POST";
export type RelayerSuccessStatus = 200 | 202;
export type RelayerFailureStatus = 400 | 401 | 404 | 429 | 500 | 503;
export type RelayerPostResponseStatus = NonEmptyExtract<RelayerSuccessStatus, 202> | NonEmptyExtract<RelayerFailureStatus, 400 | 401 | 429 | 500 | 503>;
export type RelayerGetResponseStatus = NonEmptyExtract<RelayerSuccessStatus, 200 | 202> | NonEmptyExtract<RelayerFailureStatus, 400 | 401 | 404 | 500 | 503>;
export interface RelayerGetResponse200Map {
    INPUT_PROOF: RelayerResult200InputProofAccepted | RelayerResult200InputProofRejected;
    PUBLIC_DECRYPT: RelayerResult200PublicDecrypt;
    USER_DECRYPT: RelayerResult200UserDecrypt;
}
export type RelayerGetResponse200<A extends keyof RelayerGetResponse200Map> = {
    status: "succeeded";
    requestId: string;
    result: RelayerGetResponse200Map[A];
};
export type RelayerResult200InputProofAccepted = {
    accepted: true;
    extraData: BytesHex;
    handles: Bytes32Hex[];
    signatures: Bytes65Hex[];
};
export type RelayerResult200InputProofRejected = {
    accepted: false;
    extraData: BytesHex;
};
export type RelayerResult200PublicDecrypt = {
    signatures: BytesHexNo0x[];
    decryptedValue: BytesHexNo0x;
    extraData: BytesHex;
};
export type RelayerResult200UserDecrypt = {
    result: Array<{
        payload: BytesHexNo0x;
        signature: Bytes65HexNo0x;
    }>;
};
/**
 * Relayer 200 response for input proof requests:
 * ```json
 * {
 *   "status": "succeeded",
 *   "requestId": "string",
 *   "result": {
 *     "accepted": true,
 *     "extraData": "0x...",
 *     "handles": ["0x..."],
 *     "signatures": ["0x..."]
 *   } | {
 *     "accepted": false,
 *     "extraData": "0x..."
 *   }
 * }
 * ```
 */
export type RelayerInputProofSucceeded = RelayerGetResponse200<"INPUT_PROOF">;
/**
 * Relayer 200 response for public decrypt requests:
 * ```json
 * {
 *   "status": "succeeded",
 *   "requestId": "string",
 *   "result": {
 *     "signatures": ["hexNo0x..."],
 *     "decryptedValue": "hexNo0x...",
 *     "extraData": "0x..."
 *   }
 * }
 * ```
 */
export type RelayerPublicDecryptSucceeded = RelayerGetResponse200<"PUBLIC_DECRYPT">;
/**
 * Relayer 200 response for user decrypt requests:
 * ```json
 * {
 *   "status": "succeeded",
 *   "requestId": "string",
 *   "result": {
 *     "result": [{
 *       "payload": "hexNo0x...",
 *       "signature": "hexNo0x...",
 *       "extraData": "hex_or_hexNo0x_?..."
 *     }]
 *   }
 * }
 * ```
 */
export type RelayerUserDecryptSucceeded = RelayerGetResponse200<"USER_DECRYPT">;
/**
 * Relayer 202 get response schema:
 * ```json
 * {
 *   "result": {
 *     "status": "queued",
 *     "requestId": "string",
 *   }
 * }
 * ```
 */
export type RelayerGetResponse202Queued = {
    status: "queued";
    requestId: string;
};
/**
 * Relayer 202 post response schema:
 * ```json
 * {
 *   "result": {
 *     "status": "queued",
 *     "requestId": "string",
 *     "result": {
 *        jobId: "string",
 *      }
 *   }
 * }
 * ```
 */
export type RelayerPostResponse202Queued = {
    status: "queued";
    requestId: string;
    result: RelayerResult202Queued;
};
export type RelayerResult202Queued = {
    jobId: string;
};
/**
 * Optional request id field. Would be empty in case of 429 from Cloudflare/Kong.
 * In other cases, use it for identifying the request and asking support
 */
export type RelayerResponseFailed = {
    status: "failed";
    requestId?: string;
    error: RelayerApiError;
};
export type RelayerApiError = RelayerApiError400 | RelayerApiError401 | RelayerApiError404 | RelayerApiError429 | RelayerApiError500 | RelayerApiError503;
/**
 * Status: 400
 */
export type RelayerApiError400 = RelayerApiError400NoDetails | RelayerApiError400WithDetails;
/**
 * Status: 400 (no details)
 */
export type RelayerApiError400NoDetails = {
    label: "malformed_json" | "request_error" | "not_ready_for_decryption";
    message: string;
};
/**
 * Status: 400 (with details)
 */
export type RelayerApiError400WithDetails = {
    label: "missing_fields" | "validation_failed";
    message: string;
    details: RelayerErrorDetail[];
};
export type RelayerErrorDetail = {
    field: string;
    issue: string;
};
/**
 * Status: 401
 */
export type RelayerApiError401 = {
    label: "unauthorized";
    message: string;
};
/**
 * Status: 404
 */
export type RelayerApiError404 = {
    label: "not_found";
    message: string;
};
/**
 * Status: 429
 */
export type RelayerApiError429 = {
    label: "rate_limited" | "protocol_overload";
    message: string;
};
/**
 * Status: 500
 */
export type RelayerApiError500 = {
    label: "internal_server_error";
    message: string;
};
/**
 * Status: 503
 */
export type RelayerApiError503 = {
    label: "protocol_paused" | "gateway_not_reachable" | "readiness_check_timed_out" | "response_timed_out";
    message: string;
};
export type FetchKeyUrlResult = {
    readonly fheKeyInfo: [
        {
            readonly fhePublicKey: {
                readonly dataId: string;
                readonly urls: readonly [string];
            };
        }
    ];
    readonly crs: {
        readonly 2048: {
            readonly dataId: string;
            readonly urls: readonly [string];
        };
    };
};
/**
 * Parameters for fetching TFHE resources with retry support.
 */
export type TfheFetchParams = {
    /** Optional fetch init options (headers, signal, etc.) */
    init?: RequestInit | undefined;
    /** Number of retry attempts on network failure (default: 3) */
    retries?: number | undefined;
    /** Delay in milliseconds between retries (default: 1000) */
    retryDelayMs?: number | undefined;
};
//# sourceMappingURL=relayer-p.d.ts.map