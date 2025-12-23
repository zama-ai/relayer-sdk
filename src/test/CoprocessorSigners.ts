import { assertIsUint, uintToHexNo0x } from '../utils/uint';
import { assertIsChecksummedAddress } from '../utils/address';
import {
  assertIsBytes32HexArray,
  assertIsBytes65HexArray,
  assertIsBytesHex,
} from '../utils/bytes';
import { remove0x } from '../utils/string';
import { assertRelayer } from '../errors/InternalError';
import { ethers, Wallet } from 'ethers';
import { multiSignEIP712 } from './eip712';
import {
  Bytes32Hex,
  Bytes32HexNo0x,
  Bytes65Hex,
  BytesHex,
  BytesHexNo0x,
  ChecksummedAddress,
} from '../types/primitives';

// cast wallet address 0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef
// 0xC96aAa54E2d44c299564da76e1cD3184A2386B8D
export class CoprocessorSigners {
  private _gatewayChainId: number;
  private _verifyingContractAddressInputVerification: ChecksummedAddress;
  private _coprocessorSigners: ethers.Signer[];
  private _coprocessorSignersAddresses: ChecksummedAddress[];

  constructor({
    gatewayChainId,
    verifyingContractAddressInputVerification,
    coprocessorSigners,
    coprocessorSignersAddresses,
  }: {
    gatewayChainId: number;
    verifyingContractAddressInputVerification: ChecksummedAddress;
    coprocessorSigners?: ethers.Signer[];
    coprocessorSignersAddresses?: ChecksummedAddress[];
  }) {
    assertIsUint(gatewayChainId);
    assertIsChecksummedAddress(verifyingContractAddressInputVerification);
    this._gatewayChainId = gatewayChainId;
    this._verifyingContractAddressInputVerification =
      verifyingContractAddressInputVerification;

    if (coprocessorSigners === undefined) {
      const w = new Wallet(
        '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
      );

      this._coprocessorSigners = [w];
      this._coprocessorSignersAddresses = [w.address as ChecksummedAddress];
    } else {
      assertRelayer(
        coprocessorSigners.length === coprocessorSignersAddresses?.length,
      );
      this._coprocessorSigners = [...coprocessorSigners];
      this._coprocessorSignersAddresses = [...coprocessorSignersAddresses];
    }
  }

  public get addresses(): ChecksummedAddress[] {
    return this._coprocessorSignersAddresses;
  }

  public createCiphertextVerificationEIP712({
    handlesBytes32HexList,
    contractChainId,
    contractAddress,
    userAddress,
    extraData,
  }: {
    handlesBytes32HexList: Bytes32Hex[];
    contractChainId: number;
    contractAddress: ChecksummedAddress;
    userAddress: ChecksummedAddress;
    extraData: BytesHex;
  }) {
    assertIsBytes32HexArray(handlesBytes32HexList);
    assertIsChecksummedAddress(userAddress);
    assertIsChecksummedAddress(contractAddress);
    assertIsUint(contractChainId);
    assertIsBytesHex(extraData);

    return this._createCiphertextVerificationEIP712({
      handlesBytes32HexList,
      contractChainId,
      contractAddress,
      userAddress,
      extraData,
    });
  }

  private _createCiphertextVerificationEIP712({
    handlesBytes32HexList,
    contractChainId,
    contractAddress,
    userAddress,
    extraData,
  }: {
    handlesBytes32HexList: Bytes32Hex[];
    contractChainId: number;
    contractAddress: ChecksummedAddress;
    userAddress: ChecksummedAddress;
    extraData: BytesHex;
  }) {
    const domain = {
      name: 'InputVerification',
      version: '1',
      chainId: this._gatewayChainId,
      verifyingContract: this._verifyingContractAddressInputVerification,
    };

    const eip712 = {
      domain: {
        chainId: domain.chainId,
        name: domain.name,
        version: domain.version,
        verifyingContract: domain.verifyingContract,
      },
      types: {
        CiphertextVerification: [
          {
            name: 'ctHandles',
            type: 'bytes32[]',
          },
          {
            name: 'userAddress',
            type: 'address',
          },
          {
            name: 'contractAddress',
            type: 'address',
          },
          {
            name: 'contractChainId',
            type: 'uint256',
          },
          {
            name: 'extraData',
            type: 'bytes',
          },
        ],
      },
      message: {
        ctHandles: handlesBytes32HexList,
        userAddress: userAddress,
        contractAddress: contractAddress,
        contractChainId: contractChainId,
        extraData,
      },
    };

    return eip712;
  }

  public computeInputProofHex({
    handlesBytes32HexList,
    coprocessorsSignaturesHex,
    extraData,
  }: {
    handlesBytes32HexList: Bytes32Hex[];
    coprocessorsSignaturesHex: Bytes65Hex[];
    extraData: BytesHex;
  }): BytesHex {
    assertIsBytes32HexArray(handlesBytes32HexList);
    assertIsBytes65HexArray(coprocessorsSignaturesHex);
    assertIsBytesHex(extraData);

    const numHandles = handlesBytes32HexList.length;
    const numCoprocessorSigners = coprocessorsSignaturesHex.length;

    const numHandlesHexByte1 = uintToHexNo0x(numHandles);
    assertRelayer(numHandlesHexByte1.length === 2); // 1 byte

    const numCoprocessorSignersHexByte1 = uintToHexNo0x(numCoprocessorSigners);
    assertRelayer(numCoprocessorSignersHexByte1.length === 2); // 1 byte

    // Compute inputProof
    let inputProofHex: BytesHex = `0x${numHandlesHexByte1}${numCoprocessorSignersHexByte1}`;

    // Append the list of handles
    for (let i = 0; i < numHandles; ++i) {
      const handlesBytes32HexNoPrefix = remove0x(handlesBytes32HexList[i]);
      assertRelayer(handlesBytes32HexNoPrefix.length === 2 * 32);
      inputProofHex += handlesBytes32HexNoPrefix;
    }

    // Append list of coprocessor signatures
    coprocessorsSignaturesHex.map((signatureHex) => {
      const signatureBytes65HexNoPrefix = remove0x(signatureHex);
      inputProofHex += signatureBytes65HexNoPrefix;
    });

    // Append the extra data to the input proof
    inputProofHex = ethers.concat([inputProofHex, extraData]) as BytesHex;
    assertRelayer(inputProofHex === inputProofHex + remove0x(extraData));

    return inputProofHex;
  }

  public async computeSignatures({
    handlesBytes32HexList,
    contractChainId,
    contractAddress,
    userAddress,
    extraData,
  }: {
    handlesBytes32HexList: Bytes32Hex[];
    contractChainId: number;
    contractAddress: ChecksummedAddress;
    userAddress: ChecksummedAddress;
    extraData: BytesHex;
  }): Promise<{
    handles: Bytes32HexNo0x[];
    signatures: BytesHexNo0x[];
  }> {
    assertIsBytes32HexArray(handlesBytes32HexList);
    assertIsChecksummedAddress(userAddress);
    assertIsChecksummedAddress(contractAddress);
    assertIsUint(contractChainId);
    assertIsBytesHex(extraData);

    const numHandles = handlesBytes32HexList.length;

    const handlesBytes32HexNoPrefixList: Bytes32HexNo0x[] = [];

    for (let i = 0; i < numHandles; ++i) {
      handlesBytes32HexNoPrefixList.push(remove0x(handlesBytes32HexList[i]));
    }

    const eip712 = this._createCiphertextVerificationEIP712({
      handlesBytes32HexList,
      contractChainId,
      contractAddress,
      userAddress,
      extraData,
    });

    const signaturesHex: BytesHex[] = await multiSignEIP712(
      this._coprocessorSigners,
      eip712.domain,
      eip712.types,
      eip712.message,
    );

    // Remove 0x prefix
    const signatureHexNoPrefixList: BytesHexNo0x[] = signaturesHex.map(
      (sigHex) => remove0x(sigHex),
    );

    return {
      handles: handlesBytes32HexNoPrefixList,
      signatures: signatureHexNoPrefixList,
    };
  }
}
