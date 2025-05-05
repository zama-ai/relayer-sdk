import { fromHexString, toHexString } from '../utils';
import { ethers, AbiCoder } from 'ethers';

export type DecryptedResults = Record<string, bigint | boolean | string>;

const aclABI = [
  'function isAllowedForDecryption(bytes32 handle) view returns (bool)',
];

function isThresholdReached(
  kmsSigners: string[],
  recoveredAddresses: string[],
  threshold: number,
): boolean {
  const addressMap = new Map<string, number>();
  recoveredAddresses.forEach((address, index) => {
    if (addressMap.has(address)) {
      const duplicateValue = address;
      throw new Error(
        `Duplicate signer address found: ${duplicateValue} appears multiple times in recovered addresses`,
      );
    }
    addressMap.set(address, index);
  });

  for (const address of recoveredAddresses) {
    if (!kmsSigners.includes(address)) {
      throw new Error(
        `Invalid address found: ${address} is not in the list of KMS signers`,
      );
    }
  }

  return recoveredAddresses.length >= threshold;
}

const NumEncryptedBits: Record<number, number> = {
  0: 2, // ebool
  2: 8, // euint8
  3: 16, // euint16
  4: 32, // euint32
  5: 64, // euint64
  6: 128, // euint128
  7: 160, // eaddress
  8: 256, // euint256
  9: 512, // ebytes64
  10: 1024, // ebytes128
  11: 2048, // ebytes256
} as const;

function checkEncryptedBits(handles: string[]) {
  let total = 0;

  for (const handle of handles) {
    if (handle.length !== 66) {
      throw new Error(`Handle ${handle} is not of valid length`);
    }

    const hexPair = handle.slice(-4, -2).toLowerCase();
    const typeDiscriminant = parseInt(hexPair, 16);

    if (!(typeDiscriminant in NumEncryptedBits)) {
      throw new Error(`Handle ${handle} is not of valid type`);
    }

    total +=
      NumEncryptedBits[typeDiscriminant as keyof typeof NumEncryptedBits];

    // enforce 2048‑bit limit
    if (total > 2048) {
      throw new Error(
        'Cannot decrypt more than 2048 encrypted bits in a single request',
      );
    }
  }
  return total;
}

const CiphertextType: Record<number, 'bool' | 'uint256' | 'address' | 'bytes'> =
  {
    0: 'bool',
    2: 'uint256',
    3: 'uint256',
    4: 'uint256',
    5: 'uint256',
    6: 'uint256',
    7: 'address',
    8: 'uint256',
    9: 'bytes',
    10: 'bytes',
    11: 'bytes',
  };

function deserializeDecryptedResult(
  handles: string[],
  decryptedResult: string,
): DecryptedResults {
  let typesList: number[] = [];
  for (const handle of handles) {
    const hexPair = handle.slice(-4, -2).toLowerCase();
    const typeDiscriminant = parseInt(hexPair, 16);
    typesList.push(typeDiscriminant);
  }

  const restoredEncoded =
    '0x' +
    '00'.repeat(32) + // dummy requestID (ignored)
    decryptedResult.slice(2) +
    '00'.repeat(32); // dummy empty bytes[] length (ignored)

  const abiTypes = typesList.map((t) => {
    const abiType = CiphertextType[t]; // all types are valid because this was supposedly checked already inside the `checkEncryptedBits` function
    return abiType;
  });

  const coder = new AbiCoder();
  const decoded = coder.decode(
    ['uint256', ...abiTypes, 'bytes[]'],
    restoredEncoded,
  );

  // strip dummy first/last element
  const rawValues = decoded.slice(1, 1 + typesList.length);

  let results: DecryptedResults = {};
  handles.forEach((handle, idx) => (results[handle] = rawValues[idx]));

  return results;
}

export const publicDecryptRequest =
  (
    kmsSigners: string[],
    thresholdSigners: number,
    gatewayChainId: number,
    verifyingContractAddress: string,
    aclContractAddress: string,
    relayerUrl: string,
    provider: ethers.JsonRpcProvider | ethers.BrowserProvider,
  ) =>
  async (_handles: (Uint8Array | string)[]) => {
    const acl = new ethers.Contract(aclContractAddress, aclABI, provider);

    let handles: string[];
    try {
      handles = await Promise.all(
        _handles.map(async (_handle) => {
          const handle =
            typeof _handle === 'string'
              ? toHexString(fromHexString(_handle), true)
              : toHexString(_handle, true);

          const isAllowedForDecryption = await acl.isAllowedForDecryption(
            handle,
          );
          if (!isAllowedForDecryption) {
            throw new Error(
              `Handle ${handle} is not allowed for public decryption!`,
            );
          }
          return handle;
        }),
      );
    } catch (e) {
      throw e;
    }

    const verifications = handles.map(async (ctHandle) => {
      const isAllowedForDecryption = await acl.isAllowedForDecryption(ctHandle);
      if (!isAllowedForDecryption) {
        throw new Error(
          `Handle ${ctHandle} is not allowed for public decryption!`,
        );
      }
    });

    await Promise.all(verifications).catch((e) => {
      throw e;
    });

    // check 2048 bits limit
    checkEncryptedBits(handles);

    const payloadForRequest = {
      ciphertextHandles: handles,
    };
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadForRequest),
    };

    let response;
    let json;
    try {
      response = await fetch(`${relayerUrl}/v1/public-decrypt`, options);
      if (!response.ok) {
        throw new Error(
          `Public decrypt failed: relayer respond with HTTP code ${response.status}`,
        );
      }
    } catch (e) {
      throw new Error("Public decrypt failed: Relayer didn't respond", {
        cause: e,
      });
    }

    try {
      json = await response.json();
    } catch (e) {
      throw new Error("Public decrypt failed: Relayer didn't return a JSON", {
        cause: e,
      });
    }

    if (json.status === 'failure') {
      throw new Error(
        "Public decrypt failed: the public decrypt didn't succeed for an unknown reason",
        { cause: json },
      );
    }

    // verify signatures on decryption:
    const domain = {
      name: 'Decryption',
      version: '1',
      chainId: gatewayChainId,
      verifyingContract: verifyingContractAddress,
    };
    const types = {
      PublicDecryptVerification: [
        { name: 'ctHandles', type: 'bytes32[]' },
        { name: 'decryptedResult', type: 'bytes' },
      ],
    };
    const result = json.response[0];
    const decryptedResult = result.decrypted_value.startsWith('0x')
      ? result.decrypted_value
      : `0x${result.decrypted_value}`;
    const signatures = result.signatures;

    const recoveredAddresses = signatures.map((signature: string) => {
      const sig = signature.startsWith('0x') ? signature : `0x${signature}`;
      const recoveredAddress = ethers.verifyTypedData(
        domain,
        types,
        { ctHandles: handles, decryptedResult },
        sig,
      );
      return recoveredAddress;
    });

    const thresholdReached = isThresholdReached(
      kmsSigners,
      recoveredAddresses,
      thresholdSigners,
    );

    if (!thresholdReached) {
      throw Error('KMS signers threshold is not reached');
    }

    const results = deserializeDecryptedResult(handles, decryptedResult);

    return results;
  };
