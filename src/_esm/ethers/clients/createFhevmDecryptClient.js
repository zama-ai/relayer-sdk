import { decryptModule } from "../../core/modules/decrypt/module/index.js";
import { relayerModule } from "../../core/modules/relayer/module/index.js";
import { createFhevmDecryptClient as createFhevmDecryptClient_, } from "../../core/clients/fhevmDecryptClient.js";
import { getEthersRuntime, PRIVATE_ETHERS_TOKEN, } from "../internal/ethers-p.js";
export function createFhevmDecryptClient(parameters) {
    const runtime = getEthersRuntime()
        .extend(decryptModule)
        .extend(relayerModule);
    return createFhevmDecryptClient_(PRIVATE_ETHERS_TOKEN, {
        chain: parameters.chain,
        runtime,
        client: parameters.provider,
    });
}
//# sourceMappingURL=createFhevmDecryptClient.js.map