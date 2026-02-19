import type { ChecksummedAddress, Uint64BigInt } from '@base/types/primitives';
import type { FhevmHostChainConfig } from './types/public-api';
import { addressToChecksummedAddress, assertIsAddress } from '@base/address';
import { asUint64BigInt } from '@base/uint';

////////////////////////////////////////////////////////////////////////////////
// FhevmHostChainConfig
////////////////////////////////////////////////////////////////////////////////

class FhevmHostChainConfigImpl implements FhevmHostChainConfig {
  // ACL.sol host contract address
  readonly #aclContractAddress: ChecksummedAddress;
  // KMSVerifier.sol host contract address
  readonly #kmsVerifierContractAddress: ChecksummedAddress;
  // InputVerifier.sol host contract address
  readonly #inputVerifierContractAddress: ChecksummedAddress;
  // Host chainId (Uint64)
  readonly #chainId: Uint64BigInt;

  constructor(params: {
    chainId: Uint64BigInt;
    aclContractAddress: ChecksummedAddress;
    kmsVerifierContractAddress: ChecksummedAddress;
    inputVerifierContractAddress: ChecksummedAddress;
  }) {
    this.#chainId = params.chainId;
    this.#aclContractAddress = params.aclContractAddress;
    this.#kmsVerifierContractAddress = params.kmsVerifierContractAddress;
    this.#inputVerifierContractAddress = params.inputVerifierContractAddress;
  }

  public get chainId(): Uint64BigInt {
    return this.#chainId;
  }
  public get aclContractAddress(): ChecksummedAddress {
    return this.#aclContractAddress;
  }
  public get kmsVerifierContractAddress(): ChecksummedAddress {
    return this.#kmsVerifierContractAddress;
  }
  public get inputVerifierContractAddress(): ChecksummedAddress {
    return this.#inputVerifierContractAddress;
  }
}

////////////////////////////////////////////////////////////////////////////////
// Public API
////////////////////////////////////////////////////////////////////////////////

export function createFhevmHostChainConfig(params: {
  chainId: number | bigint;
  aclContractAddress: string;
  kmsVerifierContractAddress: string;
  inputVerifierContractAddress: string;
}): FhevmHostChainConfig {
  assertIsAddress(params.aclContractAddress, {});
  assertIsAddress(params.kmsVerifierContractAddress, {});
  assertIsAddress(params.inputVerifierContractAddress, {});

  return new FhevmHostChainConfigImpl({
    aclContractAddress: addressToChecksummedAddress(params.aclContractAddress),
    inputVerifierContractAddress: addressToChecksummedAddress(
      params.inputVerifierContractAddress,
    ),
    kmsVerifierContractAddress: addressToChecksummedAddress(
      params.kmsVerifierContractAddress,
    ),
    chainId: asUint64BigInt(params.chainId),
  });
}

export const ZamaSepoliaHostChainConfig = new FhevmHostChainConfigImpl({
  chainId: 11155111n as Uint64BigInt,
  aclContractAddress:
    '0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D' as ChecksummedAddress,
  kmsVerifierContractAddress:
    '0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A' as ChecksummedAddress,
  inputVerifierContractAddress:
    '0xBBC1fFCdc7C316aAAd72E807D9b0272BE8F84DA0' as ChecksummedAddress,
});

export const ZamaMainnetHostChainConfig = new FhevmHostChainConfigImpl({
  chainId: 1n as Uint64BigInt,
  aclContractAddress:
    '0xcA2E8f1F656CD25C01F05d0b243Ab1ecd4a8ffb6' as ChecksummedAddress,
  kmsVerifierContractAddress:
    '0x77627828a55156b04Ac0DC0eb30467f1a552BB03' as ChecksummedAddress,
  inputVerifierContractAddress:
    '0xCe0FC2e05CFff1B719EFF7169f7D80Af770c8EA2' as ChecksummedAddress,
});
