import type {
  Bytes32Hex,
  Bytes65Hex,
  BytesHex,
  ChecksummedAddress,
  Uint64BigInt,
  UintNumber,
} from '@base/types/primitives';
import type {
  FhevmConfig,
  FhevmHandle,
  FhevmHandleLike,
  KmsDelegatedUserDecryptEIP712,
  KmsDelegateUserDecryptEIP712Types,
  KmsEIP712Domain,
  KmsPublicDecryptEIP712,
  KmsPublicDecryptEIP712Message,
  KmsPublicDecryptEIP712Types,
  KmsUserDecryptEIP712,
  KmsUserDecryptEIP712Message,
  KmsUserDecryptEIP712Types,
} from '@fhevm-base/types/public-api';
import type { EIP712Lib } from '@fhevm-base-types/public-api';
import {
  addressToChecksummedAddress,
  assertIsAddress,
  assertIsAddressArray,
} from '@base/address';
import {
  asBytesHex,
  assertIsBytes65HexArray,
  assertIsBytesHex,
  bytesToHexLarge,
} from '@base/bytes';
import { ensure0x } from '@base/string';
import { assertIsUint64, assertIsUintNumber } from '@base/uint';
import {
  assertIsFhevmHandleLikeArray,
  fhevmHandleLikeToFhevmHandle,
} from '@fhevm-base/FhevmHandle';
import { assertKmsSignerThreshold } from '../host-contracts/KMSVerifierContractData';
import {
  ThresholdSignerError,
  UnknownSignerError,
} from '@fhevm-base/errors/SignersError';

/*
    See: in KMS (eip712Domain)
    json.response[i].signature is an eip712 sig potentially on this message:

    struct UserDecryptResponseVerification {
        bytes publicKey;
        bytes32[] ctHandles;
        bytes userDecryptedShare;
        bytes extraData;
    }
}    
*/

////////////////////////////////////////////////////////////////////////////////
// KmsUserDecryptEIP712Types
////////////////////////////////////////////////////////////////////////////////

export const kmsUserDecryptEIP712Types: KmsUserDecryptEIP712Types = {
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

Object.freeze(kmsUserDecryptEIP712Types);
Object.freeze(kmsUserDecryptEIP712Types.EIP712Domain);
Object.freeze(kmsUserDecryptEIP712Types.UserDecryptRequestVerification);
kmsUserDecryptEIP712Types.EIP712Domain.forEach(Object.freeze);
kmsUserDecryptEIP712Types.UserDecryptRequestVerification.forEach(Object.freeze);

////////////////////////////////////////////////////////////////////////////////
// KmsUserDecryptEIP712Types
////////////////////////////////////////////////////////////////////////////////

export const kmsDelegatedUserDecryptEIP712Types: KmsDelegateUserDecryptEIP712Types =
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

Object.freeze(kmsDelegatedUserDecryptEIP712Types);
Object.freeze(kmsDelegatedUserDecryptEIP712Types.EIP712Domain);
Object.freeze(
  kmsDelegatedUserDecryptEIP712Types.DelegatedUserDecryptRequestVerification,
);
kmsDelegatedUserDecryptEIP712Types.EIP712Domain.forEach(Object.freeze);
kmsDelegatedUserDecryptEIP712Types.DelegatedUserDecryptRequestVerification.forEach(
  Object.freeze,
);

////////////////////////////////////////////////////////////////////////////////
// KmsPublicDecryptEIP712Types
////////////////////////////////////////////////////////////////////////////////

export const kmsPublicDecryptEIP712Types: KmsPublicDecryptEIP712Types = {
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

Object.freeze(kmsPublicDecryptEIP712Types);
Object.freeze(kmsPublicDecryptEIP712Types.EIP712Domain);
Object.freeze(kmsPublicDecryptEIP712Types.PublicDecryptVerification);
kmsPublicDecryptEIP712Types.EIP712Domain.forEach(Object.freeze);
kmsPublicDecryptEIP712Types.PublicDecryptVerification.forEach(Object.freeze);

////////////////////////////////////////////////////////////////////////////////
// createKmsUserDecryptEIP712
////////////////////////////////////////////////////////////////////////////////

export function createKmsUserDecryptEIP712(
  fhevm: { readonly config: FhevmConfig },
  {
    publicKey,
    contractAddresses,
    startTimestamp,
    durationDays,
    extraData,
  }: {
    readonly publicKey: string | Uint8Array;
    readonly contractAddresses: readonly string[];
    readonly startTimestamp: number;
    readonly durationDays: number;
    readonly extraData: string;
  },
): KmsUserDecryptEIP712 {
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

  const domain = _createKmsEIP712Domain({
    chainId: fhevm.config.hostChainConfig.chainId,
    verifyingContractAddressDecryption:
      fhevm.config.kmsVerifier.verifyingContractAddressDecryption,
  });

  const eip712 = {
    domain,
    types: kmsUserDecryptEIP712Types,
    primaryType,
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
// createKmsDelegatedUserDecryptEIP712
//////////////////////////////////////////////////////////////////////////////

export function createKmsDelegatedUserDecryptEIP712(
  fhevm: { readonly config: FhevmConfig },
  {
    publicKey,
    contractAddresses,
    startTimestamp,
    durationDays,
    extraData,
    delegatedAccount,
  }: {
    readonly publicKey: string | Uint8Array;
    readonly contractAddresses: readonly string[];
    readonly startTimestamp: number;
    readonly durationDays: number;
    readonly extraData: string;
    readonly delegatedAccount: string;
  },
): KmsDelegatedUserDecryptEIP712 {
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

  const primaryType: KmsDelegatedUserDecryptEIP712['primaryType'] =
    'DelegatedUserDecryptRequestVerification';

  const domain = _createKmsEIP712Domain({
    chainId: fhevm.config.hostChainConfig.chainId,
    verifyingContractAddressDecryption:
      fhevm.config.kmsVerifier.verifyingContractAddressDecryption,
  });

  const eip712: KmsDelegatedUserDecryptEIP712 = {
    types: kmsDelegatedUserDecryptEIP712Types,
    primaryType,
    domain,
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
// createKmsPublicDecryptEIP712
//////////////////////////////////////////////////////////////////////////////

export function createKmsPublicDecryptEIP712(
  fhevm: { readonly config: FhevmConfig },
  {
    handles,
    decryptedResult,
    extraData,
  }: {
    readonly handles: readonly FhevmHandleLike[];
    readonly decryptedResult: string;
    readonly extraData: string;
  },
): KmsPublicDecryptEIP712 {
  assertIsFhevmHandleLikeArray(handles, {});
  assertIsBytesHex(decryptedResult, {});
  assertIsBytesHex(extraData, {});

  const primaryType: KmsPublicDecryptEIP712['primaryType'] =
    'PublicDecryptVerification';

  const domain = _createKmsEIP712Domain({
    chainId: fhevm.config.hostChainConfig.chainId,
    verifyingContractAddressDecryption:
      fhevm.config.kmsVerifier.verifyingContractAddressDecryption,
  });

  const eip712: KmsPublicDecryptEIP712 = {
    types: kmsPublicDecryptEIP712Types,
    primaryType,
    domain,
    message: {
      ctHandles: handles.map((h) => {
        return fhevmHandleLikeToFhevmHandle(h).bytes32Hex;
      }),
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

export async function verifyKmsPublicDecryptEIP712(
  fhevm: {
    readonly libs: { readonly eip712Lib: EIP712Lib };
    readonly config: FhevmConfig;
  },
  args: {
    readonly orderedHandles: readonly FhevmHandle[];
    readonly orderedAbiEncodedClearValues: BytesHex;
    readonly kmsPublicDecryptEIP712Signatures: readonly Bytes65Hex[];
    readonly extraData: BytesHex;
  },
): Promise<void> {
  const handlesBytes32Hex: readonly Bytes32Hex[] = args.orderedHandles.map(
    (h) => h.bytes32Hex,
  );

  const message: KmsPublicDecryptEIP712Message = {
    ctHandles: handlesBytes32Hex,
    decryptedResult: args.orderedAbiEncodedClearValues,
    extraData: args.extraData,
  };

  const domain = _createKmsEIP712Domain({
    chainId: fhevm.config.hostChainConfig.chainId,
    verifyingContractAddressDecryption:
      fhevm.config.kmsVerifier.verifyingContractAddressDecryption,
  });

  // 1. Verify signatures
  const recoveredAddresses = await _recoverKmsPublicDecryptEIP712Signers(
    fhevm,
    {
      domain,
      signatures: args.kmsPublicDecryptEIP712Signatures,
      message,
    },
  );

  // 2. Verify signature theshold is reached
  assertKmsSignerThreshold(fhevm.config.kmsVerifier, recoveredAddresses);
}

export async function verifyKmsUserDecryptEIP712(
  fhevm: {
    readonly libs: { readonly eip712Lib: EIP712Lib };
    readonly config: FhevmConfig;
  },
  args: {
    readonly signer: ChecksummedAddress;
    readonly message: KmsUserDecryptEIP712Message;
    readonly signature: Bytes65Hex;
  },
): Promise<void> {
  const domain = _createKmsEIP712Domain({
    chainId: fhevm.config.hostChainConfig.chainId,
    verifyingContractAddressDecryption:
      fhevm.config.kmsVerifier.verifyingContractAddressDecryption,
  });

  const recoveredAddresses = await _recoverKmsUserDecryptEIP712Signers(fhevm, {
    domain,
    signatures: [args.signature],
    message: args.message,
  });

  if (recoveredAddresses.length !== 1) {
    throw new ThresholdSignerError({
      type: 'kms',
    });
  }

  if (recoveredAddresses[0] !== args.signer) {
    throw new UnknownSignerError({
      unknownAddress: recoveredAddresses[0],
      type: 'kms',
    });
  }
}

//////////////////////////////////////////////////////////////////////////////
// Private Helpers
//////////////////////////////////////////////////////////////////////////////

function _createKmsEIP712Domain({
  chainId, // any chainId could be host or gateway
  verifyingContractAddressDecryption,
}: {
  chainId: number | bigint;
  verifyingContractAddressDecryption: string;
}): KmsEIP712Domain {
  assertIsUint64(chainId, {});
  assertIsAddress(verifyingContractAddressDecryption, {});

  const domain = {
    name: 'Decryption',
    version: '1',
    chainId: BigInt(chainId) as Uint64BigInt,
    verifyingContract: addressToChecksummedAddress(
      verifyingContractAddressDecryption,
    ),
  } as const;
  Object.freeze(domain);

  return domain;
}

////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////

async function _recoverKmsUserDecryptEIP712Signers(
  fhevm: {
    readonly libs: { readonly eip712Lib: EIP712Lib };
  },
  {
    domain,
    signatures,
    message,
  }: {
    readonly domain: KmsEIP712Domain;
    readonly signatures: readonly string[];
    readonly message: KmsUserDecryptEIP712Message;
  },
): Promise<ChecksummedAddress[]> {
  return await _recoverKmsEIP712Signers(fhevm, {
    domain,
    types: kmsUserDecryptEIP712Types,
    primaryType: 'UserDecryptRequestVerification',
    signatures,
    message,
  });
}

////////////////////////////////////////////////////////////////////////////////
// TODO
// async function _recoverKmsDelegatedUserDecryptEIP712Signers(
//   fhevm: {
//     readonly libs: { readonly eip712Lib: EIP712Lib };
//   },
//   {
//     domain,
//     signatures,
//     message,
//   }: {
//     readonly domain: KmsEIP712Domain;
//     readonly signatures: readonly string[];
//     readonly message: KmsDelegatedUserDecryptEIP712Message;
//   },
// ): Promise<ChecksummedAddress[]> {
//   return await _recoverKmsEIP712Signers(fhevm, {
//     domain,
//     types: kmsDelegatedUserDecryptEIP712Types,
//     primaryType: 'DelegatedUserDecryptRequestVerification',
//     signatures,
//     message,
//   });
// }

////////////////////////////////////////////////////////////////////////////////

async function _recoverKmsPublicDecryptEIP712Signers(
  fhevm: {
    readonly libs: { readonly eip712Lib: EIP712Lib };
  },
  {
    domain,
    signatures,
    message,
  }: {
    readonly domain: KmsEIP712Domain;
    readonly signatures: readonly string[];
    readonly message: KmsPublicDecryptEIP712Message;
  },
): Promise<ChecksummedAddress[]> {
  return await _recoverKmsEIP712Signers(fhevm, {
    domain,
    types: kmsPublicDecryptEIP712Types,
    primaryType: 'PublicDecryptVerification',
    signatures,
    message,
  });
}

////////////////////////////////////////////////////////////////////////////////

async function _recoverKmsEIP712Signers<
  T extends Record<string, ReadonlyArray<{ name: string; type: string }>>,
>(
  fhevm: {
    readonly libs: { readonly eip712Lib: EIP712Lib };
  },
  {
    domain,
    types,
    primaryType,
    signatures,
    message,
  }: {
    readonly domain: KmsEIP712Domain;
    readonly types: T;
    readonly primaryType: string & keyof T;
    readonly signatures: readonly string[];
    readonly message: Record<string, unknown>;
  },
): Promise<ChecksummedAddress[]> {
  assertIsBytes65HexArray(signatures, { subject: 'signatures' });

  const recoveredAddresses = await Promise.all(
    signatures.map((signature: Bytes65Hex) =>
      fhevm.libs.eip712Lib.recoverTypedDataAddress({
        signature,
        // force cast
        domain: domain as unknown as Parameters<
          EIP712Lib['recoverTypedDataAddress']
        >[0]['domain'],
        primaryType,
        types: {
          [primaryType]: [...types[primaryType]],
        },
        message,
      }),
    ),
  );

  return recoveredAddresses;
}

export function assertKmsEIP712DeadlineValidity(
  {
    startTimestamp,
    durationDays,
  }: {
    startTimestamp: bigint | number | string;
    durationDays: bigint | number | string;
  },
  maxDurationDays: UintNumber,
): void {
  if (durationDays === 0) {
    throw Error('durationDays is null');
  }

  const durationDaysBigInt = BigInt(durationDays);
  if (durationDaysBigInt > BigInt(maxDurationDays)) {
    throw Error(`durationDays is above max duration of ${maxDurationDays}`);
  }

  const startTimestampBigInt = BigInt(startTimestamp);

  const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
  if (startTimestampBigInt > currentTimestamp) {
    throw Error('startTimestamp is set in the future');
  }

  const durationInSeconds = durationDaysBigInt * BigInt(86400);
  if (startTimestampBigInt + durationInSeconds < currentTimestamp) {
    throw Error('request has expired');
  }
}

/*
//   assertIsBytes65HexArray(signatures, {});

//   // If primaryType is specified, filter types to only include the primary type
//   // This ensures ethers uses the correct primary type for signing
//   const primaryType = coprocessorEIP712PrimaryType;

//   const recoveredAddresses = await Promise.all(
//     signatures.map((signature: Bytes65Hex) =>
//       fhevm.libs.eip712Lib.recoverTypedDataAddress({
//         signature,
//         // force cast
//         domain: domain as unknown as Parameters<
//           FhevmLibs['eip712Lib']['recoverTypedDataAddress']
//         >[0]['domain'],
//         primaryType,
//         types: { [primaryType]: [...coprocessorEIP712Types[primaryType]] },
//         message: message as Record<string, unknown>,
//       }),
//     ),
//   );

//   return recoveredAddresses;

*/

// ////////////////////////////////////////////////////////////////////////////////
// // Verify
// ////////////////////////////////////////////////////////////////////////////////

// export async function verifyFhevmHandles(
//   fhevm: {
//     readonly libs: { readonly eip712Lib: EIP712Lib };
//     readonly config: FhevmConfig;
//   },
//   args: {
//     readonly signatures: readonly Bytes65Hex[];
//     readonly handles: readonly FhevmHandle[];
//     readonly userAddress: ChecksummedAddress;
//     readonly contractAddress: ChecksummedAddress;
//     readonly chainId: UintBigInt;
//     readonly extraData: BytesHex;
//   },
// ): Promise<void> {
//   const handlesBytes32: Bytes32[] = args.handles.map((h) => h.bytes32);

//   const message: CoprocessorEIP712Message = {
//     ctHandles: handlesBytes32,
//     userAddress: args.userAddress,
//     contractAddress: args.contractAddress,
//     contractChainId: args.chainId,
//     extraData: args.extraData,
//   };

//   // 1. Verify signatures
//   const recoveredAddresses = await _recoverCoprocessorEIP712Signers(fhevm, {
//     domain: fhevm.config.inputVerifier.eip712Domain,
//     signatures: args.signatures,
//     message,
//   });

//   // 2. Verify signature theshold is reached
//   assertCoprocessorSignerThreshold(
//     fhevm.config.inputVerifier,
//     recoveredAddresses,
//   );
// }

// ////////////////////////////////////////////////////////////////////////////////
// // Assert
// ////////////////////////////////////////////////////////////////////////////////

// export function assertIsCoprocessorEIP712Domain(
//   value: unknown,
//   name: string,
//   options: ErrorMetadataParams,
// ): asserts value is CoprocessorEIP712Domain {
//   type T = CoprocessorEIP712Domain;
//   assertRecordStringProperty(value, 'name' satisfies keyof T, name, {
//     expectedValue: 'InputVerification' satisfies T['name'],
//     ...options,
//   });
//   assertRecordStringProperty(value, 'version' satisfies keyof T, name, {
//     expectedValue: '1' satisfies T['version'],
//     ...options,
//   });
//   assertRecordUintBigIntProperty(
//     value,
//     'chainId' satisfies keyof T,
//     name,
//     options,
//   );
//   assertRecordChecksummedAddressProperty(
//     value,
//     'verifyingContract' satisfies keyof T,
//     name,
//     options,
//   );
// }

// ////////////////////////////////////////////////////////////////////////////////
// // Private Helpers
// ////////////////////////////////////////////////////////////////////////////////

// async function _recoverCoprocessorEIP712Signers(
//   fhevm: {
//     readonly libs: { readonly eip712Lib: EIP712Lib };
//   },
//   {
//     domain,
//     message,
//     signatures,
//   }: {
//     readonly domain: CoprocessorEIP712Domain;
//     readonly signatures: readonly string[];
//     readonly message: CoprocessorEIP712Message;
//   },
// ): Promise<ChecksummedAddress[]> {
//   assertIsBytes65HexArray(signatures, {});

//   // If primaryType is specified, filter types to only include the primary type
//   // This ensures ethers uses the correct primary type for signing
//   const primaryType = coprocessorEIP712PrimaryType;

//   const recoveredAddresses = await Promise.all(
//     signatures.map((signature: Bytes65Hex) =>
//       fhevm.libs.eip712Lib.recoverTypedDataAddress({
//         signature,
//         // force cast
//         domain: domain as unknown as Parameters<
//           FhevmLibs['eip712Lib']['recoverTypedDataAddress']
//         >[0]['domain'],
//         primaryType,
//         types: { [primaryType]: [...coprocessorEIP712Types[primaryType]] },
//         message: message as Record<string, unknown>,
//       }),
//     ),
//   );

//   return recoveredAddresses;
// }
