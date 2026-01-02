import type {
  Bytes32Hex,
  BytesHex,
  BytesHexNo0x,
  EncryptionBits,
} from '@base/types/primitives';
import type { Prettify } from '@base/types/utils';
import type { FhevmInstanceOptions } from '../../types/relayer';

////////////////////////////////////////////////////////////////////////////////

export type RelayerEncryptedInput = {
  addBool: (value: boolean | number | bigint) => RelayerEncryptedInput;
  add8: (value: number | bigint) => RelayerEncryptedInput;
  add16: (value: number | bigint) => RelayerEncryptedInput;
  add32: (value: number | bigint) => RelayerEncryptedInput;
  add64: (value: number | bigint) => RelayerEncryptedInput;
  add128: (value: number | bigint) => RelayerEncryptedInput;
  add256: (value: number | bigint) => RelayerEncryptedInput;
  addAddress: (value: string) => RelayerEncryptedInput;
  getBits: () => EncryptionBits[];
  generateZKProof(): {
    readonly chainId: bigint;
    readonly aclContractAddress: `0x${string}`;
    readonly contractAddress: `0x${string}`;
    readonly userAddress: `0x${string}`;
    readonly ciphertextWithZKProof: Uint8Array | string;
    readonly encryptionBits: readonly EncryptionBits[];
  };
  encrypt: (options?: RelayerInputProofOptionsType) => Promise<{
    handles: Uint8Array[];
    inputProof: Uint8Array;
  }>;
};

////////////////////////////////////////////////////////////////////////////////

export interface RelayerPostOperationResultMap {
  INPUT_PROOF: RelayerInputProofResult;
  PUBLIC_DECRYPT: RelayerPublicDecryptResult;
  USER_DECRYPT: RelayerUserDecryptResult;
}

export type RelayerGetOperation = 'KEY_URL';
export type RelayerPostOperation = keyof RelayerPostOperationResultMap;
export type RelayerOperation = RelayerPostOperation | RelayerGetOperation;

export type RelayerPostOperationResult =
  | RelayerPostOperationResultMap['INPUT_PROOF']
  | RelayerPostOperationResultMap['PUBLIC_DECRYPT']
  | RelayerPostOperationResultMap['USER_DECRYPT'];

////////////////////////////////////////////////////////////////////////////////

export type RelayerInputProofOptionsType = Prettify<
  FhevmInstanceOptions & {
    signal?: AbortSignal;
    timeout?: number;
    onProgress?: (args: RelayerInputProofProgressArgs) => void;
  }
>;

export type RelayerUserDecryptOptionsType = Prettify<
  FhevmInstanceOptions & {
    signal?: AbortSignal;
    timeout?: number;
    onProgress?: (args: RelayerUserDecryptProgressArgs) => void;
  }
>;

export type RelayerPublicDecryptOptionsType = Prettify<
  FhevmInstanceOptions & {
    signal?: AbortSignal;
    timeout?: number;
    onProgress?: (args: RelayerPublicDecryptProgressArgs) => void;
  }
>;

export type RelayerFetchMethod = 'GET' | 'POST';
export type RelayerSuccessStatus = 200 | 202;
export type RelayerFailureStatus = 400 | 404 | 429 | 500 | 503;
export type RelayerProgressTypeValue =
  | 'abort'
  | 'queued'
  | 'failed'
  | 'timeout'
  | 'succeeded'
  | 'ratelimited';

export type RelayerProgressArgsType<O extends RelayerPostOperation> =
  | RelayerProgressQueuedType<O>
  | RelayerProgressRateLimitedType<O>
  | RelayerProgressSucceededType<O>
  | RelayerProgressTimeoutType<O>
  | RelayerProgressAbortType<O>
  | RelayerProgressFailedType<O>;

export type RelayerInputProofProgressArgs =
  RelayerProgressArgsType<'INPUT_PROOF'>;
export type RelayerUserDecryptProgressArgs =
  RelayerProgressArgsType<'USER_DECRYPT'>;
export type RelayerPublicDecryptProgressArgs =
  RelayerProgressArgsType<'PUBLIC_DECRYPT'>;

export type RelayerProgressBaseType<
  T extends RelayerProgressTypeValue,
  O extends RelayerPostOperation,
> = {
  type: T;
  url: string;
  method?: 'POST' | 'GET';
  operation: O;
  jobId?: string | undefined;
  retryCount: number;
};

export type RelayerProgressStatusBaseType<
  T extends RelayerProgressTypeValue,
  O extends RelayerPostOperation,
  S extends RelayerSuccessStatus | RelayerFailureStatus,
> = Prettify<
  RelayerProgressBaseType<T, O> & {
    method: 'POST' | 'GET';
    status: S;
  }
>;

export type RelayerProgressJobIdBaseType<
  T extends RelayerProgressTypeValue,
  O extends RelayerPostOperation,
  S extends RelayerSuccessStatus | RelayerFailureStatus,
> = Prettify<
  RelayerProgressStatusBaseType<T, O, S> & {
    jobId: string;
  }
>;

// 202 is GET or POST
export type RelayerProgressQueuedType<O extends RelayerPostOperation> =
  Prettify<
    RelayerProgressJobIdBaseType<'queued', O, 202> & {
      requestId: string;
      retryAfterMs: number;
      elapsed: number;
    }
  >;

export type RelayerProgressRateLimitedType<O extends RelayerPostOperation> =
  Prettify<
    RelayerProgressStatusBaseType<'ratelimited', O, 429> & {
      method: 'POST';
      // rest
      retryAfterMs: number;
      elapsed: number;
      relayerApiError: RelayerApiError429Type;
    }
  >;

export type RelayerProgressSucceededType<O extends RelayerPostOperation> =
  Prettify<
    RelayerProgressJobIdBaseType<'succeeded', O, 200> & {
      requestId: string;
      elapsed: number;
      result: RelayerPostOperationResultMap[O];
    }
  >;

export type RelayerProgressFailedType<
  O extends RelayerPostOperation,
  S extends RelayerFailureStatus = RelayerFailureStatus,
> = Prettify<
  RelayerProgressStatusBaseType<'failed', O, S> & {
    elapsed: number;
    relayerApiError: RelayerApiErrorType;
  }
>;

export type RelayerProgressTimeoutType<O extends RelayerPostOperation> =
  Prettify<RelayerProgressBaseType<'timeout', O>>;

export type RelayerProgressAbortType<O extends RelayerPostOperation> = Prettify<
  RelayerProgressBaseType<'abort', O>
>;

////////////////////////////////////////////////////////////////////////////////

// https://github.com/zama-ai/fhevm-relayer/blob/96151ef300f787658c5fbaf1b4471263160032d5/src/http/public_decrypt_http_listener.rs#L19
export type RelayerPublicDecryptPayload = {
  ciphertextHandles: Array<`0x${string}`>;
  // Hex encoded bytes with 0x prefix. Default: 0x00
  extraData: `0x${string}`;
};

// https://github.com/zama-ai/fhevm-relayer/blob/96151ef300f787658c5fbaf1b4471263160032d5/src/http/input_http_listener.rs#L17
export type RelayerInputProofPayload = {
  // Hex encoded uint256 string without prefix
  contractChainId: `0x${string}`;
  // Hex encoded address with 0x prefix.
  contractAddress: `0x${string}`;
  // Hex encoded address with 0x prefix.
  userAddress: `0x${string}`;
  // List of hex encoded binary proof without 0x prefix
  ciphertextWithInputVerification: string;
  // Hex encoded bytes with 0x prefix. Default: 0x00
  extraData: `0x${string}`;
};

// https://github.com/zama-ai/fhevm-relayer/blob/96151ef300f787658c5fbaf1b4471263160032d5/src/http/userdecrypt_http_listener.rs#L33
export type HandleContractPairRelayer = {
  // Hex encoded bytes32 with 0x prefix.
  handle: `0x${string}`;
  // Hex encoded address with 0x prefix.
  contractAddress: `0x${string}`;
};

// https://github.com/zama-ai/fhevm-relayer/blob/96151ef300f787658c5fbaf1b4471263160032d5/src/http/userdecrypt_http_listener.rs#L20
export type RelayerUserDecryptPayload = {
  handleContractPairs: HandleContractPairRelayer[];
  requestValidity: {
    // Number as a string
    startTimestamp: string;
    // Number as a string
    durationDays: string;
  };
  // Number as a string
  contractsChainId: string;
  // List of hex encoded addresses with 0x prefix
  contractAddresses: Array<`0x${string}`>;
  // Hex encoded address with 0x prefix.
  userAddress: `0x${string}`;
  // Hex encoded signature without 0x prefix.
  signature: string;
  // Hex encoded key without 0x prefix.
  publicKey: string;
  // Hex encoded bytes with 0x prefix. Default: 0x00
  extraData: `0x${string}`;
};

////////////////////////////////////////////////////////////////////////////////
// Results
////////////////////////////////////////////////////////////////////////////////

export type RelayerPublicDecryptResult = {
  signatures: BytesHexNo0x[];
  decryptedValue: BytesHexNo0x;
  extraData: BytesHex;
};

/*
 * [
 *   {
 *     signature: '69e7e040cab157aa819015b321c012dccb1545ffefd325b359b492653f0347517e28e66c572cdc299e259024329859ff9fcb0096e1ce072af0b6e1ca1fe25ec6',
 *     payload: '0100000029...',
 *     extra_data: '01234...',
 *   }
 * ]
 */
export type RelayerUserDecryptResult = Array<{
  payload: BytesHexNo0x;
  signature: BytesHexNo0x;
  //extraData: BytesHex;
}>;

export type RelayerInputProofResult = {
  // Ordered List of hex encoded handles with 0x prefix.
  handles: Bytes32Hex[];
  // Attestation signatures for Input verification for the ordered list of handles with 0x prefix.
  signatures: BytesHex[];
};

////////////////////////////////////////////////////////////////////////////////
// Errors
////////////////////////////////////////////////////////////////////////////////

export type RelayerApiErrorType =
  | RelayerApiError400Type
  | RelayerApiError404Type
  | RelayerApiError429Type
  | RelayerApiError500Type
  | RelayerApiError503Type;

export type RelayerApiError404Type = {
  label: 'not_found';
  message: string;
  details: RelayerErrorDetailType[];
};

export type RelayerApiError500Type = {
  label: 'internal_server_error';
  message: string;
};

export type RelayerApiError503Type = {
  label:
    | 'protocol_paused'
    | 'gateway_not_reachable'
    | 'readiness_check_timedout'
    | 'response_timedout';
  message: string;
};

export type RelayerApiError429Type = {
  label: 'rate_limited';
  message: string;
};

export type RelayerApiError400Type =
  | RelayerApiError400NoDetailsType
  | RelayerApiError400WithDetailsType;

export type RelayerApiError400NoDetailsType = {
  label: 'malformed_json' | 'request_error' | 'not_ready_for_decryption';
  message: string;
};

export type RelayerApiError400WithDetailsType = {
  label: 'missing_fields' | 'validation_failed';
  message: string;
  details: RelayerErrorDetailType[];
};

export type RelayerErrorDetailType = {
  field: string;
  issue: string;
};
