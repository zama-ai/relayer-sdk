import type { RelayerModuleFactory } from "../types.js";
import { fetchCoprocessorSignatures } from "./fetchCoprocessorSignatures.js";
import { fetchDelegatedUserDecrypt } from "./fetchDelegatedUserDecrypt.js";
import { fetchPublicDecrypt } from "./fetchPublicDecrypt.js";
import { fetchGlobalFhePkeParamsBytes } from "./fetchGlobalFhePkeParamsBytes.js";
import { fetchGlobalFhePkeParamsSource } from "./fetchGlobalFhePkeParamsSource.js";
import { fetchUserDecrypt } from "./fetchUserDecrypt.js";

////////////////////////////////////////////////////////////////////////////////
// relayerModule
////////////////////////////////////////////////////////////////////////////////

export const relayerModule: RelayerModuleFactory = () => {
  return Object.freeze({
    relayer: Object.freeze({
      fetchGlobalFhePkeParamsSource,
      fetchGlobalFhePkeParamsBytes,
      fetchCoprocessorSignatures,
      fetchPublicDecrypt,
      fetchUserDecrypt,
      fetchDelegatedUserDecrypt,
    }),
  });
};
