const dotenv = require('dotenv');
const fs = require('fs');

function setupGlobalJestFhevmConfig(type, envFile) {
  if (envFile === undefined) {
    envFile = '.env.testnet';
  }

  const parsedMnemonicEnv = dotenv.parse(fs.readFileSync('.env'));
  const parsedEnv = dotenv.parse(fs.readFileSync(envFile));

  global.JEST_FHEVM_CONFIG = {
    type,
    fhevmInstanceConfig: {
      aclContractAddress: parsedEnv['ACL_CONTRACT_ADDRESS'],
      kmsContractAddress: parsedEnv['KMS_VERIFIER_CONTRACT_ADDRESS'],
      inputVerifierContractAddress:
        parsedEnv['INPUT_VERIFIER_CONTRACT_ADDRESS'],
      verifyingContractAddressDecryption: parsedEnv['DECRYPTION_ADDRESS'],
      verifyingContractAddressInputVerification:
        parsedEnv['INPUT_VERIFICATION_ADDRESS'],
      chainId: Number(parsedEnv['CHAIN_ID']),
      gatewayChainId: Number(parsedEnv['CHAIN_ID_GATEWAY']),
      network: parsedEnv['RPC_URL'],
      relayerUrl: parsedEnv['RELAYER_URL'],
    },
    testContracts: {
      FHECounterUserDecryptAddress:
        parsedEnv['FHE_COUNTER_USER_DECRYPT_ADDRESS'],
      FHECounterPublicDecryptAddress:
        parsedEnv['FHE_COUNTER_PUBLIC_DECRYPT_ADDRESS'],
      DeployerAddress: parsedEnv['FHE_COUNTER_DEPLOYER_ADDRESS'],
    },
    mnemonic: parsedMnemonicEnv['MNEMONIC'],
  };
}

module.exports = {
  setupGlobalJestFhevmConfig,
};
