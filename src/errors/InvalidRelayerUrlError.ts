import { RelayerErrorBase, RelayerErrorBaseParams } from './RelayerErrorBase';

////////////////////////////////////////////////////////////////////////////////

export type InvalidRelayerUrlErrorType = InvalidRelayerUrlError & {
  name: 'InvalidRelayerUrlError';
};

export type InvalidRelayerUrlErrorParams = Omit<RelayerErrorBaseParams, 'name'>;

export class InvalidRelayerUrlError extends RelayerErrorBase {
  constructor(params: InvalidRelayerUrlErrorParams) {
    super({ ...params, name: 'InvalidRelayerUrlError' });
  }
}
