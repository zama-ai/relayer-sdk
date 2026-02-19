import type { ChecksummedAddress, Uint8Number } from '@base/types/primitives';
import type { FHEVMExecutorContractData } from '../types/public-api';
import type { FhevmChainClient } from '@fhevm-base-types/public-api';
import { assertIsUint8, isUint8 } from '@base/uint';
import {
  addressToChecksummedAddress,
  assertIsAddress,
  assertIsChecksummedAddress,
} from '@base/address';
import { executeWithBatching } from '@base/promise';

////////////////////////////////////////////////////////////////////////////////
// KMSVerifier (private implementation)
////////////////////////////////////////////////////////////////////////////////

class FHEVMExecutorContractDataImpl implements FHEVMExecutorContractData {
  readonly #address: ChecksummedAddress;
  readonly #handleVersion: Uint8Number;
  readonly #aclContractAddress: ChecksummedAddress;
  readonly #inputVerifierContractAddress: ChecksummedAddress;
  readonly #hcuLimitContractAddress: ChecksummedAddress;

  constructor(params: {
    address: ChecksummedAddress;
    handleVersion: Uint8Number;
    aclContractAddress: ChecksummedAddress;
    inputVerifierContractAddress: ChecksummedAddress;
    hcuLimitContractAddress: ChecksummedAddress;
  }) {
    this.#address = params.address;
    this.#handleVersion = params.handleVersion;
    this.#aclContractAddress = params.aclContractAddress;
    this.#inputVerifierContractAddress = params.inputVerifierContractAddress;
    this.#hcuLimitContractAddress = params.hcuLimitContractAddress;
  }

  public get address(): ChecksummedAddress {
    return this.#address;
  }

  public get aclContractAddress(): ChecksummedAddress {
    return this.#aclContractAddress;
  }

  public get inputVerifierContractAddress(): ChecksummedAddress {
    return this.#inputVerifierContractAddress;
  }

  public get hcuLimitContractAddress(): ChecksummedAddress {
    return this.#hcuLimitContractAddress;
  }

  public get handleVersion(): Uint8Number {
    return this.#handleVersion;
  }
}

////////////////////////////////////////////////////////////////////////////////
// Public API: fetchFHEVMExecutorContractData()
////////////////////////////////////////////////////////////////////////////////

export function createFHEVMExecutorContractData(args: {
  address: string;
  aclContractAddress: string;
  inputVerifierContractAddress: string;
  hcuLimitContractAddress: string;
  handleVersion: number;
}): FHEVMExecutorContractData {
  const {
    address,
    aclContractAddress,
    inputVerifierContractAddress,
    hcuLimitContractAddress,
    handleVersion,
  } = args;

  assertIsAddress(address, {});
  assertIsAddress(aclContractAddress, {});
  assertIsAddress(inputVerifierContractAddress, {});
  assertIsAddress(hcuLimitContractAddress, {});
  assertIsUint8(handleVersion, {});

  return new FHEVMExecutorContractDataImpl({
    address: addressToChecksummedAddress(address),
    aclContractAddress: addressToChecksummedAddress(aclContractAddress),
    inputVerifierContractAddress: addressToChecksummedAddress(
      inputVerifierContractAddress,
    ),
    hcuLimitContractAddress: addressToChecksummedAddress(
      hcuLimitContractAddress,
    ),
    handleVersion: Number(handleVersion) as Uint8Number,
  });
}

export async function fetchFHEVMExecutorContractData(
  client: FhevmChainClient & {
    config: {
      hostChainConfig: { fhevmExecutorContractAddress: ChecksummedAddress };
    };
  },
): Promise<FHEVMExecutorContractData> {
  const contract = client.libs.fhevmExecutorContractLib;
  const fhevmExecutorContractAddress =
    client.config.hostChainConfig.fhevmExecutorContractAddress;

  ////////////////////////////////////////////////////////////////////////////
  //
  // Important remark:
  // =================
  // Do NOTE USE `Promise.all` here!
  // You may get a server response 500 Internal Server Error
  // "Batch of more than 3 requests are not allowed on free tier, to use this
  // feature register paid account at drpc.org"
  //
  ////////////////////////////////////////////////////////////////////////////

  const rpcCalls = [
    () =>
      contract.getACLAddress(client.nativeClient, fhevmExecutorContractAddress),
    () =>
      contract.getHCULimitAddress(
        client.nativeClient,
        fhevmExecutorContractAddress,
      ),
    () =>
      contract.getInputVerifierAddress(
        client.nativeClient,
        fhevmExecutorContractAddress,
      ),
    () =>
      contract.getHandleVersion(
        client.nativeClient,
        fhevmExecutorContractAddress,
      ),
  ];

  const res = await executeWithBatching<unknown>(
    rpcCalls,
    client.batchRpcCalls,
  );

  const aclContractAddress = res[0];
  const hcuLimitContractAddress = res[1];
  const inputVerifierContractAddress = res[2];
  const handleVersion = res[3];

  if (!isUint8(handleVersion)) {
    throw new Error(`Invalid handle version.`);
  }

  assertIsChecksummedAddress(aclContractAddress, {});
  assertIsChecksummedAddress(hcuLimitContractAddress, {});
  assertIsChecksummedAddress(inputVerifierContractAddress, {});

  const data = new FHEVMExecutorContractDataImpl({
    address: fhevmExecutorContractAddress,
    aclContractAddress,
    inputVerifierContractAddress,
    hcuLimitContractAddress,
    handleVersion: Number(handleVersion) as Uint8Number,
  });

  return data;
}
