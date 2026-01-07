import type { ethers as EthersT } from 'ethers';
import type { Bytes65Hex, ChecksummedAddress } from '@base/types/primitives';
import type {
  KmsDelegateUserDecryptEIP712Type,
  KmsDelegateUserDecryptEIP712TypesType,
  KmsDelegateUserDecryptEIP712UserArgsType,
  KmsEIP712DomainType,
  KmsPublicDecryptEIP712Type,
  KmsPublicDecryptEIP712TypesType,
  KmsPublicDecryptEIP712UserArgsType,
  KmsUserDecryptEIP712Type,
  KmsUserDecryptEIP712TypesType,
  KmsUserDecryptEIP712UserArgsType,
} from './types';
import {
  assertIsChecksummedAddress,
  assertIsChecksummedAddressArray,
} from '@base/address';
import {
  assertIsBytes32HexArray,
  assertIsBytes65HexArray,
  assertIsBytesHex,
} from '@base/bytes';
import { verifySignature } from '@base/signature';
import { assertIsUint256, assertIsUint32 } from '@base/uint';

////////////////////////////////////////////////////////////////////////////////
// KmsEIP712 Class
////////////////////////////////////////////////////////////////////////////////

export class KmsEIP712 {
  public readonly domain: KmsEIP712DomainType;

  static readonly #userDecryptTypes: KmsUserDecryptEIP712TypesType = {
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

  static readonly #delegateUserDecryptTypes: KmsDelegateUserDecryptEIP712TypesType =
    {
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

  static readonly #publicDecryptTypes: KmsPublicDecryptEIP712TypesType = {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ] as const,
    PublicDecryptVerification: [
      { name: 'ctHandles', type: 'bytes32[]' },
      { name: 'decryptedResult', type: 'bytes' },
      { name: 'extraData', type: 'bytes' },
    ] as const,
  } as const;

  static {
    Object.freeze(KmsEIP712.#userDecryptTypes);
    Object.freeze(KmsEIP712.#userDecryptTypes.EIP712Domain);
    Object.freeze(KmsEIP712.#userDecryptTypes.UserDecryptRequestVerification);

    Object.freeze(KmsEIP712.#delegateUserDecryptTypes);
    Object.freeze(KmsEIP712.#delegateUserDecryptTypes.EIP712Domain);
    Object.freeze(
      KmsEIP712.#delegateUserDecryptTypes
        .DelegatedUserDecryptRequestVerification,
    );

    Object.freeze(KmsEIP712.#publicDecryptTypes);
    Object.freeze(KmsEIP712.#publicDecryptTypes.EIP712Domain);
    Object.freeze(KmsEIP712.#publicDecryptTypes.PublicDecryptVerification);
  }

  // Important remark concerning the chainId argument:
  // =================================================
  //
  // The chainId is general here!
  // - The Kms Nodes are using chainId = gatewayChainId (10900)
  // - The FhevmInstance is using chainId = host chainId (11155111)
  constructor(params: {
    chainId: bigint; // It's a general chainId! can be gateway or host.
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

  public get chainId(): bigint {
    return this.domain.chainId;
  }

  public get verifyingContractAddressDecryption(): ChecksummedAddress {
    return this.domain.verifyingContract;
  }

  public createUserDecryptEIP712({
    publicKey,
    contractAddresses,
    startTimestamp,
    durationDays,
    extraData,
  }: KmsUserDecryptEIP712UserArgsType): KmsUserDecryptEIP712Type {
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

    const eip712: KmsUserDecryptEIP712Type = {
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

  public createDelegateUserDecryptEIP712({
    publicKey,
    contractAddresses,
    startTimestamp,
    durationDays,
    extraData,
    delegatedAccount,
  }: KmsDelegateUserDecryptEIP712UserArgsType): KmsDelegateUserDecryptEIP712Type {
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

    const eip712: KmsDelegateUserDecryptEIP712Type = {
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

  public createPublicDecryptEIP712({
    ctHandles,
    decryptedResult,
    extraData,
  }: KmsPublicDecryptEIP712UserArgsType): KmsPublicDecryptEIP712Type {
    assertIsBytes32HexArray(ctHandles);
    assertIsBytesHex(decryptedResult);
    assertIsBytesHex(extraData);

    const EIP712DomainType = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ] as const;

    const eip712: KmsPublicDecryptEIP712Type = {
      types: {
        EIP712Domain: EIP712DomainType,
        PublicDecryptVerification: [
          { name: 'ctHandles', type: 'bytes32[]' },
          { name: 'decryptedResult', type: 'bytes' },
          { name: 'extraData', type: 'bytes' },
        ] as const,
      },
      primaryType: 'PublicDecryptVerification' as const,
      domain: { ...this.domain },
      message: {
        ctHandles,
        decryptedResult,
        extraData,
      },
    };

    Object.freeze(eip712);
    Object.freeze(eip712.domain);
    Object.freeze(eip712.types);
    Object.freeze(eip712.types.EIP712Domain);
    Object.freeze(eip712.types.PublicDecryptVerification);
    Object.freeze(eip712.message);
    Object.freeze(eip712.message.ctHandles);

    return eip712;
  }

  public verifyPublicDecrypt({
    signatures,
    message,
  }: {
    signatures: readonly Bytes65Hex[];
    message: KmsPublicDecryptEIP712UserArgsType;
  }): ChecksummedAddress[] {
    assertIsBytes65HexArray(signatures);
    const recoveredAddresses = signatures.map((signature: Bytes65Hex) => {
      const recoveredAddress = verifySignature({
        signature,
        domain: this.domain,
        types: KmsEIP712.#publicDecryptTypes as unknown as Record<
          string,
          EthersT.TypedDataField[]
        >,
        message,
        primaryType: 'PublicDecryptVerification',
      });
      return recoveredAddress;
    });
    console.log('=================================');
    console.log(JSON.stringify(recoveredAddresses, null, 2));
    console.log('=================================');
    return recoveredAddresses;
  }

  public verifyUserDecrypt(
    signatures: Bytes65Hex[],
    message: KmsUserDecryptEIP712UserArgsType,
  ): ChecksummedAddress[] {
    assertIsBytes65HexArray(signatures);
    const recoveredAddresses = signatures.map((signature: Bytes65Hex) => {
      const recoveredAddress = verifySignature({
        signature,
        domain: this.domain,
        types: KmsEIP712.#userDecryptTypes as unknown as Record<
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

  public verifyDelegateUserDecrypt(
    signatures: Bytes65Hex[],
    message: KmsDelegateUserDecryptEIP712UserArgsType,
  ): ChecksummedAddress[] {
    assertIsBytes65HexArray(signatures);
    const recoveredAddresses = signatures.map((signature: Bytes65Hex) => {
      const recoveredAddress = verifySignature({
        signature,
        domain: this.domain,
        types: KmsEIP712.#delegateUserDecryptTypes as unknown as Record<
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
