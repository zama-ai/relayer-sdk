import type {
  Fhevm,
  OptionalNativeClient,
} from "../../types/coreFhevmClient.js";
import type { FhevmRuntime } from "../../types/coreFhevmRuntime.js";
import type { FhevmChain } from "../../types/fhevmChain.js";
import {
  toE2eTransportKeypair,
  type E2eTransportKeypair,
} from "../../kms/E2eTransportKeypair-p.js";

////////////////////////////////////////////////////////////////////////////////

export type ParseE2eTransportKeypairParameters = unknown;

export type ParseE2eTransportKeypairReturnType = E2eTransportKeypair;

export async function parseE2eTransportKeypair(
  fhevm: Fhevm<FhevmChain, FhevmRuntime, OptionalNativeClient>,
  parameters: ParseE2eTransportKeypairParameters,
): Promise<ParseE2eTransportKeypairReturnType> {
  return toE2eTransportKeypair(fhevm, parameters);
}

////////////////////////////////////////////////////////////////////////////////
