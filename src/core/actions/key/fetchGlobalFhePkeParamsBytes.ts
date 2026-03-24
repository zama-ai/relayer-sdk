import type {
  Fhevm,
  OptionalNativeClient,
} from "../../types/coreFhevmClient.js";
import type { FhevmRuntime } from "../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import type { GlobalFhePkeParamsBytes } from "../../types/globalFhePkeParams.js";
import { globalFhePkeParamsCache } from "./globalFhePkeParamsCache.js";
import type { SerializeGlobalFhePkeParamsParameters } from "../encrypt/serializeGlobalFhePkeParams.js";
import { serializeGlobalFhePkeParams } from "../encrypt/serializeGlobalFhePkeParams.js";
import type { RelayerKeyUrlOptions } from "../../types/relayer.js";
import { asFhevmWith } from "../../runtime/CoreFhevm-p.js";

////////////////////////////////////////////////////////////////////////////////

export type FetchGlobalFhePkeParamsBytesParameters = {
  readonly options?: RelayerKeyUrlOptions | undefined;
  readonly ignoreCache?: boolean | undefined;
};

export type FetchGlobalFhePkeParamsBytesReturnType = GlobalFhePkeParamsBytes;

////////////////////////////////////////////////////////////////////////////////

export async function fetchGlobalFhePkeParamsBytes(
  fhevm: Fhevm<FhevmChain, FhevmRuntime, OptionalNativeClient>,
  parameters?: FetchGlobalFhePkeParamsBytesParameters | undefined,
): Promise<GlobalFhePkeParamsBytes> {
  const relayerUrl = fhevm.chain.fhevm.relayerUrl;

  // Ensure a fetch is in-flight
  globalFhePkeParamsCache.ensureBytes(
    relayerUrl,
    () =>
      fhevm.runtime.relayer.fetchGlobalFhePkeParamsBytes(
        { relayerUrl },
        parameters ?? {},
      ),
    { chainId: fhevm.chain.id, relayerUrl },
  );

  const bytes = await globalFhePkeParamsCache.resolveBytes({
    relayerUrl,
    serializeFn: _getSerializeFn(fhevm),
  });

  if (bytes === undefined) {
    throw new Error("Failed to fetch global FHE PKE params bytes");
  }

  return bytes;
}

/**
 * Returns a serialize function that converts wasm params to bytes,
 * or `undefined` if the encrypt module is not available on the runtime.
 */
function _getSerializeFn(
  fhevm: Fhevm<FhevmChain, FhevmRuntime, OptionalNativeClient>,
):
  | ((
      args: SerializeGlobalFhePkeParamsParameters,
    ) => Promise<GlobalFhePkeParamsBytes>)
  | undefined {
  // Try to get a serialize fn if the encrypt module is available
  let serializeFn:
    | ((
        args: SerializeGlobalFhePkeParamsParameters,
      ) => Promise<GlobalFhePkeParamsBytes>)
    | undefined;

  try {
    // check if the 'encrypt' module is available
    const f = asFhevmWith(fhevm, "encrypt");
    serializeFn = (args) => serializeGlobalFhePkeParams(f, args);
  } catch {
    // encrypt module not available
  }

  return serializeFn;
}
