import type {
  Bytes65Hex,
  BytesHex,
  ChecksummedAddress,
  Uint32BigInt,
} from '@base/types/primitives';
import type { KmsEIP712Domain } from '@fhevm-base/types/public-api';
import type {
  KmsDelegateUserDecryptEIP712,
  KmsDelegateUserDecryptEIP712Types,
  KmsDelegateUserDecryptEIP712UserArgs,
  KmsEIP712Builder,
  KmsPublicDecryptEIP712,
  KmsPublicDecryptEIP712Types,
  KmsPublicDecryptEIP712UserArgs,
  KmsUserDecryptEIP712,
  KmsUserDecryptEIP712Types,
  KmsUserDecryptEIP712UserArgs,
} from './public-api';
import {
  addressToChecksummedAddress,
  asChecksummedAddress,
  assertIsAddress,
  assertIsAddressArray,
} from '@base/address';
import {
  asBytesHex,
  assertIsBytes32HexArray,
  assertIsBytes65HexArray,
  assertIsBytesHex,
  bytesToHexLarge,
} from '@base/bytes';
import type { EIP712Lib } from '@fhevm-base-types/public-api';
import { assertIsUintNumber, asUint32BigInt } from '@base/uint';
import { ensure0x } from '@base/string';

////////////////////////////////////////////////////////////////////////////////
// Private KmsEIP712Builer Class
////////////////////////////////////////////////////////////////////////////////

export class KmsEIP712BuilderImpl implements KmsEIP712Builder {
  readonly #domain: KmsEIP712Domain;

  static readonly #userDecryptTypes: KmsUserDecryptEIP712Types = {
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

  static readonly #delegateUserDecryptTypes: KmsDelegateUserDecryptEIP712Types =
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

  static readonly #publicDecryptTypes: KmsPublicDecryptEIP712Types = {
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
    Object.freeze(KmsEIP712BuilderImpl.#userDecryptTypes);
    Object.freeze(KmsEIP712BuilderImpl.#userDecryptTypes.EIP712Domain);
    Object.freeze(
      KmsEIP712BuilderImpl.#userDecryptTypes.UserDecryptRequestVerification,
    );

    Object.freeze(KmsEIP712BuilderImpl.#delegateUserDecryptTypes);
    Object.freeze(KmsEIP712BuilderImpl.#delegateUserDecryptTypes.EIP712Domain);
    Object.freeze(
      KmsEIP712BuilderImpl.#delegateUserDecryptTypes
        .DelegatedUserDecryptRequestVerification,
    );

    Object.freeze(KmsEIP712BuilderImpl.#publicDecryptTypes);
    Object.freeze(KmsEIP712BuilderImpl.#publicDecryptTypes.EIP712Domain);
    Object.freeze(
      KmsEIP712BuilderImpl.#publicDecryptTypes.PublicDecryptVerification,
    );
  }

  // Important remark concerning the chainId argument:
  // =================================================
  //
  // The chainId is general here!
  // - The Kms Nodes are using chainId = gatewayChainId (10900)
  // - The FhevmInstance is using chainId = host chainId (11155111)
  constructor(params: {
    readonly chainId: Uint32BigInt; // It's a general chainId! can be gateway or host.
    readonly verifyingContractAddressDecryption: ChecksummedAddress;
  }) {
    // the kms WASM package is expecting an uint32
    this.#domain = {
      name: 'Decryption',
      version: '1',
      chainId: params.chainId,
      verifyingContract: params.verifyingContractAddressDecryption,
    } as const;
    Object.freeze(this.#domain);
  }

  //////////////////////////////////////////////////////////////////////////////
  // Getters
  //////////////////////////////////////////////////////////////////////////////

  public get domain(): KmsEIP712Domain {
    return this.#domain;
  }

  public get chainId(): Uint32BigInt {
    return this.#domain.chainId as Uint32BigInt;
  }

  public get verifyingContractAddressDecryption(): ChecksummedAddress {
    return this.#domain.verifyingContract;
  }

  public get userDecryptTypes(): KmsUserDecryptEIP712Types {
    return KmsEIP712BuilderImpl.#userDecryptTypes;
  }

  public get publicDecryptTypes(): KmsPublicDecryptEIP712Types {
    return KmsEIP712BuilderImpl.#publicDecryptTypes;
  }

  public get delegateUserDecryptTypes(): KmsDelegateUserDecryptEIP712Types {
    return KmsEIP712BuilderImpl.#delegateUserDecryptTypes;
  }

  //////////////////////////////////////////////////////////////////////////////
  // createUserDecrypt
  //////////////////////////////////////////////////////////////////////////////

  public createUserDecrypt({
    publicKey,
    contractAddresses,
    startTimestamp,
    durationDays,
    extraData,
  }: KmsUserDecryptEIP712UserArgs): KmsUserDecryptEIP712 {
    const publicKeyBytesHex = _verifyPublicKeyArg(publicKey);

    assertIsAddressArray(contractAddresses, {});
    assertIsUintNumber(startTimestamp, {});
    assertIsUintNumber(durationDays, {});
    assertIsBytesHex(extraData, {});

    const checksummedContractAddresses = contractAddresses.map(
      addressToChecksummedAddress,
    );

    const primaryType: KmsUserDecryptEIP712['primaryType'] =
      'UserDecryptRequestVerification';

    const EIP712DomainType: KmsUserDecryptEIP712Types['EIP712Domain'] = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ] as const;

    const eip712: KmsUserDecryptEIP712 = {
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
      primaryType,
      domain: { ...this.domain },
      message: {
        publicKey: publicKeyBytesHex,
        contractAddresses: checksummedContractAddresses,
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

  //////////////////////////////////////////////////////////////////////////////
  // createDelegateUserDecrypt
  //////////////////////////////////////////////////////////////////////////////

  public createDelegateUserDecrypt({
    publicKey,
    contractAddresses,
    startTimestamp,
    durationDays,
    extraData,
    delegatedAccount,
  }: KmsDelegateUserDecryptEIP712UserArgs): KmsDelegateUserDecryptEIP712 {
    const publicKeyBytesHex = _verifyPublicKeyArg(publicKey);

    assertIsAddressArray(contractAddresses, {});
    assertIsUintNumber(startTimestamp, {});
    assertIsUintNumber(durationDays, {});
    assertIsBytesHex(extraData, {});
    assertIsAddress(delegatedAccount, {});

    const checksummedContractAddresses = contractAddresses.map(
      addressToChecksummedAddress,
    );

    const checksummedDelegatedAccount =
      addressToChecksummedAddress(delegatedAccount);

    const primaryType: KmsDelegateUserDecryptEIP712['primaryType'] =
      'DelegatedUserDecryptRequestVerification';

    const EIP712DomainType: KmsDelegateUserDecryptEIP712Types['EIP712Domain'] =
      [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ] as const;

    const eip712: KmsDelegateUserDecryptEIP712 = {
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
      primaryType,
      domain: { ...this.domain },
      message: {
        publicKey: publicKeyBytesHex,
        contractAddresses: checksummedContractAddresses,
        startTimestamp: startTimestamp.toString(),
        durationDays: durationDays.toString(),
        extraData,
        delegatedAccount: checksummedDelegatedAccount,
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

  //////////////////////////////////////////////////////////////////////////////
  // createPublicDecrypt
  //////////////////////////////////////////////////////////////////////////////

  public createPublicDecrypt({
    ctHandles,
    decryptedResult,
    extraData,
  }: KmsPublicDecryptEIP712UserArgs): KmsPublicDecryptEIP712 {
    assertIsBytes32HexArray(ctHandles, { subject: 'ctHandles' });
    assertIsBytesHex(decryptedResult, { subject: 'decryptedResult' });
    assertIsBytesHex(extraData, { subject: 'extraData' });

    const primaryType: KmsPublicDecryptEIP712['primaryType'] =
      'PublicDecryptVerification';

    const EIP712DomainType: KmsPublicDecryptEIP712Types['EIP712Domain'] = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ] as const;

    const eip712: KmsPublicDecryptEIP712 = {
      types: {
        EIP712Domain: EIP712DomainType,
        PublicDecryptVerification: [
          { name: 'ctHandles', type: 'bytes32[]' },
          { name: 'decryptedResult', type: 'bytes' },
          { name: 'extraData', type: 'bytes' },
        ] as const,
      },
      primaryType,
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

  //////////////////////////////////////////////////////////////////////////////
  // verifyPublicDecrypt
  //////////////////////////////////////////////////////////////////////////////

  public async verifyPublicDecrypt({
    signatures,
    message,
    verifier,
  }: {
    readonly signatures: readonly string[];
    readonly message: KmsPublicDecryptEIP712UserArgs;
    readonly verifier: EIP712Lib;
  }): Promise<ChecksummedAddress[]> {
    assertIsBytes65HexArray(signatures, { subject: 'signatures' });

    const primaryType: KmsPublicDecryptEIP712['primaryType'] =
      'PublicDecryptVerification';

    const recoveredAddresses = await Promise.all(
      signatures.map((signature: Bytes65Hex) =>
        verifier.recoverTypedDataAddress({
          signature,
          // force cast
          domain: this.domain as unknown as Parameters<
            EIP712Lib['recoverTypedDataAddress']
          >[0]['domain'],
          primaryType,
          types: {
            [primaryType]: [
              ...KmsEIP712BuilderImpl.#publicDecryptTypes[primaryType],
            ],
          },
          message: message as Record<string, unknown>,
        }),
      ),
    );

    return recoveredAddresses;
  }

  //////////////////////////////////////////////////////////////////////////////
  // verifyUserDecrypt
  //////////////////////////////////////////////////////////////////////////////

  public async verifyUserDecrypt({
    signatures,
    message,
    verifier,
  }: {
    readonly signatures: string[];
    readonly message: KmsUserDecryptEIP712UserArgs;
    readonly verifier: EIP712Lib;
  }): Promise<ChecksummedAddress[]> {
    assertIsBytes65HexArray(signatures, { subject: 'signatures' });

    const primaryType = 'UserDecryptRequestVerification';

    const recoveredAddresses = await Promise.all(
      signatures.map((signature: Bytes65Hex) =>
        verifier.recoverTypedDataAddress({
          signature,
          // force cast
          domain: this.domain as unknown as Parameters<
            EIP712Lib['recoverTypedDataAddress']
          >[0]['domain'],
          primaryType,
          types: {
            [primaryType]: [
              ...KmsEIP712BuilderImpl.#userDecryptTypes[primaryType],
            ],
          },
          message: message as Record<string, unknown>,
        }),
      ),
    );

    return recoveredAddresses;
  }

  //////////////////////////////////////////////////////////////////////////////
  // verifyDelegateUserDecrypt
  //////////////////////////////////////////////////////////////////////////////

  public async verifyDelegateUserDecrypt({
    signatures,
    message,
    verifier,
  }: {
    readonly signatures: string[];
    readonly message: KmsDelegateUserDecryptEIP712UserArgs;
    readonly verifier: EIP712Lib;
  }): Promise<ChecksummedAddress[]> {
    assertIsBytes65HexArray(signatures, { subject: 'signatures' });

    const primaryType = 'DelegatedUserDecryptRequestVerification';

    const recoveredAddresses = await Promise.all(
      signatures.map((signature: Bytes65Hex) =>
        verifier.recoverTypedDataAddress({
          signature,
          // force cast
          domain: this.domain as unknown as Parameters<
            EIP712Lib['recoverTypedDataAddress']
          >[0]['domain'],
          primaryType,
          types: {
            [primaryType]: [
              ...KmsEIP712BuilderImpl.#delegateUserDecryptTypes[primaryType],
            ],
          },
          message: message as Record<string, unknown>,
        }),
      ),
    );

    return recoveredAddresses;
  }
}

////////////////////////////////////////////////////////////////////////////////
// Public API
////////////////////////////////////////////////////////////////////////////////

export function createKmsEIP712Builder(params: {
  readonly chainId: bigint;
  readonly verifyingContractAddressDecryption: string;
}): KmsEIP712Builder {
  const chainId = asUint32BigInt(params.chainId);
  const verifyingContractAddressDecryption = asChecksummedAddress(
    params.verifyingContractAddressDecryption,
  );

  return new KmsEIP712BuilderImpl({
    chainId,
    verifyingContractAddressDecryption,
  });
}

//////////////////////////////////////////////////////////////////////////////
// Helpers
//////////////////////////////////////////////////////////////////////////////

function _verifyPublicKeyArg(value: unknown): BytesHex {
  if (value === null || value === undefined) {
    throw new Error(`Missing publicKey argument.`);
  }

  let publicKeyBytesHex: BytesHex;

  const pk = value;

  if (typeof pk === 'string') {
    publicKeyBytesHex = asBytesHex(ensure0x(pk));
  } else if (pk instanceof Uint8Array) {
    publicKeyBytesHex = bytesToHexLarge(pk);
  } else {
    throw new Error(`Invalid publicKey argument.`);
  }

  return publicKeyBytesHex;
}
