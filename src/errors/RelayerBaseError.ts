import { version } from './version';

const DEFAULT_DOCS_BASE_URL = 'https//docs.zama.org';
const FULL_VERSION = `@zama-fhe/relayer-sdk@${version}`;

export type RelayerBaseErrorType = RelayerBaseError & {
  name: 'RelayerBaseError';
};

export type RelayerBaseErrorParams = {
  cause?: RelayerBaseError | Error;
  message: string;
  docsBaseUrl?: string;
  docsPath?: string;
  docsSlug?: string;
  metaMessages?: string[];
  details?: string;
  name?: string;
};

export class RelayerBaseError extends Error {
  override name = 'RelayerBaseError';

  private _details: string | undefined;
  private _docsPath: string | undefined;
  private _docsUrl: string | undefined;
  private _version: string;

  constructor(params: RelayerBaseErrorParams) {
    let details;
    let docsPath;

    if (params.cause instanceof RelayerBaseError) {
      docsPath = params.docsPath || params.cause.docsPath;
      details = params.details || params.cause.details;
    } else {
      docsPath = params.docsPath;
      details = params.details || params.cause?.message;
    }

    const docsUrl = docsPath
      ? `${params.docsBaseUrl ?? DEFAULT_DOCS_BASE_URL}${docsPath}${
          params.docsSlug ? `#${params.docsSlug}` : ''
        }`
      : undefined;

    const message = [
      params.message || 'An error occurred.',
      '',
      ...(params.metaMessages ? [...params.metaMessages, ''] : []),
      ...(docsUrl ? [`Docs: ${docsUrl}`] : []),
      ...(details ? [`Details: ${details}`] : []),
      `Version: ${FULL_VERSION}`,
    ].join('\n');

    super(message, params.cause ? { cause: params.cause } : undefined);

    this._details = details;
    this._docsPath = docsPath;
    this._docsUrl = docsUrl;
    this._version = version;
    this.name = params.name ?? this.name;
  }

  public get docsPath(): string | undefined {
    return this._docsPath;
  }

  public get docsUrl(): string | undefined {
    return this._docsUrl;
  }

  public get details(): string | undefined {
    return this._details;
  }

  public get version(): string {
    return this._version;
  }
}
