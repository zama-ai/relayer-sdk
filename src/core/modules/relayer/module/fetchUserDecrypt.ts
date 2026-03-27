import { remove0x, removeSuffix } from "../../../base/string.js";
import type { KmsSigncryptedShare } from "../../../types/kms-p.js";
import type {
  Bytes65HexNo0x,
  BytesHexNo0x,
} from "../../../types/primitives.js";
import type { FetchUserDecryptPayload } from "../../../types/relayer-p.js";
import type {
  FetchUserDecryptResult,
  RelayerUserDecryptOptions,
} from "../../../types/relayer.js";
import type {
  FetchUserDecryptParameters,
  FetchUserDecryptReturnType,
  RelayerClient,
} from "../types.js";
import { RelayerAsyncRequest } from "./RelayerAsyncRequest.js";

//////////////////////////////////////////////////////////////////////////////
// fetchUserDecrypt
//////////////////////////////////////////////////////////////////////////////

export async function fetchUserDecrypt(
  relayerClient: RelayerClient,
  parameters: FetchUserDecryptParameters,
): Promise<FetchUserDecryptReturnType> {
  const { options, payload } = parameters;
  const relayerOptions: RelayerUserDecryptOptions | undefined = options;

  const firstHandleContractPair = payload.handleContractPairs[0];
  if (firstHandleContractPair === undefined) {
    throw new Error("Empty handle contract pairs");
  }

  // retreive chainId using handles
  const contractsChainId = firstHandleContractPair.handle.chainId.toString();

  const userDecryptPayload: FetchUserDecryptPayload = {
    handleContractPairs: payload.handleContractPairs.map((pair) => {
      return {
        handle: pair.handle.bytes32Hex,
        contractAddress: pair.contractAddress,
      };
    }),
    requestValidity: {
      startTimestamp: payload.kmsUserDecryptEIP712Message.startTimestamp,
      durationDays: payload.kmsUserDecryptEIP712Message.durationDays,
    },
    contractsChainId,
    contractAddresses: payload.kmsUserDecryptEIP712Message.contractAddresses,
    userAddress: payload.kmsUserDecryptEIP712Signer,
    signature: remove0x(
      payload.kmsUserDecryptEIP712Signature,
    ) as Bytes65HexNo0x,
    extraData: payload.kmsUserDecryptEIP712Message.extraData,
    publicKey: remove0x(
      payload.kmsUserDecryptEIP712Message.publicKey,
    ) as BytesHexNo0x,
  };

  const request = new RelayerAsyncRequest({
    relayerOperation: "USER_DECRYPT",
    url: `${removeSuffix(relayerClient.relayerUrl, "/")}/v2/user-decrypt`,
    payload: userDecryptPayload,
    options: relayerOptions,
  });

  const result = (await request.run()) as FetchUserDecryptResult;

  // SECURITY: Validate that response extraData matches request extraData (Issue #423)
  // This prevents a malicious relayer from substituting the KMS context
  const requestExtraData = remove0x(
    payload.kmsUserDecryptEIP712Message.extraData,
  );

  for (let i = 0; i < result.length; i++) {
    const share = result[i];
    if (!share) {
      throw new Error(`Missing share at index ${i}`);
    }
    // Validate extraData if present in the response
    if (share.extraData !== undefined && share.extraData !== requestExtraData) {
      throw new Error(
        `Security violation: Response extraData mismatch at index ${i}. ` +
          `Expected "${requestExtraData}", got "${share.extraData}". ` +
          `A malicious relayer may be attempting a context substitution attack. ` +
          `See: https://github.com/zama-ai/relayer-sdk/issues/423`,
      );
    }
  }

  return result as readonly KmsSigncryptedShare[];
}
