import { assertIsUint256, assertIsUint32 } from '../../utils/uint';
import {
  assertIsChecksummedAddress,
  assertIsChecksummedAddressArray,
} from '../../utils/address';
import { assertIsBytes65HexArray, assertIsBytesHex } from '../../utils/bytes';
import { Prettify } from '../../utils/types';
import type { ethers as EthersT } from 'ethers';
import { verifySignature } from '../../utils/signature';
import {
  Bytes65Hex,
  BytesHex,
  ChecksummedAddress,
} from '../../types/primitives';

////////////////////////////////////////////////////////////////////////////////
// KmsEIP712 Types
////////////////////////////////////////////////////////////////////////////////

export type KmsEIP712Params = {
  chainId: number;
  verifyingContractAddressDecryption: ChecksummedAddress;
};

export type KmsEIP712DomainType = {
  readonly name: 'Decryption';
  readonly version: '1';
  chainId: number;
  verifyingContract: ChecksummedAddress;
};

export type KmsEIP712UserArgsType = {
  publicKey: BytesHex;
  contractAddresses: ChecksummedAddress[];
  startTimestamp: number | bigint;
  durationDays: number | bigint;
  extraData: BytesHex;
};

export type KmsEIP712MessageType = {
  publicKey: BytesHex;
  contractAddresses: ChecksummedAddress[];
  startTimestamp: string;
  durationDays: string;
  extraData: BytesHex;
};

export type KmsDelegateEIP712UserArgsType = Prettify<
  KmsEIP712UserArgsType & {
    delegatedAccount: ChecksummedAddress;
  }
>;

export type KmsDelegateEIP712MessageType = Prettify<
  KmsEIP712MessageType & {
    delegatedAccount: ChecksummedAddress;
  }
>;

export type KmsDelegateEIP712TypesType = {
  EIP712Domain: readonly [
    { readonly name: 'name'; readonly type: 'string' },
    { readonly name: 'version'; readonly type: 'string' },
    { readonly name: 'chainId'; readonly type: 'uint256' },
    { readonly name: 'verifyingContract'; readonly type: 'address' },
  ];
  DelegatedUserDecryptRequestVerification: readonly [
    { readonly name: 'publicKey'; readonly type: 'bytes' },
    { readonly name: 'contractAddresses'; readonly type: 'address[]' },
    { readonly name: 'startTimestamp'; readonly type: 'uint256' },
    { readonly name: 'durationDays'; readonly type: 'uint256' },
    { readonly name: 'extraData'; readonly type: 'bytes' },
    { readonly name: 'delegatedAccount'; readonly type: 'address' },
  ];
};

export type KmsEIP712TypesType = {
  EIP712Domain: readonly [
    { readonly name: 'name'; readonly type: 'string' },
    { readonly name: 'version'; readonly type: 'string' },
    { readonly name: 'chainId'; readonly type: 'uint256' },
    { readonly name: 'verifyingContract'; readonly type: 'address' },
  ];
  UserDecryptRequestVerification: readonly [
    { readonly name: 'publicKey'; readonly type: 'bytes' },
    { readonly name: 'contractAddresses'; readonly type: 'address[]' },
    { readonly name: 'startTimestamp'; readonly type: 'uint256' },
    { readonly name: 'durationDays'; readonly type: 'uint256' },
    { readonly name: 'extraData'; readonly type: 'bytes' },
  ];
};

export type KmsDelegateEIP712Type = {
  types: KmsDelegateEIP712TypesType;
  primaryType: 'DelegatedUserDecryptRequestVerification';
  domain: KmsEIP712DomainType;
  message: KmsDelegateEIP712MessageType;
};

export type KmsEIP712Type = {
  types: KmsEIP712TypesType;
  primaryType: 'UserDecryptRequestVerification';
  domain: KmsEIP712DomainType;
  message: KmsEIP712MessageType;
};

////////////////////////////////////////////////////////////////////////////////
// KmsEIP712 Class
////////////////////////////////////////////////////////////////////////////////

export class KmsEIP712 {
  public readonly domain: KmsEIP712DomainType;
  private static types: KmsEIP712TypesType = {
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
  private static delegateTypes: KmsDelegateEIP712TypesType = {
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
    Object.freeze(KmsEIP712.types);
    Object.freeze(KmsEIP712.types.EIP712Domain);
    Object.freeze(KmsEIP712.types.UserDecryptRequestVerification);

    Object.freeze(KmsEIP712.delegateTypes);
    Object.freeze(KmsEIP712.delegateTypes.EIP712Domain);
    Object.freeze(
      KmsEIP712.delegateTypes.DelegatedUserDecryptRequestVerification,
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

  public verify(signatures: Bytes65Hex[], message: KmsEIP712UserArgsType) {
    assertIsBytes65HexArray(signatures);
    const recoveredAddresses = signatures.map((signature: Bytes65Hex) => {
      const recoveredAddress = verifySignature({
        signature,
        domain: this.domain,
        types: KmsEIP712.types as any as Record<
          string,
          Array<EthersT.TypedDataField>
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
  ) {
    assertIsBytes65HexArray(signatures);
    const recoveredAddresses = signatures.map((signature: Bytes65Hex) => {
      const recoveredAddress = verifySignature({
        signature,
        domain: this.domain,
        types: KmsEIP712.delegateTypes as any as Record<
          string,
          Array<EthersT.TypedDataField>
        >,
        message,
        primaryType: 'DelegatedUserDecryptRequestVerification',
      });
      return recoveredAddress;
    });
    return recoveredAddresses;
  }
}
