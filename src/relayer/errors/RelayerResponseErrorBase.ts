import type { RelayerFetchErrorBaseParams } from './RelayerFetchErrorBase';
import type { Prettify } from '@base/types/utils';
import { RelayerFetchErrorBase } from './RelayerFetchErrorBase';

////////////////////////////////////////////////////////////////////////////////
// RelayerResponseErrorBase
////////////////////////////////////////////////////////////////////////////////

export type RelayerResponseErrorBaseType = RelayerResponseErrorBase & {
  name: 'RelayerResponseErrorBase';
};

export type RelayerResponseErrorBaseParams = Prettify<
  RelayerFetchErrorBaseParams & {
    readonly status: number;
  }
>;

export abstract class RelayerResponseErrorBase extends RelayerFetchErrorBase {
  readonly #status: number;

  constructor(params: RelayerResponseErrorBaseParams) {
    const metaMessages = [`status: ${params.status}`];

    super({
      ...params,
      metaMessages,
    });
    this.#status = params.status;
  }

  public get status(): number {
    return this.#status;
  }
}
