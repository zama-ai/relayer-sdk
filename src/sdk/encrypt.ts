import { getAddress, isAddress } from 'ethers';
import {
  TfheCompactPublicKey,
  CompactCiphertextList,
  CompactPkeCrs,
  ZkComputeLoad,
} from 'node-tfhe';

import {
  bytesToBigInt,
  fromHexString,
  numberToHex,
  SERIALIZED_SIZE_LIMIT_CIPHERTEXT,
  toHexString,
} from '../utils';
import { ENCRYPTION_TYPES } from './encryptionTypes';
import { computeHandles } from './handles';

type EncryptionTypes = keyof typeof ENCRYPTION_TYPES;
const currentCiphertextVersion = () => {
  return 0;
};

// defined in fhevm-relayer/src/input_http_listener.rs
export type HttpzRelayerInputProofResponse = {
  response: {
    handles: string[];
    signatures: string[];
  };
  status: string;
};

export type ZKInput = {
  addBool: (value: boolean | number | bigint) => ZKInput;
  add8: (value: number | bigint) => ZKInput;
  add16: (value: number | bigint) => ZKInput;
  add32: (value: number | bigint) => ZKInput;
  add64: (value: number | bigint) => ZKInput;
  add128: (value: number | bigint) => ZKInput;
  add256: (value: number | bigint) => ZKInput;
  addBytes64: (value: Uint8Array) => ZKInput;
  addBytes128: (value: Uint8Array) => ZKInput;
  addBytes256: (value: Uint8Array) => ZKInput;
  addAddress: (value: string) => ZKInput;
  getBits: () => number[];
  _getClosestPP: () => EncryptionTypes;
  _prove: () => Uint8Array;
  _verify: (ciphertext: Uint8Array) => Promise<{
    handles: Uint8Array[];
    inputProof: Uint8Array;
  }>;
  _handles: () => Uint8Array[];
  encrypt: () => Promise<{
    handles: Uint8Array[];
    inputProof: Uint8Array;
  }>;
};

const checkEncryptedValue = (value: number | bigint, bits: number) => {
  if (value == null) throw new Error('Missing value');
  let limit;
  if (bits >= 8) {
    limit = BigInt(
      `0x${new Array(bits / 8).fill(null).reduce((v) => `${v}ff`, '')}`,
    );
  } else {
    limit = BigInt(2 ** bits - 1);
  }
  if (typeof value !== 'number' && typeof value !== 'bigint')
    throw new Error('Value must be a number or a bigint.');
  if (value > limit) {
    throw new Error(
      `The value exceeds the limit for ${bits}bits integer (${limit.toString()}).`,
    );
  }
};

export type PublicParams<T = CompactPkeCrs> = {
  [key in EncryptionTypes]?: { publicParams: T; publicParamsId: string };
};

export const createEncryptedInput =
  (
    aclContractAddress: string,
    chainId: number,
    relayer_url: string,
    tfheCompactPublicKey: TfheCompactPublicKey,
    publicParams: PublicParams,
  ) =>
  (contractAddress: string, userAddress: string): ZKInput => {
    if (!isAddress(contractAddress)) {
      throw new Error('Contract address is not a valid address.');
    }

    if (!isAddress(userAddress)) {
      throw new Error('User address is not a valid address.');
    }
    const publicKey: TfheCompactPublicKey = tfheCompactPublicKey;
    const bits: EncryptionTypes[] = [];
    const builder = CompactCiphertextList.builder(publicKey);
    let ciphertextWithZKProof: Uint8Array = new Uint8Array(); // updated in `_prove`
    let nbCiphertextWithZKProof: number = 0; // use to invalidate ciphertextWithZKProof, e.g. add is called between 2 `encrypt`
    const checkLimit = (added: number) => {
      if (bits.reduce((acc, val) => acc + Math.max(2, val), 0) + added > 2048) {
        throw Error(
          'Packing more than 2048 bits in a single input ciphertext is unsupported',
        );
      }
      if (bits.length + 1 > 256)
        throw Error(
          'Packing more than 256 variables in a single input ciphertext is unsupported',
        );
    };
    relayer_url =
      relayer_url.slice(-1) == '/' ? relayer_url.slice(0, -1) : relayer_url;
    return {
      addBool(value: boolean | number | bigint) {
        if (value == null) throw new Error('Missing value');
        if (
          typeof value !== 'boolean' &&
          typeof value !== 'number' &&
          typeof value !== 'bigint'
        )
          throw new Error('The value must be a boolean, a number or a bigint.');
        if (
          (typeof value !== 'bigint' || typeof value !== 'number') &&
          Number(value) > 1
        )
          throw new Error('The value must be 1 or 0.');
        checkEncryptedValue(Number(value), 1);
        checkLimit(2);
        builder.push_boolean(!!value);
        bits.push(1); // ebool takes 2 encrypted bits
        return this;
      },
      add8(value: number | bigint) {
        checkEncryptedValue(value, 8);
        checkLimit(8);
        builder.push_u8(Number(value));
        bits.push(8);
        return this;
      },
      add16(value: number | bigint) {
        checkEncryptedValue(value, 16);
        checkLimit(16);
        builder.push_u16(Number(value));
        bits.push(16);
        return this;
      },
      add32(value: number | bigint) {
        checkEncryptedValue(value, 32);
        checkLimit(32);
        builder.push_u32(Number(value));
        bits.push(32);
        return this;
      },
      add64(value: number | bigint) {
        checkEncryptedValue(value, 64);
        checkLimit(64);
        builder.push_u64(BigInt(value));
        bits.push(64);
        return this;
      },
      add128(value: number | bigint) {
        checkEncryptedValue(value, 128);
        checkLimit(128);
        builder.push_u128(BigInt(value));
        bits.push(128);
        return this;
      },
      addAddress(value: string) {
        if (!isAddress(value)) {
          throw new Error('The value must be a valid address.');
        }
        checkLimit(160);
        builder.push_u160(BigInt(value));
        bits.push(160);
        return this;
      },
      add256(value: number | bigint) {
        checkEncryptedValue(value, 256);
        checkLimit(256);
        builder.push_u256(BigInt(value));
        bits.push(256);
        return this;
      },
      addBytes64(value: Uint8Array) {
        if (value.length !== 64)
          throw Error(
            'Uncorrect length of input Uint8Array, should be 64 for an ebytes64',
          );
        const bigIntValue = bytesToBigInt(value);
        checkEncryptedValue(bigIntValue, 512);
        checkLimit(512);
        builder.push_u512(bigIntValue);
        bits.push(512);
        return this;
      },
      addBytes128(value: Uint8Array) {
        if (value.length !== 128)
          throw Error(
            'Uncorrect length of input Uint8Array, should be 128 for an ebytes128',
          );
        const bigIntValue = bytesToBigInt(value);
        checkEncryptedValue(bigIntValue, 1024);
        checkLimit(1024);
        builder.push_u1024(bigIntValue);
        bits.push(1024);
        return this;
      },
      addBytes256(value: Uint8Array) {
        if (value.length !== 256)
          throw Error(
            'Uncorrect length of input Uint8Array, should be 256 for an ebytes256',
          );
        const bigIntValue = bytesToBigInt(value);
        checkEncryptedValue(bigIntValue, 2048);
        checkLimit(2048);
        builder.push_u2048(bigIntValue);
        bits.push(2048);
        return this;
      },
      getBits() {
        return bits;
      },
      _getClosestPP() {
        const getKeys = <T extends {}>(obj: T) =>
          Object.keys(obj) as Array<keyof T>;

        const totalBits = bits.reduce((total, v) => total + v, 0);
        const ppTypes = getKeys(publicParams);
        const closestPP: EncryptionTypes | undefined = ppTypes.find(
          (k) => Number(k) >= totalBits,
        );
        if (!closestPP) {
          throw new Error(
            `Too many bits in provided values. Maximum is ${
              ppTypes[ppTypes.length - 1]
            }.`,
          );
        }
        return closestPP;
      },
      _prove() {
        // _prove is cached, also used for function `handles`
        if (
          ciphertextWithZKProof.length > 0 &&
          nbCiphertextWithZKProof == bits.length
        ) {
          return ciphertextWithZKProof;
        }
        const closestPP = this._getClosestPP();
        const pp = publicParams[closestPP]!.publicParams;
        const buffContract = fromHexString(contractAddress);
        const buffUser = fromHexString(userAddress);
        const buffAcl = fromHexString(aclContractAddress);
        const buffChainId = fromHexString(chainId.toString(16));
        const auxData = new Uint8Array(
          buffContract.length + buffUser.length + buffAcl.length + 32, // buffChainId.length,
        );
        auxData.set(buffContract, 0);
        auxData.set(buffUser, 20);
        auxData.set(buffAcl, 40);
        auxData.set(buffChainId, auxData.length - buffChainId.length);
        const encrypted = builder.build_with_proof_packed(
          pp,
          auxData,
          ZkComputeLoad.Verify,
        );
        ciphertextWithZKProof = encrypted.safe_serialize(
          SERIALIZED_SIZE_LIMIT_CIPHERTEXT,
        );
        nbCiphertextWithZKProof = bits.length;
        return ciphertextWithZKProof;
      },
      async _verify(ciphertext: Uint8Array) {
        // https://github.com/zama-ai/fhevm-relayer/blob/978b08f62de060a9b50d2c6cc19fd71b5fb8d873/src/input_http_listener.rs#L13C1-L22C1
        const payload = {
          contractAddress: getAddress(contractAddress),
          userAddress: getAddress(userAddress),
          ciphertextWithZkpok: Buffer.from(ciphertext).toString('hex'),
          contractChainId: '0x' + chainId.toString(16),
        };
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        };
        const url = `${relayer_url}/v1/input-proof`;
        let json: HttpzRelayerInputProofResponse;
        try {
          const response = await fetch(url, options);
          if (!response.ok) {
            throw new Error(
              `Httpz-relayer didn't response correctly. Bad status ${
                response.statusText
              }. Content: ${await response.text()}`,
            );
          }
          try {
            json = await response.json();
          } catch (e) {
            throw new Error(
              "Httpz-relayer didn't response correctly. Bad JSON.",
              { cause: e },
            );
          }
        } catch (e) {
          throw new Error("Httpz-relayer didn't response correctly.", {
            cause: e,
          });
        }

        const handles = this._handles();
        // Note that the hex strings returned by the relayer do have have the 0x prefix
        if (json.response.handles && json.response.handles.length > 0) {
          const response_handles = json.response.handles.map(fromHexString);
          if (handles.length != response_handles.length) {
            throw new Error(
              `Incorrect Handles list sizes: (expected) ${handles.length} != ${response_handles.length} (received)`,
            );
          }
          for (let index = 0; index < handles.length; index++) {
            let handle = handles[index];
            let response_handle = response_handles[index];
            let expected = Buffer.from(handle).toString('hex');
            let current = Buffer.from(response_handle).toString('hex');
            if (expected !== current) {
              throw new Error(
                `Incorrect Handle ${index}: (expected) ${expected} != ${current} (received)`,
              );
            }
          }
        }

        const signatures = json.response.signatures;

        // inputProof is len(list_handles) + numCoprocessorSigners + list_handles + signatureCoprocessorSigners (1+1+NUM_HANDLES*32+65*numSigners)
        let inputProof = numberToHex(handles.length);
        const numSigners = signatures.length;
        inputProof += numberToHex(numSigners);

        const listHandlesStr = handles.map((i) => toHexString(i));
        listHandlesStr.map((handle) => (inputProof += handle));
        signatures.map((signature) => (inputProof += signature.slice(2))); // removes the '0x' prefix from the `signature` string
        return {
          handles,
          inputProof: fromHexString(inputProof),
        };
      },
      _handles() {
        return computeHandles(
          this._prove(),
          bits,
          aclContractAddress,
          chainId,
          currentCiphertextVersion(),
        );
      },
      async encrypt() {
        let start = Date.now();
        const ciphertextWithZKProof = await this._prove();
        console.log(
          `Encrypting and proving in ${
            Math.round((Date.now() - start) / 100) / 10
          }s`,
        );

        start = Date.now();
        const verification = await this._verify(ciphertextWithZKProof);
        console.log(
          `Verifying in ${Math.round((Date.now() - start) / 100) / 10}s`,
        );
        return verification;
      },
    };
  };
