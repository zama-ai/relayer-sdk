import type { FhevmChainClient } from '@fhevm-base-types/public-api';
import type {
  ChecksummedAddress,
  Uint64BigInt,
  Uint8Number,
} from '@base/types/primitives';
import type {
  CoprocessorEIP712Domain,
  InputVerifierContractData,
} from '../types/public-api';
import {
  assertIsUint64,
  assertIsUint8,
  asUint8Number,
  isUint64BigInt,
  isUint8,
} from '@base/uint';
import {
  addressToChecksummedAddress,
  assertIsAddress,
  assertIsAddressArray,
  assertIsChecksummedAddressArray,
} from '@base/address';
import { executeWithBatching } from '@base/promise';
import { assertIsCoprocessorEIP712Domain } from '../coprocessor/CoprocessorEIP712';
import {
  DuplicateSignerError,
  ThresholdSignerError,
  UnknownSignerError,
} from '@fhevm-base/errors/SignersError';

////////////////////////////////////////////////////////////////////////////////
// InputVerifier (private implementation)
////////////////////////////////////////////////////////////////////////////////

class InputVerifierContractDataImpl implements InputVerifierContractData {
  readonly #address: ChecksummedAddress;
  readonly #eip712Domain: CoprocessorEIP712Domain;
  readonly #coprocessorSigners: ChecksummedAddress[];
  readonly #coprocessorSignerThreshold: Uint8Number;
  readonly #coprocessorSignersSet: Set<string>;

  constructor(params: {
    address: ChecksummedAddress;
    eip712Domain: CoprocessorEIP712Domain;
    coprocessorSigners: ChecksummedAddress[];
    coprocessorSignerThreshold: Uint8Number;
  }) {
    this.#address = params.address;
    this.#eip712Domain = { ...params.eip712Domain };
    this.#coprocessorSigners = [...params.coprocessorSigners];
    this.#coprocessorSignerThreshold = params.coprocessorSignerThreshold;
    this.#coprocessorSignersSet = new Set(
      this.#coprocessorSigners.map((addr) => addr.toLowerCase()),
    );

    Object.freeze(this.#eip712Domain);
    Object.freeze(this.#coprocessorSigners);
  }

  public get address(): ChecksummedAddress {
    return this.#address;
  }

  public get eip712Domain(): CoprocessorEIP712Domain {
    return this.#eip712Domain;
  }

  public get gatewayChainId(): Uint64BigInt {
    return this.#eip712Domain.chainId as Uint64BigInt;
  }

  public get coprocessorSigners(): ChecksummedAddress[] {
    return this.#coprocessorSigners;
  }

  public get coprocessorSignerThreshold(): Uint8Number {
    return this.#coprocessorSignerThreshold;
  }

  public get verifyingContractAddressInputVerification(): ChecksummedAddress {
    return this.#eip712Domain.verifyingContract;
  }

  public has(signer: string): boolean {
    return this.#coprocessorSignersSet.has(signer);
  }
}

////////////////////////////////////////////////////////////////////////////////
// Public API: createInputVerifierContractData()
////////////////////////////////////////////////////////////////////////////////

export function createInputVerifierContractData(args: {
  address: string;
  gatewayChainId: number | bigint;
  coprocessorSigners: string[];
  coprocessorSignerThreshold: number | bigint;
  verifyingContractAddressInputVerification: string;
}): InputVerifierContractData {
  const {
    address,
    gatewayChainId,
    coprocessorSigners,
    coprocessorSignerThreshold,
    verifyingContractAddressInputVerification,
  } = args;

  assertIsAddress(address, {});
  assertIsUint64(gatewayChainId, {});
  assertIsAddressArray(coprocessorSigners, {});
  assertIsUint8(coprocessorSignerThreshold, {});
  assertIsAddress(verifyingContractAddressInputVerification, {});

  return new InputVerifierContractDataImpl({
    address: addressToChecksummedAddress(address),
    eip712Domain: {
      chainId: BigInt(gatewayChainId),
      name: 'InputVerification',
      version: '1',
      verifyingContract: addressToChecksummedAddress(
        verifyingContractAddressInputVerification,
      ),
    },
    coprocessorSignerThreshold: Number(
      coprocessorSignerThreshold,
    ) as Uint8Number,
    coprocessorSigners: coprocessorSigners.map(addressToChecksummedAddress),
  });
}

////////////////////////////////////////////////////////////////////////////////
// Public API: fetchInputVerifierContractData()
////////////////////////////////////////////////////////////////////////////////

export async function fetchInputVerifierContractData(
  client: FhevmChainClient & {
    config: {
      hostChainConfig: { inputVerifierContractAddress: ChecksummedAddress };
    };
  },
): Promise<InputVerifierContractData> {
  const contract = client.libs.inputVerifierContractLib;
  const inputVerifierContractAddress =
    client.config.hostChainConfig.inputVerifierContractAddress;

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
      contract.eip712Domain(client.nativeClient, inputVerifierContractAddress),
    () =>
      contract.getThreshold(client.nativeClient, inputVerifierContractAddress),
    () =>
      contract.getCoprocessorSigners(
        client.nativeClient,
        inputVerifierContractAddress,
      ),
  ];

  const res = await executeWithBatching(rpcCalls, client.batchRpcCalls);

  const eip712DomainArray = res[0] as unknown[];
  const threshold = res[1];
  const coprocessorSigners = res[2] as unknown[];

  if (!isUint8(threshold)) {
    throw new Error(`Invalid InputVerifier Coprocessor signers threshold.`);
  }

  try {
    assertIsChecksummedAddressArray(coprocessorSigners, {});
  } catch (e) {
    throw new Error(`Invalid InputVerifier Coprocessor signers addresses.`, {
      cause: e,
    });
  }

  const unknownChainId = eip712DomainArray[3];
  if (!isUint64BigInt(unknownChainId)) {
    throw new Error('Invalid InputVerifier EIP-712 domain chainId.');
  }

  const eip712Domain = {
    name: eip712DomainArray[1],
    version: eip712DomainArray[2],
    chainId: unknownChainId,
    verifyingContract: eip712DomainArray[4],
  };

  try {
    assertIsCoprocessorEIP712Domain(
      eip712Domain,
      'InputVerifier.eip712Domain()',
      {},
    );
  } catch (e) {
    throw new Error(`Invalid InputVerifier EIP-712 domain.`, { cause: e });
  }

  if (
    eip712Domain.verifyingContract.toLowerCase() ===
    inputVerifierContractAddress.toLowerCase()
  ) {
    throw new Error(
      `Invalid InputVerifier EIP-712 domain. Unexpected verifyingContract.`,
    );
  }

  const data = new InputVerifierContractDataImpl({
    address: inputVerifierContractAddress,
    eip712Domain: eip712Domain,
    coprocessorSignerThreshold: asUint8Number(Number(threshold)),
    coprocessorSigners,
  });

  return data;
}

export function assertCoprocessorSignerThreshold(
  inputVerifier: InputVerifierContractData,
  recoveredAddresses: readonly string[],
): void {
  const type = 'coprocessor';
  const addressMap = new Set<string>();
  recoveredAddresses.forEach((address) => {
    if (addressMap.has(address.toLowerCase())) {
      throw new DuplicateSignerError({
        duplicateAddress: address,
        type,
      });
    }
    addressMap.add(address.toLowerCase());
  });

  for (const address of recoveredAddresses) {
    if (!inputVerifier.has(address.toLowerCase())) {
      throw new UnknownSignerError({
        unknownAddress: address,
        type,
      });
    }
  }

  if (recoveredAddresses.length < inputVerifier.coprocessorSignerThreshold) {
    throw new ThresholdSignerError({
      type,
    });
  }
}
