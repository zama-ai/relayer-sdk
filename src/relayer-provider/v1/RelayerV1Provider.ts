import { AbstractRelayerProvider } from '../AbstractRelayerProvider';

export class RelayerV1Provider extends AbstractRelayerProvider {
  public get version(): number {
    return 1;
  }
}
