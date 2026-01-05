export interface IInputVerifier {
  getCoprocessorSigners(): Promise<unknown[]>;
  getThreshold(): Promise<unknown>;
  eip712Domain(): Promise<unknown[]>;
}

export interface IKMSVerifier {
  getKmsSigners(): Promise<unknown[]>;
  getThreshold(): Promise<unknown>;
  eip712Domain(): Promise<unknown[]>;
}
