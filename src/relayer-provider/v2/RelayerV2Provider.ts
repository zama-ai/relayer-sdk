import type { RelayerKeyUrlResponse } from '../../relayer/fetchRelayer';
import { fetchRelayerGet } from '../../relayer/fetchRelayer';
import { AbstractRelayerProvider } from '../AbstractRelayerProvider';

export class RelayerV2Provider extends AbstractRelayerProvider {
  constructor(relayerUrl: string) {
    super(relayerUrl);
  }
  public get version(): number {
    return 2;
  }

  public async fetchGetKeyUrl(): Promise<RelayerKeyUrlResponse> {
    const response = await fetchRelayerGet('KEY_URL', this.keyUrl);

    return response;
  }
}
//   private readonly _relayerUrl: string;
//   private readonly _version: number;

//   private static readonly DEFAULT_RELAYER_ROUTE_VERSION: number = 1;

//   constructor(params: { relayerUrl: string; defaultRelayerBaseUrl: string }) {
//     const res = RelayerProvider._resolveRelayerUrl(
//       params.relayerUrl,
//       params.defaultRelayerBaseUrl,
//     );
//     if (!res) {
//       throw new Error('Missing or invalid relayerUrl');
//     }
//     this._relayerUrl = res.url;
//     this._version = res.version;
//   }

//   public get url(): string {
//     return this._relayerUrl;
//   }

//   public get version(): number {
//     return this._version;
//   }

//   private static _resolveRelayerUrl(
//     value: unknown,
//     defaultRelayerBaseUrl: string,
//   ): { url: string; version: number } | null {
//     if (!value || typeof value !== 'string') {
//       return null;
//     }

//     const url = cleanURL(value);
//     if (url === defaultRelayerBaseUrl) {
//       return {
//         url: `${defaultRelayerBaseUrl}/v${RelayerProvider.DEFAULT_RELAYER_ROUTE_VERSION}`,
//         version: RelayerProvider.DEFAULT_RELAYER_ROUTE_VERSION,
//       };
//     }

//     if (!URL.canParse(url)) {
//       return null;
//     }

//     // Try to parse version number:
//     // https://relayer.testnet.zama.org/vXXX
//     const prefix = `${defaultRelayerBaseUrl}/v`;
//     if (url.startsWith(prefix)) {
//       // Determine version
//       const version = Number.parseInt(url.substring(prefix.length));
//       if (!Number.isInteger(version) || version <= 1) {
//         return null;
//       }

//       return { url, version };
//     }

//     return { url, version: RelayerProvider.DEFAULT_RELAYER_ROUTE_VERSION };
//   }

//   public async fetchGetKeyUrl(): Promise<RelayerKeyUrlResponse> {
//     if (this._version === 1) {
//       const data: RelayerKeyUrlResponse = await fetchRelayerGet(
//         'KEY_URL',
//         `${this._relayerUrl}/keyurl`,
//       );
//       assertIsRelayerKeyUrlResponse(data, 'fetchGetKeyUrl()');
//       return data;
//     }

//     throw new Error(
//       `fetchGetKeyUrl version=${this._version} not yet implemented`,
//     );
//   }
// }
