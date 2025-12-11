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
  chainId: Number(parsedEnv['CHAIN_ID']),
  gatewayChainId: Number(parsedEnv['CHAIN_ID_GATEWAY']),
  network: parsedEnv['RPC_URL'],
  relayerUrl: parsedEnv['RELAYER_URL'],
};

// Devnet addresses
global.FHECounterUserDecryptAddress =
  '0xE4DdA6c4C007e24fcebF95073d8Cd7b2a3db1A40';
global.FHECounterPublicDecryptAddress =
  '0xb2a8A265dD5A27026693Aa6cE87Fb21Ac197b6b9';
