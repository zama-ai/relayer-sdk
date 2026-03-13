import { assertIsUint64, asUint64BigInt } from "../../base/uint.js";
import { getTrustedClient } from "../../runtime/CoreFhevm-p.js";
export async function resolveChainId(fhevm, parameters) {
    const trustedClient = getTrustedClient(fhevm);
    const { id, verify } = parameters;
    // No id provided → fetch from chain
    if (id === undefined) {
        return asUint64BigInt(await fhevm.runtime.ethereum.getChainId(trustedClient));
    }
    assertIsUint64(id, {});
    const resolvedId = asUint64BigInt(BigInt(id));
    // Id provided, no verification requested → return as-is
    // By default, do not verify
    if (verify !== true) {
        return resolvedId;
    }
    // Id provided + verify → cross-check with chain
    const chainId = asUint64BigInt(await fhevm.runtime.ethereum.getChainId(trustedClient));
    if (resolvedId !== chainId) {
        throw new Error(`Chain id mismatch: connected to chain ${chainId}, but expected chain ${resolvedId}`);
    }
    return resolvedId;
}
//# sourceMappingURL=resolveChainId.js.map