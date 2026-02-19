import type {
  Bytes65Hex,
  ChecksummedAddress,
  Uint256BigInt,
  Uint64BigInt,
} from '@base/types/primitives';
import type {
  CoprocessorEIP712,
  CoprocessorEIP712Domain,
  CoprocessorEIP712Message,
  CoprocessorEIP712Types,
  FhevmConfig,
  FhevmHandleLike,
} from '../types/public-api';
import type { EIP712Lib, FhevmLibs } from '@fhevm-base-types/public-api';
import type { ErrorMetadataParams } from '@base/errors/ErrorBase';
import {
  assertIsFhevmHandleLikeArray,
  fhevmHandleLikeToFhevmHandle,
} from '../FhevmHandle';
import {
  addressToChecksummedAddress,
  assertIsAddress,
  assertRecordChecksummedAddressProperty,
} from '@base/address';
import {
  assertIsUint256,
  assertIsUint64,
  assertRecordUintBigIntProperty,
} from '@base/uint';
import { assertIsBytes65HexArray, assertIsBytesHex } from '@base/bytes';
import { assertRecordStringProperty } from '@base/string';

////////////////////////////////////////////////////////////////////////////////
// CoprocessorEIP712Types
////////////////////////////////////////////////////////////////////////////////

/*
    const EIP712DomainType = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ];
*/

export const coprocessorEIP712PrimaryType =
  'CiphertextVerification' satisfies keyof CoprocessorEIP712Types;
export const coprocessorEIP712Types: CoprocessorEIP712Types = {
  // EIP712Domain: [
  //   { name: 'name', type: 'string' },
  //   { name: 'version', type: 'string' },
  //   { name: 'chainId', type: 'uint256' },
  //   { name: 'verifyingContract', type: 'address' },
  // ] as const,
  CiphertextVerification: [
    { name: 'ctHandles', type: 'bytes32[]' },
    { name: 'userAddress', type: 'address' },
    { name: 'contractAddress', type: 'address' },
    { name: 'contractChainId', type: 'uint256' },
    { name: 'extraData', type: 'bytes' },
  ],
} as const;
Object.freeze(coprocessorEIP712Types);
Object.freeze(coprocessorEIP712Types.CiphertextVerification);
coprocessorEIP712Types.CiphertextVerification.forEach(Object.freeze);

////////////////////////////////////////////////////////////////////////////////
// createCoprocessorEIP712
////////////////////////////////////////////////////////////////////////////////

export function createCoprocessorEIP712(
  fhevm: { readonly config: FhevmConfig },
  {
    handles,
    contractChainId,
    contractAddress,
    userAddress,
    extraData,
  }: {
    readonly handles: readonly FhevmHandleLike[];
    readonly contractChainId: number | bigint;
    readonly contractAddress: string;
    readonly userAddress: string;
    readonly extraData: string;
  },
): CoprocessorEIP712 {
  assertIsFhevmHandleLikeArray(handles, {});
  assertIsAddress(userAddress, {});
  assertIsAddress(contractAddress, {});
  assertIsUint256(contractChainId, {});
  assertIsBytesHex(extraData, {});

  const domain = _createCoprocessorEIP712Domain(fhevm.config.inputVerifier);

  const eip712 = {
    domain,
    types: coprocessorEIP712Types,
    message: {
      ctHandles: handles.map((h) => {
        return fhevmHandleLikeToFhevmHandle(h).bytes32Hex;
      }),
      userAddress: addressToChecksummedAddress(userAddress),
      contractAddress: addressToChecksummedAddress(contractAddress),
      contractChainId: BigInt(contractChainId) as Uint256BigInt,
      extraData,
    },
  };

  Object.freeze(eip712);
  Object.freeze(eip712.domain);
  Object.freeze(eip712.types);
  Object.freeze(eip712.types.CiphertextVerification);
  Object.freeze(eip712.message);
  Object.freeze(eip712.message.ctHandles);

  return eip712;
}

////////////////////////////////////////////////////////////////////////////////
// Assert
////////////////////////////////////////////////////////////////////////////////

export function assertIsCoprocessorEIP712Domain(
  value: unknown,
  name: string,
  options: ErrorMetadataParams,
): asserts value is CoprocessorEIP712Domain {
  type T = CoprocessorEIP712Domain;
  assertRecordStringProperty(value, 'name' satisfies keyof T, name, {
    expectedValue: 'InputVerification' satisfies T['name'],
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

////////////////////////////////////////////////////////////////////////////////
// Private Helpers
////////////////////////////////////////////////////////////////////////////////

function _createCoprocessorEIP712Domain({
  gatewayChainId,
  verifyingContractAddressInputVerification,
}: {
  gatewayChainId: number | bigint;
  verifyingContractAddressInputVerification: string;
}): CoprocessorEIP712Domain {
  assertIsUint64(gatewayChainId, {});
  assertIsAddress(verifyingContractAddressInputVerification, {});

  const domain = {
    name: 'InputVerification',
    version: '1',
    chainId: BigInt(gatewayChainId) as Uint64BigInt,
    verifyingContract: addressToChecksummedAddress(
      verifyingContractAddressInputVerification,
    ),
  } as const;
  Object.freeze(domain);

  return domain;
}

export async function recoverCoprocessorEIP712Signers(
  fhevm: {
    readonly libs: { readonly eip712Lib: EIP712Lib };
  },
  {
    domain,
    message,
    signatures,
  }: {
    readonly domain: CoprocessorEIP712Domain;
    readonly signatures: readonly string[];
    readonly message: CoprocessorEIP712Message;
  },
): Promise<ChecksummedAddress[]> {
  assertIsBytes65HexArray(signatures, {});

  // If primaryType is specified, filter types to only include the primary type
  // This ensures ethers uses the correct primary type for signing
  const primaryType = coprocessorEIP712PrimaryType;

  const recoveredAddresses = await Promise.all(
    signatures.map((signature: Bytes65Hex) =>
      fhevm.libs.eip712Lib.recoverTypedDataAddress({
        signature,
        // force cast
        domain: domain as unknown as Parameters<
          FhevmLibs['eip712Lib']['recoverTypedDataAddress']
        >[0]['domain'],
        primaryType,
        types: { [primaryType]: [...coprocessorEIP712Types[primaryType]] },
        message: message as Record<string, unknown>,
      }),
    ),
  );

  return recoveredAddresses;
}
