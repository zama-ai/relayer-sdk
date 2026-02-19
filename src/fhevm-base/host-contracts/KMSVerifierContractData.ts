import type {
  ChecksummedAddress,
  Uint64BigInt,
  Uint8Number,
} from '@base/types/primitives';
import type {
  KmsEIP712Domain,
  KMSVerifierContractData,
} from '../types/public-api';
import type { FhevmChainClient } from '@fhevm-base-types/public-api';
import type { ErrorMetadataParams } from '@base/errors/ErrorBase';
import {
  assertIsUint64,
  assertIsUint8,
  assertRecordUintBigIntProperty,
  asUint8Number,
  isUint64BigInt,
  isUint8,
} from '@base/uint';
import {
  addressToChecksummedAddress,
  assertIsAddress,
  assertIsAddressArray,
  assertIsChecksummedAddressArray,
  assertRecordChecksummedAddressProperty,
} from '@base/address';
import { executeWithBatching } from '@base/promise';
import { assertRecordStringProperty } from '@base/string';
import {
  DuplicateSignerError,
  ThresholdSignerError,
  UnknownSignerError,
} from '../errors/SignersError';

////////////////////////////////////////////////////////////////////////////////
// KMSVerifierContractData (private implementation)
////////////////////////////////////////////////////////////////////////////////

class KMSVerifierContractDataImpl implements KMSVerifierContractData {
  readonly #address: ChecksummedAddress;
  readonly #eip712Domain: KmsEIP712Domain;
  readonly #kmsSigners: ChecksummedAddress[];
  readonly #kmsSignersSet: Set<string>;
  readonly #kmsSignerThreshold: Uint8Number;

  constructor(params: {
    address: ChecksummedAddress;
    eip712Domain: KmsEIP712Domain;
    kmsSigners: ChecksummedAddress[];
    kmsSignerThreshold: Uint8Number;
  }) {
    this.#address = params.address;
    this.#eip712Domain = { ...params.eip712Domain };
    this.#kmsSigners = [...params.kmsSigners];
    this.#kmsSignerThreshold = params.kmsSignerThreshold;
    this.#kmsSignersSet = new Set(
      this.#kmsSigners.map((addr) => addr.toLowerCase()),
    );

    Object.freeze(this.#eip712Domain);
    Object.freeze(this.#kmsSigners);
  }

  public get address(): ChecksummedAddress {
    return this.#address;
  }

  public get eip712Domain(): KmsEIP712Domain {
    return this.#eip712Domain;
  }

  public get gatewayChainId(): Uint64BigInt {
    return this.#eip712Domain.chainId as Uint64BigInt;
  }

  public get kmsSigners(): ChecksummedAddress[] {
    return this.#kmsSigners;
  }

  public get kmsSignerThreshold(): Uint8Number {
    return this.#kmsSignerThreshold;
  }

  public get verifyingContractAddressDecryption(): ChecksummedAddress {
    return this.#eip712Domain.verifyingContract;
  }

  public has(signer: string): boolean {
    return this.#kmsSignersSet.has(signer);
  }
}

////////////////////////////////////////////////////////////////////////////////
// Public API: createKMSVerifierContractData()
////////////////////////////////////////////////////////////////////////////////

export function createKMSVerifierContractData(args: {
  address: string;
  gatewayChainId: number | bigint;
  kmsSigners: string[];
  kmsSignerThreshold: number | bigint;
  verifyingContractAddressDecryption: string;
}): KMSVerifierContractData {
  const {
    address,
    gatewayChainId,
    kmsSigners,
    kmsSignerThreshold,
    verifyingContractAddressDecryption,
  } = args;

  assertIsAddress(address, {});
  assertIsUint64(gatewayChainId, {});
  assertIsAddressArray(kmsSigners, {});
  assertIsUint8(kmsSignerThreshold, {});
  assertIsAddress(verifyingContractAddressDecryption, {});

  return new KMSVerifierContractDataImpl({
    address: addressToChecksummedAddress(address),
    eip712Domain: {
      chainId: BigInt(gatewayChainId),
      name: 'Decryption',
      version: '1',
      verifyingContract: addressToChecksummedAddress(
        verifyingContractAddressDecryption,
      ),
    },
    kmsSignerThreshold: Number(kmsSignerThreshold) as Uint8Number,
    kmsSigners: kmsSigners.map(addressToChecksummedAddress),
  });
}

////////////////////////////////////////////////////////////////////////////////
// Public API: fetchKMSVerifierContractData()
////////////////////////////////////////////////////////////////////////////////

export async function fetchKMSVerifierContractData(
  client: FhevmChainClient & {
    config: {
      hostChainConfig: { kmsVerifierContractAddress: ChecksummedAddress };
    };
  },
): Promise<KMSVerifierContractData> {
  const contract = client.libs.kmsVerifierContractLib;
  const kmsVerifierContractAddress =
    client.config.hostChainConfig.kmsVerifierContractAddress;

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
      contract.eip712Domain(client.nativeClient, kmsVerifierContractAddress),
    () =>
      contract.getThreshold(client.nativeClient, kmsVerifierContractAddress),
    () =>
      contract.getKmsSigners(client.nativeClient, kmsVerifierContractAddress),
  ];

  const res = await executeWithBatching(rpcCalls, client.batchRpcCalls);

  const eip712DomainArray = res[0] as unknown[];
  const threshold = res[1];
  const kmsSigners = res[2] as unknown[];

  if (!isUint8(threshold)) {
    throw new Error(`Invalid KMSVerifier kms signers threshold.`);
  }

  try {
    assertIsChecksummedAddressArray(kmsSigners, {});
  } catch (e) {
    throw new Error(`Invalid KMSVerifier kms signers addresses.`, {
      cause: e,
    });
  }

  const unknownChainId = eip712DomainArray[3];
  if (!isUint64BigInt(unknownChainId)) {
    throw new Error('Invalid KMSVerifier EIP-712 domain chainId.');
  }

  const eip712Domain = {
    name: eip712DomainArray[1],
    version: eip712DomainArray[2],
    chainId: unknownChainId,
    verifyingContract: eip712DomainArray[4],
  };

  try {
    assertIsKmsEIP712Domain(eip712Domain, 'KMSVerifier.eip712Domain()', {});
  } catch (e) {
    throw new Error(`Invalid KMSVerifier EIP-712 domain.`, { cause: e });
  }

  if (
    eip712Domain.verifyingContract.toLowerCase() ===
    kmsVerifierContractAddress.toLowerCase()
  ) {
    throw new Error(
      `Invalid KMSVerifier EIP-712 domain. Unexpected verifyingContract.`,
    );
  }

  const data = new KMSVerifierContractDataImpl({
    address: kmsVerifierContractAddress,
    eip712Domain: eip712Domain,
    kmsSignerThreshold: asUint8Number(Number(threshold)),
    kmsSigners,
  });

  return data;
}

////////////////////////////////////////////////////////////////////////////////
// Helpers
////////////////////////////////////////////////////////////////////////////////

export function assertIsKmsEIP712Domain(
  value: unknown,
  name: string,
  options: ErrorMetadataParams,
): asserts value is KmsEIP712Domain {
  type T = KmsEIP712Domain;
  assertRecordStringProperty(value, 'name' satisfies keyof T, name, {
    expectedValue: 'Decryption' satisfies T['name'],
    ...options,
  });
  assertRecordStringProperty(value, 'version' satisfies keyof T, name, {
    expectedValue: '1' satisfies T['version'],
    ...options,
  });
  assertRecordUintBigIntProperty(
    value,
    'chainId' satisfies keyof T,
    name,
    options,
  );
  assertRecordChecksummedAddressProperty(
    value,
    'verifyingContract' satisfies keyof T,
    name,
    options,
  );
}

export function assertKmsSignerThreshold(
  kmsVerifier: KMSVerifierContractData,
  recoveredAddresses: readonly string[],
): void {
  const type = 'kms';
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
    if (!kmsVerifier.has(address.toLowerCase())) {
      throw new UnknownSignerError({
        unknownAddress: address,
        type,
      });
    }
  }

  if (recoveredAddresses.length < kmsVerifier.kmsSignerThreshold) {
    throw new ThresholdSignerError({
      type,
    });
  }
}
