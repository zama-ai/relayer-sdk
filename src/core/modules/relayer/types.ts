import type {
  RelayerDelegatedUserDecryptOptions,
  RelayerInputProofOptions,
  RelayerKeyUrlOptions,
  RelayerPublicDecryptOptions,
  RelayerUserDecryptOptions,
} from "../../types/relayer.js";
import type { FhevmHandle } from "../../types/fhevmHandle.js";
import type {
  GlobalFhePkeParamsBytes,
  GlobalFhePkeParamsSource,
} from "../../types/globalFhePkeParams.js";
import type { KmsSigncryptedShare } from "../../types/kms-p.js";
import type {
  KmsDelegatedUserDecryptEIP712Message,
  KmsUserDecryptEIP712Message,
} from "../../types/kms.js";
import type {
  Bytes65Hex,
  BytesHex,
  ChecksummedAddress,
} from "../../types/primitives.js";
import type { Prettify } from "../../types/utils.js";
import type { ZkProof } from "../../types/zkProof.js";

////////////////////////////////////////////////////////////////////////////////
//
// RelayerModule
//
////////////////////////////////////////////////////////////////////////////////

export type RelayerClient = { readonly relayerUrl: string };

////////////////////////////////////////////////////////////////////////////////
// 1.1 fetchGlobalFhePkeParamsSource
////////////////////////////////////////////////////////////////////////////////

export type FetchGlobalFhePkeParamsSourceParameters = {
  readonly options?: RelayerKeyUrlOptions | undefined;
};

export type FetchGlobalFhePkeParamsSourceReturnType = GlobalFhePkeParamsSource;

export type FetchGlobalFhePkeParamsSourceModuleFunction = {
  fetchGlobalFhePkeParamsSource(
    relayerClient: RelayerClient,
    parameters: FetchGlobalFhePkeParamsSourceParameters,
  ): Promise<FetchGlobalFhePkeParamsSourceReturnType>;
};

////////////////////////////////////////////////////////////////////////////////
// 1.2 fetchGlobalFhePkeParams
////////////////////////////////////////////////////////////////////////////////

export type FetchGlobalFhePkeParamsBytesParameters = {
  readonly options?: RelayerKeyUrlOptions | undefined;
};

export type FetchGlobalFhePkeParamsBytesReturnType = GlobalFhePkeParamsBytes;

export type FetchGlobalFhePkeParamsBytesModuleFunction = {
  fetchGlobalFhePkeParamsBytes(
    relayerClient: RelayerClient,
    parameters: FetchGlobalFhePkeParamsBytesParameters,
  ): Promise<FetchGlobalFhePkeParamsBytesReturnType>;
};

////////////////////////////////////////////////////////////////////////////////
// 2. fetchCoprocessorSignatures
////////////////////////////////////////////////////////////////////////////////

export type FetchCoprocessorSignaturesParameters = {
  readonly payload: {
    readonly zkProof: ZkProof;
    readonly extraData: BytesHex;
  };
  readonly options?: RelayerInputProofOptions | undefined;
};

export type FetchCoprocessorSignaturesReturnType = {
  readonly handles: readonly FhevmHandle[];
  readonly coprocessorEIP712Signatures: readonly Bytes65Hex[];
  readonly extraData: BytesHex;
};

export type FetchCoprocessorSignaturesModuleFunction = {
  fetchCoprocessorSignatures(
    relayerClient: RelayerClient,
    parameters: FetchCoprocessorSignaturesParameters,
  ): Promise<FetchCoprocessorSignaturesReturnType>;
};

////////////////////////////////////////////////////////////////////////////////
// 3. fetchPublicDecrypt
////////////////////////////////////////////////////////////////////////////////

export type FetchPublicDecryptParameters = {
  readonly payload: {
    readonly orderedHandles: readonly FhevmHandle[];
    readonly extraData: BytesHex;
  };
  readonly options?: RelayerPublicDecryptOptions | undefined;
};

export type FetchPublicDecryptReturnType = {
  readonly orderedAbiEncodedClearValues: BytesHex;
  readonly kmsPublicDecryptEIP712Signatures: Bytes65Hex[];
};

export type FetchPublicDecryptModuleFunction = {
  fetchPublicDecrypt(
    relayerClient: RelayerClient,
    parameters: FetchPublicDecryptParameters,
  ): Promise<FetchPublicDecryptReturnType>;
};

////////////////////////////////////////////////////////////////////////////////
// 4. fetchUserDecrypt
////////////////////////////////////////////////////////////////////////////////

export type FetchUserDecryptParameters = {
  readonly payload: {
    readonly handleContractPairs: ReadonlyArray<{
      readonly handle: FhevmHandle;
      readonly contractAddress: ChecksummedAddress;
    }>;
    readonly kmsUserDecryptEIP712Signer: ChecksummedAddress;
    readonly kmsUserDecryptEIP712Message: KmsUserDecryptEIP712Message;
    readonly kmsUserDecryptEIP712Signature: Bytes65Hex;
  };
  readonly options?: RelayerUserDecryptOptions | undefined;
};

export type FetchUserDecryptReturnType = readonly KmsSigncryptedShare[];

export type FetchUserDecryptModuleFunction = {
  fetchUserDecrypt(
    relayerClient: RelayerClient,
    parameters: FetchUserDecryptParameters,
  ): Promise<FetchUserDecryptReturnType>;
};

////////////////////////////////////////////////////////////////////////////////
// 5. fetchDelegatedUserDecrypt
////////////////////////////////////////////////////////////////////////////////

export type FetchDelegatedUserDecryptParameters = {
  readonly payload: {
    readonly handleContractPairs: ReadonlyArray<{
      readonly handle: FhevmHandle;
      readonly contractAddress: ChecksummedAddress;
    }>;
    readonly kmsDelegatedUserDecryptEIP712Signer: ChecksummedAddress;
    readonly kmsDelegatedUserDecryptEIP712Message: KmsDelegatedUserDecryptEIP712Message;
    readonly kmsDelegatedUserDecryptEIP712Signature: Bytes65Hex;
  };
  readonly options?: RelayerDelegatedUserDecryptOptions | undefined;
};

export type FetchDelegatedUserDecryptReturnType =
  readonly KmsSigncryptedShare[];

export type FetchDelegatedUserDecryptModuleFunction = {
  fetchDelegatedUserDecrypt(
    relayerClient: RelayerClient,
    parameters: FetchDelegatedUserDecryptParameters,
  ): Promise<FetchDelegatedUserDecryptReturnType>;
};

////////////////////////////////////////////////////////////////////////////////
// RelayerModule
////////////////////////////////////////////////////////////////////////////////

export type RelayerModule = Prettify<
  FetchGlobalFhePkeParamsSourceModuleFunction &
    FetchGlobalFhePkeParamsBytesModuleFunction &
    FetchCoprocessorSignaturesModuleFunction &
    FetchUserDecryptModuleFunction &
    FetchPublicDecryptModuleFunction &
    FetchDelegatedUserDecryptModuleFunction
>;

// Relayer is a base module. It does not take any runtime argument
export type RelayerModuleFactory = () => {
  readonly relayer: RelayerModule;
};

export type WithRelayerModule = {
  readonly relayer: RelayerModule;
};
