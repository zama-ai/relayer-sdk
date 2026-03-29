import {
  publicDecrypt,
  type PublicDecryptParameters,
  type PublicDecryptReturnType,
} from "../../actions/base/publicDecrypt.js";
import type {
  Fhevm,
  FhevmBase,
  FhevmExtension,
} from "../../types/coreFhevmClient.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import { assertIsFhevmBaseClient } from "../../runtime/CoreFhevm-p.js";
import {
  signDecryptionPermit,
  type SignSelfDecryptionPermitParameters,
  type SignDelegatedDecryptionPermitParameters,
} from "../../actions/chain/signDecryptionPermit.js";
import type {
  SignedSelfDecryptionPermit,
  SignedDelegatedDecryptionPermit,
} from "../../types/signedDecryptionPermit.js";
import {
  parseE2eTransportKeypair,
  type ParseE2eTransportKeypairParameters,
  type ParseE2eTransportKeypairReturnType,
} from "../../actions/chain/parseE2eTransportKeypair.js";
import {
  fetchFheEncryptionKeyBytes,
  type FetchFheEncryptionKeyBytesParameters,
  type FetchFheEncryptionKeyBytesReturnType,
} from "../../actions/chain/fetchFheEncryptionKeyBytes.js";
import type {
  SerializeE2eTransportKeypairParameters,
  SerializeE2eTransportKeypairReturnType,
} from "../../actions/chain/serializeE2eTransportKeypair.js";
import { serializeE2eTransportKeypair } from "../../actions/chain/serializeE2eTransportKeypair.js";

////////////////////////////////////////////////////////////////////////////////

export type BaseActions = {
  readonly publicDecrypt: (
    parameters: PublicDecryptParameters,
  ) => Promise<PublicDecryptReturnType>;
  readonly signDecryptionPermit: {
    /** DOC4 */
    (
      parameters: SignSelfDecryptionPermitParameters,
    ): Promise<SignedSelfDecryptionPermit>;
    /** DOC3 */
    (
      parameters: SignDelegatedDecryptionPermitParameters,
    ): Promise<SignedDelegatedDecryptionPermit>;
  };
  /** DOC1 */
  readonly parseE2eTransportKeypair: (
    parameters: ParseE2eTransportKeypairParameters,
  ) => Promise<ParseE2eTransportKeypairReturnType>;
  readonly serializeE2eTransportKeypair: (
    parameters: SerializeE2eTransportKeypairParameters,
  ) => SerializeE2eTransportKeypairReturnType;
  /** Fetches the ~50MB FHE public encryption key from the relayer and caches it. */
  readonly fetchFheEncryptionKeyBytes: (
    parameters?: FetchFheEncryptionKeyBytesParameters,
  ) => Promise<FetchFheEncryptionKeyBytesReturnType>;
};

////////////////////////////////////////////////////////////////////////////////

function _baseActions(fhevm: Fhevm<FhevmChain>): BaseActions {
  return {
    publicDecrypt: (parameters) => publicDecrypt(fhevm, parameters),
    signDecryptionPermit: ((
      parameters:
        | SignSelfDecryptionPermitParameters
        | SignDelegatedDecryptionPermitParameters,
    ) => {
      if (parameters.onBehalfOf !== undefined) {
        return signDecryptionPermit(fhevm, parameters);
      }
      return signDecryptionPermit(fhevm, parameters);
    }) as BaseActions["signDecryptionPermit"],
    parseE2eTransportKeypair: (parameters) =>
      parseE2eTransportKeypair(fhevm, parameters),
    serializeE2eTransportKeypair: (parameters) =>
      serializeE2eTransportKeypair(fhevm, parameters),
    fetchFheEncryptionKeyBytes: (parameters) =>
      fetchFheEncryptionKeyBytes(fhevm, parameters),
  };
}

////////////////////////////////////////////////////////////////////////////////

export function baseActions(
  fhevm: FhevmBase<FhevmChain>,
): FhevmExtension<BaseActions> {
  assertIsFhevmBaseClient(fhevm);
  return {
    actions: _baseActions(fhevm),
    runtime: fhevm.runtime,
    // no init required, no prefetch of the FheEncryptionKey. This is the whole purpose of the fetchFheEncryptionKeyBytes action
  };
}
