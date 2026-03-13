import { encryptModule } from "../../core/modules/encrypt/module/index.js";
import { relayerModule } from "../../core/modules/relayer/module/index.js";
import { getEthersRuntime, PRIVATE_ETHERS_TOKEN, } from "../internal/ethers-p.js";
import { createFhevmClient as createFhevmClient_, } from "../../core/clients/fhevmClient.js";
import { decryptModule } from "../../core/modules/decrypt/module/index.js";
export function createFhevmClient(parameters) {
    const runtime = getEthersRuntime()
        .extend(encryptModule)
        .extend(decryptModule)
        .extend(relayerModule);
    return createFhevmClient_(PRIVATE_ETHERS_TOKEN, {
        chain: parameters.chain,
        runtime,
        client: parameters.provider,
    });
}
//# sourceMappingURL=createFhevmClient.js.map