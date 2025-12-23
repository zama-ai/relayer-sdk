import dotenv from 'dotenv';
import fs from 'fs';
import { ethers } from 'ethers';
import {
  encryptionBitsFromFheTypeName,
  FhevmHandle,
  isChecksummedAddress,
  isFheTypeName,
} from '../lib/internal.js';

export function logCLI(message, { json, verbose }) {
  if (json === true) {
    if (verbose === true) {
      process.stderr.write(message + '\n');
    }
  } else {
    console.log(message);
  }
}

export const throwError = (error, cause) => {
  if (cause) {
    console.error(`Error: ${error} with cause: ${cause}`);
  } else {
    console.error(`Error: ${error}`);
  }
  process.exit();
};

export function getEnv(envName, envFile) {
  if (envName === 'MNEMONIC') {
    envFile = '.env';
  }
  if (!envFile) {
    throwError(`Missing env filename`);
  }
  const parsedEnv = dotenv.parse(fs.readFileSync(envFile));
  return process.env[envName] ?? parsedEnv[envName];
}

export function parseHandles(handles) {
  const fhevmHandles = [];
  for (let i = 0; i < handles.length; ++i) {
    if (handles[i].indexOf(' ') >= 0) {
      const list = handles[i].split(' ');
      for (let j = 0; j < list.length; ++j) {
        fhevmHandles.push(FhevmHandle.fromBytes32Hex(list[j]));
      }
    } else {
      fhevmHandles.push(FhevmHandle.fromBytes32Hex(handles[i]));
    }
  }
  return fhevmHandles;
}

export function createWallet({ mnemonic, path, basePath, index, wordlist }) {
  basePath = basePath || "m/44'/60'/0'/0/";
  index = index || 0;
  const hdNode = ethers.HDNodeWallet.fromPhrase(
    mnemonic,
    undefined, // password
    path || `${basePath}${index}`,
    wordlist,
  );
  return { wallet: hdNode, address: hdNode.address };
}

export function addCommonOptions(command) {
  return command
    .option('--contract-address <contract address>', 'address of the contract')
    .option('--user-address <user address>', 'address of the account')
    .option(
      '--network <testnet|devnet>',
      'network name, must be "testnet" or "devnet"',
    )
    .option('--acl <ACL contract address>', 'ACL contract address')
    .option(
      '--kms-verifier <KMSVerifier contract address>',
      'KMSVerifier contract address',
    )
    .option(
      '--input-verifier <InputVerifier contract address>',
      'InputVerifier contract address',
    )
    .option(
      '--gateway-input-verification <Gateway input verification contract address>',
      'Gateway input verification contract address',
    )
    .option(
      '--gateway-decryption-verification <Gateway decryption verification contract address>',
      'Gateway decryption verification contract address',
    )
    .option('--chain <chain ID>', 'The chain ID')
    .option('--gateway-chain <gateway chain ID>', 'The gateway chain ID')
    .option('--rpc-url <rpc url>', 'The rpc url')
    .option('--relayer-url <relayer url>', 'The relayer url')
    .option('--mnemonic <word list>', 'Mnemonic word list')
    .option('--version <route v1 or v2>', 'The default route version: 1|2')
    .option('--clear-cache', 'Clear the FHEVM public key cache')
    .option('--json', 'Ouput in JSON format')
    .option('--verbose', 'Verbose output');
}

/**
 * @param {object} options - Command line options
 * @returns {{
 *   config: {
 *     name: 'testnet' | 'devnet',
 *     version: 1 | 2,
 *     walletAddress: string,
 *     userAddress: string,
 *     contractAddress: string,
 *     fhevmInstanceConfig: {
 *       aclContractAddress: string,
 *       kmsContractAddress: string,
 *       inputVerifierContractAddress: string,
 *       verifyingContractAddressDecryption: string,
 *       verifyingContractAddressInputVerification: string,
 *       chainId: number,
 *       gatewayChainId: number,
 *       network: string,
 *       relayerUrl: string,
 *     },
 *   },
 *   wallet: import('ethers').HDNodeWallet | undefined,
 *   signer: import('ethers').HDNodeWallet | undefined,
 *   provider: import('ethers').JsonRpcProvider,
 * }}
 */
export function parseCommonOptions(options) {
  const name = options?.network ?? 'devnet';
  if (name !== 'testnet' && name !== 'devnet') {
    throwError(`Invalid network name '${name}'.`);
  }

  let version = options?.version ?? 1;
  if (version === 'v1' || version === '1') {
    version = 1;
  }
  if (version === 'v2' || version === '2') {
    version = 2;
  }
  if (version !== 1 && version !== 2) {
    throwError(`Invalid relayer route version '${version}'.`);
  }

  let rpcUrl = options?.rpcUrl;
  if (!rpcUrl) {
    rpcUrl = getEnv('RPC_URL', `.env.${name}`);
  }
  if (!rpcUrl) {
    throwError(`Missing Rpc Url.`);
  }

  let relayerUrl = options?.relayerUrl;
  if (!relayerUrl) {
    relayerUrl = getEnv('RELAYER_URL', `.env.${name}`);
  }
  if (!relayerUrl) {
    throwError(`Missing relayer Url.`);
  }

  if (version === 1) {
    if (!relayerUrl.endsWith('/v1')) {
      relayerUrl = relayerUrl + '/v1';
    }
  }
  if (version === 2) {
    if (!relayerUrl.endsWith('/v2')) {
      relayerUrl = relayerUrl + '/v2';
    }
  }

  let contractAddress = options?.contractAddress;
  if (!contractAddress) {
    contractAddress = getEnv('CONTRACT_ADDRESS', `.env.${name}`);
  }
  if (!contractAddress) {
    contractAddress = getEnv(
      'FHE_COUNTER_PUBLIC_DECRYPT_ADDRESS',
      `.env.${name}`,
    );
  }
  if (!isChecksummedAddress(contractAddress)) {
    throwError(`Invalid contract address '${contractAddress}'.`);
  }

  let userAddress = options?.userAddress;
  if (userAddress && !isChecksummedAddress(userAddress)) {
    userAddress = getEnv('USER_ADDRESS', `.env.${name}`);
  }

  let aclContractAddress = options?.acl;
  if (!aclContractAddress) {
    aclContractAddress = getEnv('ACL_CONTRACT_ADDRESS', `.env.${name}`);
  }
  if (!isChecksummedAddress(aclContractAddress)) {
    throwError(`Invalid ACL address '${aclContractAddress}'.`);
  }

  let kmsContractAddress = options?.kmsVerifier;
  if (!kmsContractAddress) {
    kmsContractAddress = getEnv(
      'KMS_VERIFIER_CONTRACT_ADDRESS',
      `.env.${name}`,
    );
  }
  if (!isChecksummedAddress(kmsContractAddress)) {
    throwError(`Invalid KMSVerifier address '${kmsContractAddress}'.`);
  }

  let inputVerifierContractAddress = options?.inputVerifier;
  if (!inputVerifierContractAddress) {
    inputVerifierContractAddress = getEnv(
      'INPUT_VERIFIER_CONTRACT_ADDRESS',
      `.env.${name}`,
    );
  }
  if (!isChecksummedAddress(inputVerifierContractAddress)) {
    throwError(
      `Invalid InputVerifier address '${inputVerifierContractAddress}'.`,
    );
  }

  let verifyingContractAddressInputVerification =
    options?.gatewayInputVerification;
  if (!verifyingContractAddressInputVerification) {
    verifyingContractAddressInputVerification = getEnv(
      'INPUT_VERIFICATION_ADDRESS',
      `.env.${name}`,
    );
  }
  if (!isChecksummedAddress(kmsContractAddress)) {
    throwError(`Invalid KMSVerifier address '${kmsContractAddress}'.`);
  }

  let verifyingContractAddressDecryption =
    options?.gatewayDecryptionVerification;
  if (!verifyingContractAddressDecryption) {
    verifyingContractAddressDecryption = getEnv(
      'DECRYPTION_ADDRESS',
      `.env.${name}`,
    );
  }
  if (!isChecksummedAddress(kmsContractAddress)) {
    throwError(`Invalid KMSVerifier address '${kmsContractAddress}'.`);
  }

  //
  let chainId = options?.chain;
  if (!chainId) {
    chainId = getEnv('CHAIN_ID', `.env.${name}`);
  }
  chainId = Number.parseInt(chainId);
  if (Number.isNaN(chainId)) {
    throwError(`Invalid chain ID '${chainId}'.`);
  }

  let gatewayChainId = options?.gatewayChain;
  if (!gatewayChainId) {
    gatewayChainId = getEnv('CHAIN_ID_GATEWAY', `.env.${name}`);
  }
  gatewayChainId = Number.parseInt(gatewayChainId);
  if (Number.isNaN(gatewayChainId)) {
    throwError(`Invalid gateway chain ID '${gatewayChainId}'.`);
  }

  const mnemonic = options?.mnemonic ?? getEnv('MNEMONIC');
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const walletResult = mnemonic ? createWallet({ mnemonic }) : undefined;
  const wallet = walletResult?.wallet;
  const signer = wallet?.connect(provider);

  const config = {
    name: name,
    version,
    walletAddress: wallet?.address,
    userAddress: userAddress ?? wallet?.address,
    contractAddress,
    fhevmInstanceConfig: {
      aclContractAddress,
      kmsContractAddress,
      inputVerifierContractAddress,
      verifyingContractAddressDecryption,
      verifyingContractAddressInputVerification,
      chainId,
      gatewayChainId,
      network: rpcUrl,
      relayerUrl,
    },
  };

  return { config, provider, wallet, signer };
}

export function valueColumnTypeListToFheTypedValues(list) {
  return list.map((str) => {
    const [valueStr, fheTypeName] = str.split(':');
    if (!isFheTypeName(fheTypeName)) {
      throwError(`Invalid FheType name: ${fheTypeName}`);
    }
    let value;
    if (fheTypeName === 'ebool') {
      value = valueStr === 'true' ? true : false;
    } else if (fheTypeName === 'eaddress') {
      value = valueStr;
    } else if (
      fheTypeName === 'euint8' ||
      fheTypeName === 'euint16' ||
      fheTypeName === 'euint32'
    ) {
      value = Number(valueStr);
    } else {
      value = BigInt(valueStr);
      if (value <= BigInt(Number.MAX_SAFE_INTEGER)) {
        value = Number(value);
      }
    }
    return { fheType: fheTypeName, value };
  });
}

export function fheTypedValuesToBuilderFunctionWithArg(fheTypedValues) {
  return fheTypedValues.map((pair) => {
    const { value, fheType } = pair;
    if (!isFheTypeName(fheType)) {
      throwError(`Invalid FheType name: ${fheType}`);
    }
    let funcName;
    if (fheType === 'ebool') {
      funcName = 'addBool';
    } else if (fheType === 'eaddress') {
      funcName = 'addAddress';
    } else {
      const bits = encryptionBitsFromFheTypeName(fheType);
      funcName = `add${bits}`;
    }
    return { funcName, arg: value };
  });
}

export function jsonParseFheTypedValues(text) {
  return JSON.parse(text, (key, value) => {
    if (value === 'true' || value === true) {
      return true;
    }
    if (value === 'false' || value === true) {
      return false;
    }
    if (typeof value === 'string' && value.startsWith('0x')) {
      return value;
    }
    return BigInt(value);
  });
}
