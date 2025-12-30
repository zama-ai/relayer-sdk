import { RelayerErrorBase } from './RelayerErrorBase';

export type ZKProofErrorType = ZKProofError & {
  name: 'ZKProofError';
};

export class ZKProofError extends RelayerErrorBase {
  constructor({ message }: { message?: string }) {
    super({
      message: message ?? `FHEVM ZKProof is invalid.`,
      name: 'ZKProofError',
    });
  }
}
