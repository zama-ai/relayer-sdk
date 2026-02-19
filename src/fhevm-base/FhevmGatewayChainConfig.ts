import type { ChecksummedAddress, Uint32BigInt } from '@base/types/primitives';
import type { FhevmGatewayChainConfig } from './types/public-api';
import { addressToChecksummedAddress, assertIsAddress } from '@base/address';
import { asUint32 } from '@base/uint';

////////////////////////////////////////////////////////////////////////////////
// FhevmGatewayChainConfig
////////////////////////////////////////////////////////////////////////////////

class FhevmGatewayChainConfigImpl implements FhevmGatewayChainConfig {
  readonly #chainId: Uint32BigInt;
  readonly #verifyingContractAddressDecryption: ChecksummedAddress;
  readonly #verifyingContractAddressInputVerification: ChecksummedAddress;

  constructor(params: {
    chainId: Uint32BigInt;
    verifyingContractAddressDecryption: ChecksummedAddress;
    verifyingContractAddressInputVerification: ChecksummedAddress;
  }) {
    this.#chainId = params.chainId;
    this.#verifyingContractAddressDecryption =
      params.verifyingContractAddressDecryption;
    this.#verifyingContractAddressInputVerification =
      params.verifyingContractAddressInputVerification;
  }

  public get chainId(): Uint32BigInt {
    return this.#chainId;
  }
  public get verifyingContractAddressDecryption(): ChecksummedAddress {
    return this.#verifyingContractAddressDecryption;
  }
  public get verifyingContractAddressInputVerification(): ChecksummedAddress {
    return this.#verifyingContractAddressInputVerification;
  }
}

////////////////////////////////////////////////////////////////////////////////
// Public API
////////////////////////////////////////////////////////////////////////////////

export function createFhevmGatewayChainConfig(params: {
  chainId: number | bigint;
  verifyingContractAddressDecryption: string;
  verifyingContractAddressInputVerification: string;
}): FhevmGatewayChainConfig {
  assertIsAddress(params.verifyingContractAddressDecryption, {});
  assertIsAddress(params.verifyingContractAddressInputVerification, {});

  return new FhevmGatewayChainConfigImpl({
    chainId: BigInt(asUint32(params.chainId)) as Uint32BigInt,
    verifyingContractAddressDecryption: addressToChecksummedAddress(
      params.verifyingContractAddressDecryption,
    ),
    verifyingContractAddressInputVerification: addressToChecksummedAddress(
      params.verifyingContractAddressInputVerification,
    ),
  });
}

export const ZamaSepoliaGatewayChainConfig = new FhevmGatewayChainConfigImpl({
  chainId: 10901n as Uint32BigInt,
  verifyingContractAddressDecryption:
    '0x5D8BD78e2ea6bbE41f26dFe9fdaEAa349e077478' as ChecksummedAddress,
  verifyingContractAddressInputVerification:
    '0x483b9dE06E4E4C7D35CCf5837A1668487406D955' as ChecksummedAddress,
});

export const ZamaMainnetGatewayChainConfig = new FhevmGatewayChainConfigImpl({
  chainId: 261131n as Uint32BigInt,
  verifyingContractAddressDecryption:
    '0x0f6024a97684f7d90ddb0fAAD79cB15F2C888D24' as ChecksummedAddress,
  verifyingContractAddressInputVerification:
    '0xcB1bB072f38bdAF0F328CdEf1Fc6eDa1DF029287' as ChecksummedAddress,
});
