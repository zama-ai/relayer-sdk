import type { ethers as EthersT } from 'ethers';
import type { Bytes65Hex, ChecksummedAddress } from '@base/types/primitives';
import type {
  KmsDelegateEIP712Type,
  KmsDelegateEIP712TypesType,
  KmsDelegateEIP712UserArgsType,
  KmsEIP712DomainType,
  KmsEIP712Type,
  KmsEIP712TypesType,
  KmsEIP712UserArgsType,
} from './types';
import {
  assertIsChecksummedAddress,
  assertIsChecksummedAddressArray,
} from '@base/address';
import { assertIsBytes65HexArray, assertIsBytesHex } from '@base/bytes';
import { verifySignature } from '@base/signature';
import { assertIsUint256, assertIsUint32 } from '@base/uint';

////////////////////////////////////////////////////////////////////////////////
// KmsEIP712 Class
////////////////////////////////////////////////////////////////////////////////

export class KmsEIP712 {
  public readonly domain: KmsEIP712DomainType;

  static readonly #types: KmsEIP712TypesType = {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ] as const,
    UserDecryptRequestVerification: [
      { name: 'publicKey', type: 'bytes' },
      { name: 'contractAddresses', type: 'address[]' },
      { name: 'startTimestamp', type: 'uint256' },
      { name: 'durationDays', type: 'uint256' },
      { name: 'extraData', type: 'bytes' },
    ] as const,
  } as const;

  static readonly #delegateTypes: KmsDelegateEIP712TypesType = {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ] as const,
    DelegatedUserDecryptRequestVerification: [
      { name: 'publicKey', type: 'bytes' },
      { name: 'contractAddresses', type: 'address[]' },
      { name: 'startTimestamp', type: 'uint256' },
      { name: 'durationDays', type: 'uint256' },
      { name: 'extraData', type: 'bytes' },
      { name: 'delegatedAccount', type: 'address' },
    ] as const,
  } as const;

  static {
    Object.freeze(KmsEIP712.#types);
    Object.freeze(KmsEIP712.#types.EIP712Domain);
    Object.freeze(KmsEIP712.#types.UserDecryptRequestVerification);

    Object.freeze(KmsEIP712.#delegateTypes);
    Object.freeze(KmsEIP712.#delegateTypes.EIP712Domain);
    Object.freeze(
      KmsEIP712.#delegateTypes.DelegatedUserDecryptRequestVerification,
    );
  }

  // Important remark concerning the chainId argument:
  // =================================================
  //
  // The chainId is general here!
  // - The Kms Nodes are using chainId = gatewayChainId (10900)
  // - The FhevmInstance is using chainId = host chainId (11155111)
  constructor(params: {
    chainId: number; // It's a general chainId! can be gateway or host.
    verifyingContractAddressDecryption: string;
  }) {
    // the kms WASM package is expecting an uint32
    assertIsUint32(params.chainId);
    assertIsChecksummedAddress(params.verifyingContractAddressDecryption);
    this.domain = {
      name: 'Decryption',
      version: '1',
      chainId: params.chainId,
      verifyingContract: params.verifyingContractAddressDecryption,
    } as const;
    Object.freeze(this.domain);
  }

  public get chainId(): number {
    return this.domain.chainId;
  }

  public get verifyingContractAddressDecryption(): ChecksummedAddress {
    return this.domain.verifyingContract;
  }

  public createEIP712({
    publicKey,
    contractAddresses,
    startTimestamp,
    durationDays,
    extraData,
  }: KmsEIP712UserArgsType): KmsEIP712Type {
    assertIsBytesHex(publicKey);
    assertIsChecksummedAddressArray(contractAddresses);
    assertIsUint256(startTimestamp);
    assertIsUint256(durationDays);
    assertIsBytesHex(extraData);

    const EIP712DomainType = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ] as const;

    const eip712: KmsEIP712Type = {
      types: {
        EIP712Domain: EIP712DomainType,
        UserDecryptRequestVerification: [
          { name: 'publicKey', type: 'bytes' },
          { name: 'contractAddresses', type: 'address[]' },
          { name: 'startTimestamp', type: 'uint256' },
          { name: 'durationDays', type: 'uint256' },
          { name: 'extraData', type: 'bytes' },
        ] as const,
      },
      primaryType: 'UserDecryptRequestVerification' as const,
      domain: { ...this.domain },
      message: {
        publicKey,
        contractAddresses: [...contractAddresses],
        startTimestamp: startTimestamp.toString(),
        durationDays: durationDays.toString(),
        extraData,
      },
    };

    Object.freeze(eip712);
    Object.freeze(eip712.domain);
    Object.freeze(eip712.types);
    Object.freeze(eip712.types.EIP712Domain);
    Object.freeze(eip712.types.UserDecryptRequestVerification);
    Object.freeze(eip712.message);
    Object.freeze(eip712.message.contractAddresses);

    return eip712;
  }

  public createDelegateEIP712({
    publicKey,
    contractAddresses,
    startTimestamp,
    durationDays,
    extraData,
    delegatedAccount,
  }: KmsDelegateEIP712UserArgsType): KmsDelegateEIP712Type {
    assertIsBytesHex(publicKey);
    assertIsChecksummedAddressArray(contractAddresses);
    assertIsUint256(startTimestamp);
    assertIsUint256(durationDays);
    assertIsBytesHex(extraData);
    assertIsChecksummedAddress(delegatedAccount);

    const EIP712DomainType = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ] as const;

    const eip712: KmsDelegateEIP712Type = {
      types: {
        EIP712Domain: EIP712DomainType,
        DelegatedUserDecryptRequestVerification: [
          { name: 'publicKey', type: 'bytes' },
          { name: 'contractAddresses', type: 'address[]' },
          { name: 'startTimestamp', type: 'uint256' },
          { name: 'durationDays', type: 'uint256' },
          { name: 'extraData', type: 'bytes' },
          { name: 'delegatedAccount', type: 'address' },
        ] as const,
      },
      primaryType: 'DelegatedUserDecryptRequestVerification' as const,
      domain: { ...this.domain },
      message: {
        publicKey,
        contractAddresses: [...contractAddresses],
        startTimestamp: startTimestamp.toString(),
        durationDays: durationDays.toString(),
        extraData,
        delegatedAccount,
      },
    };

    Object.freeze(eip712);
    Object.freeze(eip712.domain);
    Object.freeze(eip712.types);
    Object.freeze(eip712.types.EIP712Domain);
    Object.freeze(eip712.types.DelegatedUserDecryptRequestVerification);
    Object.freeze(eip712.message);
    Object.freeze(eip712.message.contractAddresses);

    return eip712;
  }

  public verify(
    signatures: Bytes65Hex[],
    message: KmsEIP712UserArgsType,
  ): ChecksummedAddress[] {
    assertIsBytes65HexArray(signatures);
    const recoveredAddresses = signatures.map((signature: Bytes65Hex) => {
      const recoveredAddress = verifySignature({
        signature,
        domain: this.domain,
        types: KmsEIP712.#types as any as Record<
          string,
          EthersT.TypedDataField[]
        >,
        message,
        primaryType: 'UserDecryptRequestVerification',
      });
      return recoveredAddress;
    });
    return recoveredAddresses;
  }

  public verifyDelegate(
    signatures: Bytes65Hex[],
    message: KmsDelegateEIP712UserArgsType,
  ): ChecksummedAddress[] {
    assertIsBytes65HexArray(signatures);
    const recoveredAddresses = signatures.map((signature: Bytes65Hex) => {
      const recoveredAddress = verifySignature({
        signature,
        domain: this.domain,
        types: KmsEIP712.#delegateTypes as any as Record<
          string,
          EthersT.TypedDataField[]
        >,
        message,
        primaryType: 'DelegatedUserDecryptRequestVerification',
      });
      return recoveredAddress;
    });
    return recoveredAddresses;
  }
}
