import type { ethers as EthersT } from "ethers";
import type { TrustedClient } from "../../core/modules/ethereum/types.js";
import { type CreateFhevmRuntimeParameters } from "../../core/runtime/CoreFhevmRuntime-p.js";
import type { FhevmRuntime, FhevmRuntimeConfig } from "../../core/types/coreFhevmRuntime.js";
export declare const PRIVATE_ETHERS_TOKEN: unique symbol;
/**
 * Sets the global {@link FhevmRuntimeConfig} used by the ethers adapter.
 *
 * Must be called before any runtime or client is created.
 * May be called multiple times with identical parameters (idempotent).
 * Throws if called again with different parameters.
 *
 * @param config - The runtime configuration.
 * @throws If a different config has already been set.
 */
export declare function setFhevmRuntimeConfig(config: FhevmRuntimeConfig): void;
export declare function getEthersRuntime(): FhevmRuntime;
/**
 * Seals an ethers `ContractRunner` into an opaque {@link TrustedClient}.
 *
 * The returned value can be passed through the core layer without exposing
 * the underlying ethers instance. Only the ethers adapter can later recover
 * the original runner via {@link trustedClientToEthersContractRunner}.
 *
 * @param runner - The ethers contract runner to seal.
 * @returns An opaque {@link TrustedClient} bound to the ethers origin token.
 */
export declare function ethersContractRunnerToTrustedClient<client extends EthersT.ContractRunner>(runner: client): TrustedClient<client>;
/**
 * Verifies that the {@link TrustedClient} was created by the ethers adapter
 * and extracts the original `ContractRunner`.
 *
 * @param trustedClient - The host client to verify.
 * @returns The original ethers `ContractRunner`.
 * @throws {Error} If the client was not created by {@link ethersContractRunnerToTrustedClient}.
 */
export declare function trustedClientToEthersContractRunner<client extends EthersT.ContractRunner>(trustedClient: TrustedClient<client>): client;
export declare function createFhevmRuntime(parameters: CreateFhevmRuntimeParameters): FhevmRuntime;
//# sourceMappingURL=ethers-p.d.ts.map