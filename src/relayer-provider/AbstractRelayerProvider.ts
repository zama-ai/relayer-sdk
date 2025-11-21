import type { RelayerKeyUrlResponse } from '../relayer/fetchRelayer';

export abstract class AbstractRelayerProvider {
  private readonly _relayerUrl: string;

  constructor(relayerUrl: string) {
    this._relayerUrl = relayerUrl;
  }

  public get url(): string {
    return this._relayerUrl;
  }
  public get keyUrl(): string {
    return `${this.url}/keyurl`;
  }
  public abstract get version(): number;
  public abstract fetchGetKeyUrl(): Promise<RelayerKeyUrlResponse>;
}
