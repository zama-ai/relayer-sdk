import type { RelayerKeyUrlOptions } from "../../types/relayer.js";
import type {
  Fhevm,
  OptionalNativeClient,
} from "../../types/coreFhevmClient.js";
import type { WithEncrypt } from "../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import type { GlobalFhePkeParams } from "../../types/globalFhePkeParams.js";
import { deserializeGlobalFhePkeParams } from "../encrypt/deserializeGlobalFhePkeParams.js";
import { globalFhePkeParamsCache } from "./globalFhePkeParamsCache.js";

////////////////////////////////////////////////////////////////////////////////

export type FetchGlobalFhePkeParamsParameters = {
  readonly options?: RelayerKeyUrlOptions | undefined;
  readonly ignoreCache?: boolean | undefined;
};

export type FetchGlobalFhePkeParamsReturnType = GlobalFhePkeParams;

////////////////////////////////////////////////////////////////////////////////

export async function fetchGlobalFhePkeParams(
  fhevm: Fhevm<FhevmChain, WithEncrypt, OptionalNativeClient>,
  parameters?: FetchGlobalFhePkeParamsParameters | undefined,
): Promise<FetchGlobalFhePkeParamsReturnType> {
  const relayerUrl = fhevm.chain.fhevm.relayerUrl;

  // Ensure a bytes fetch is in-flight
  globalFhePkeParamsCache.ensureBytes(
    relayerUrl,
    () =>
      fhevm.runtime.relayer.fetchGlobalFhePkeParamsBytes(
        { relayerUrl },
        parameters ?? {},
      ),
    { chainId: fhevm.chain.id, relayerUrl },
  );

  // Upgrade bytes → wasm (chains from pending bytes if still in-flight)
  globalFhePkeParamsCache.ensureWasm({
    relayerUrl,
    deserializeFn: (bytes) => deserializeGlobalFhePkeParams(fhevm, bytes),
  });

  const entry = globalFhePkeParamsCache.get(relayerUrl);
  if (entry === undefined) {
    throw new Error("Failed to fetch global FHE PKE params");
  }

  await entry.ready;

  if (entry.resolvedKind !== "wasm") {
    throw new Error(
      "Expected wasm params but got " + JSON.stringify(entry.resolvedKind),
    );
  }

  return entry.value as GlobalFhePkeParams;
}
