import type { Eip1193Provider } from 'ethers';

export interface CleartextInstanceConfig {
  network: Eip1193Provider | string;
  chainId: number;
  gatewayChainId: number;
  aclContractAddress: string;
  kmsContractAddress: string;
  inputVerifierContractAddress: string;
  verifyingContractAddressDecryption: string;
  verifyingContractAddressInputVerification: string;
  /** Address of the CleartextFHEVMExecutor contract with public plaintexts mapping */
  cleartextExecutorAddress: string;
}
