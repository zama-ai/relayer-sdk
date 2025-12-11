const dotenv = require('dotenv');
const fs = require('fs');

global.TFHE = require('node-tfhe');
global.TKMS = require('node-tkms');

const parsedEnv = dotenv.parse(fs.readFileSync('.env.testnet'));

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

// Testnet addresses
global.FHECounterUserDecryptAddress =
  '0x9F3fd46B454D35cc4c661a97FB5e6FaBb70A18C2';
global.FHECounterPublicDecryptAddress =
  '0x69c4511f85E9acBb9a3D4Be7098d1d2232Ed1F7f';
