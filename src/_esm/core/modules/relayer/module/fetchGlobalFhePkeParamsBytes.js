////////////////////////////////////////////////////////////////////////////////
// fetchKeyUrl
////////////////////////////////////////////////////////////////////////////////
import { fetchGlobalFhePkeParamsSource } from "./fetchGlobalFhePkeParamsSource.js";
import { fetchGlobalFhePkeParamsBytesWithSource as fetchGlobalFhePkeParamsBytesWithSource_ } from "../../../globalFheKey/fetchGlobalFhePkeParamsBytesWithSource.js";
////////////////////////////////////////////////////////////////////////////////
// fetchGlobalFhePkeParamsBytes
////////////////////////////////////////////////////////////////////////////////
export async function fetchGlobalFhePkeParamsBytes(relayerClient, parameters) {
    const { options } = parameters;
    const relayerOptions = options;
    // 1. Ask the relayer for the URLs where the keys are hosted
    const source = await fetchGlobalFhePkeParamsSource(relayerClient, {
        options: relayerOptions,
    });
    const init = relayerOptions?.signal !== undefined
        ? { signal: relayerOptions.signal }
        : undefined;
    // 2. Download the actual keys from those URLs
    const paramsBytes = await fetchGlobalFhePkeParamsBytesWithSource_(source, {
        retries: relayerOptions?.fetchRetries,
        retryDelayMs: relayerOptions?.fetchRetryDelayInMilliseconds,
        init,
    });
    return paramsBytes;
}
//# sourceMappingURL=fetchGlobalFhePkeParamsBytes.js.map