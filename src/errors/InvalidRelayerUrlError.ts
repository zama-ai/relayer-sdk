import { RelayerErrorBase, RelayerErrorBaseParams } from './RelayerErrorBase';

////////////////////////////////////////////////////////////////////////////////

export type InvalidRelayerUrlErrorType = InvalidRelayerUrlError & {
  name: 'InvalidRelayerUrlError';
};

type InvalidRelayerUrlErrorParams = Omit<RelayerErrorBaseParams, 'name'>;

export class InvalidRelayerUrlError extends RelayerErrorBase {
  constructor(params: InvalidRelayerUrlErrorParams) {
    super({ ...params, name: 'InvalidRelayerUrlError' });
  }
}
