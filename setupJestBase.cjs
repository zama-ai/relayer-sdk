const dotenv = require('dotenv');
const fs = require('fs');

function setupGlobalJestFhevmConfig(type, envFile) {
  if (envFile === undefined) {
    envFile = '.env.testnet';
  }

  let parsedMnemonicEnv = {};
  try {
    parsedMnemonicEnv = dotenv.parse(fs.readFileSync('.env'));
  } catch {
    //
  }

  let parsedEnv = {};
  try {
    parsedEnv = dotenv.parse(fs.readFileSync(envFile));
  } catch {
    //
  }

  global.JEST_FHEVM_CONFIG = {
    type,
    fhevmInstanceConfig: {
      aclContractAddress:
        parsedEnv['ACL_CONTRACT_ADDRESS'] ??
        '0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D',
      kmsContractAddress:
        parsedEnv['KMS_VERIFIER_CONTRACT_ADDRESS'] ??
        '0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A',
      inputVerifierContractAddress:
        parsedEnv['INPUT_VERIFIER_CONTRACT_ADDRESS'] ??
        '0xBBC1fFCdc7C316aAAd72E807D9b0272BE8F84DA0',
      verifyingContractAddressDecryption:
        parsedEnv['DECRYPTION_ADDRESS'] ??
        '0x5D8BD78e2ea6bbE41f26dFe9fdaEAa349e077478',
      verifyingContractAddressInputVerification:
        parsedEnv['INPUT_VERIFICATION_ADDRESS'] ??
        '0x483b9dE06E4E4C7D35CCf5837A1668487406D955',
      chainId: Number(parsedEnv['CHAIN_ID'] ?? '11155111'),
      gatewayChainId: Number(parsedEnv['CHAIN_ID_GATEWAY'] ?? '10901'),
      network:
        parsedEnv['RPC_URL'] ?? 'https://ethereum-sepolia-rpc.publicnode.com',
      relayerUrl:
        parsedEnv['RELAYER_URL'] ?? 'https://relayer.testnet.zama.org',
    },
    testContracts: {
      FHECounterUserDecryptAddress:
        parsedEnv['FHE_COUNTER_USER_DECRYPT_ADDRESS'] ??
        '0x9F3fd46B454D35cc4c661a97FB5e6FaBb70A18C2',
      FHECounterPublicDecryptAddress:
        parsedEnv['FHE_COUNTER_PUBLIC_DECRYPT_ADDRESS'] ??
        '0x69c4511f85E9acBb9a3D4Be7098d1d2232Ed1F7f',
      DeployerAddress:
        parsedEnv['FHE_COUNTER_DEPLOYER_ADDRESS'] ??
        '0x37AC010c1c566696326813b840319B58Bb5840E4',
    },
    mnemonic:
      parsedMnemonicEnv['MNEMONIC'] ??
      'adapt mosquito move limb mobile illegal tree voyage juice mosquito burger raise father hope layer',
  };
}

module.exports = {
  setupGlobalJestFhevmConfig,
};
