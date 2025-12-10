const dotenv = require('dotenv');
const fs = require('fs');

global.TFHE = require('node-tfhe');
global.TKMS = require('node-tkms');

const parsedEnv = dotenv.parse(fs.readFileSync('.env.devnet'));

global.TEST_FHEVM_CONFIG = {
  aclContractAddress: parsedEnv['ACL_CONTRACT_ADDRESS'],
  kmsContractAddress: parsedEnv['KMS_VERIFIER_CONTRACT_ADDRESS'],
  inputVerifierContractAddress: parsedEnv['INPUT_VERIFIER_CONTRACT_ADDRESS'],
  verifyingContractAddressDecryption: parsedEnv['DECRYPTION_ADDRESS'],
  verifyingContractAddressInputVerification:
    parsedEnv['INPUT_VERIFICATION_ADDRESS'],
  chainId: parsedEnv['CHAIN_ID'],
  gatewayChainId: parsedEnv['CHAIN_ID_GATEWAY'],
  network: parsedEnv['RPC_URL'],
  relayerUrl: parsedEnv['RELAYER_URL'],
};
