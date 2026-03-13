import { encryptModule } from "../../core/modules/encrypt/module/index.js";
import { relayerModule } from "../../core/modules/relayer/module/index.js";
import { getEthersRuntime, PRIVATE_ETHERS_TOKEN, } from "../internal/ethers-p.js";
import { createFhevmEncryptClient as createFhevmEncryptClient_, } from "../../core/clients/fhevmEncryptClient.js";
export function createFhevmEncryptClient(parameters) {
    const runtime = getEthersRuntime()
        .extend(encryptModule)
        .extend(relayerModule);
    return createFhevmEncryptClient_(PRIVATE_ETHERS_TOKEN, {
        chain: parameters.chain,
        runtime,
        client: parameters.provider,
    });
}
//# sourceMappingURL=createFhevmEncryptClient.js.map