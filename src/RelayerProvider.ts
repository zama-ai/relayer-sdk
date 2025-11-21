// import { fetchRelayerGet } from './relayer/fetchRelayer';
// import type {
//   RelayerKeyData,
//   RelayerKeyInfo,
//   RelayerKeyUrlResponse,
//   RelayerV2ResultInputProofAcceped,
//   RelayerV2ResultInputProofRejected,
// } from './relayer/fetchRelayer';
// import {
//   assertArrayProperty,
//   assertBytesHexArrayProperty,
//   assertBytesHexProperty,
//   assertObjectProperty,
//   assertStringProperty,
//   cleanURL,
// } from './utils';

// export class RelayerProvider {
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

// function assertIsRelayerKeyUrlResponse(
//   value: unknown,
//   name: string,
// ): asserts value is RelayerKeyUrlResponse {
//   if (!value || typeof value !== 'object') {
//     throw new Error(`Invalid ${name}`);
//   }
//   assertObjectProperty(value, 'response', `${name}.response`);
//   assertArrayProperty(
//     value.response,
//     'fhe_key_info',
//     `${name}.response.fhe_key_info`,
//   );
//   for (let i = 0; i < value.response.fhe_key_info.length; ++i) {
//     assertIsRelayerKeyInfo(
//       value.response.fhe_key_info[i],
//       `${name}.response.fhe_key_info[${i}]`,
//     );
//   }
//   assertObjectProperty(value.response, 'crs', `${name}.response.crs`);
//   const props = Object.keys(value.response);
//   for (let i = 0; i < props.length; ++i) {
//     assertIsRelayerKeyData(
//       value.response.crs[props[i]],
//       `${name}.response.crs.${props[i]}`,
//     );
//   }
// }

// function assertIsRelayerKeyData(
//   value: unknown,
//   name: string,
// ): asserts value is RelayerKeyData {
//   assertStringProperty(value, 'data_id', `${name}.data_id`);
//   assertArrayProperty(value, 'urls', `${name}.urls`);
//   for (let i = 0; i < value.urls.length; ++i) {
//     if (typeof value.urls[i] !== 'string') {
//       throw new Error(`Invalid ${name}.urls[${i}]`);
//     }
//   }
// }

// function assertIsRelayerKeyInfo(
//   value: unknown,
//   name: string,
// ): asserts value is RelayerKeyInfo {
//   assertObjectProperty(value, 'fhe_public_key', `${name}.fhe_public_key`);
//   assertIsRelayerKeyData(value.fhe_public_key, `${name}.fhe_public_key`);
// }

// // RelayerV2ResultInputProofRejected
// function assertIsRelayerV2ResultInputProofRejected(
//   value: unknown,
//   name: string,
// ): asserts value is RelayerV2ResultInputProofRejected {
//   assertBytesHexProperty(value, 'extra_data', `${name}.extra_data`);
//   if (!('accepted' in value) || value.accepted === false) {
//     throw new Error(`Invalid ${name}.accepted`);
//   }
// }

// function assertIsRelayerV2ResultInputProofAccepted(
//   value: unknown,
//   name: string,
// ): asserts value is RelayerV2ResultInputProofAcceped {
//   assertBytesHexProperty(value, 'extra_data', name);
//   if (!('accepted' in value) || value.accepted === true) {
//     throw new Error(`Invalid ${name}.accepted`);
//   }
//   assertBytesHexArrayProperty(value, 'handles', name);
//   assertBytesHexArrayProperty(value, 'signatures', name);
// }
