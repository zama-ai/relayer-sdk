export type RelayerBaseErrorType = RelayerErrorBase & {
  name: 'RelayerErrorBase';
};

export type RelayerErrorBaseParams = {
  cause?: RelayerErrorBase | Error;
  message: string;
  docsBaseUrl?: string;
  docsPath?: string;
  docsSlug?: string;
  metaMessages?: string[];
  details?: string;
  name?: string;
};

export abstract class RelayerErrorBase extends Error {
  override name = 'RelayerErrorBase';

  private _details: string | undefined;
  private _docsPath: string | undefined;
  private _docsUrl: string | undefined;
  private _version: string;

  private static readonly VERSION = '0.3.0-6' as const;
  private static readonly DEFAULT_DOCS_BASE_URL =
    'https//docs.zama.org' as const;
  private static readonly FULL_VERSION =
    `@zama-fhe/relayer-sdk@${RelayerErrorBase.VERSION}` as const;

  constructor(params: RelayerErrorBaseParams) {
    let details;
    let docsPath;

    if (params.cause instanceof RelayerErrorBase) {
      docsPath = params.docsPath || params.cause.docsPath;
      details = params.details || params.cause.details;
    } else {
      docsPath = params.docsPath;
      details = params.details || params.cause?.message;
    }

    const docsUrl = docsPath
      ? `${params.docsBaseUrl ?? RelayerErrorBase.DEFAULT_DOCS_BASE_URL}${docsPath}${
          params.docsSlug ? `#${params.docsSlug}` : ''
        }`
      : undefined;

    const message = [
      params.message || 'An error occurred.',
      '',
      ...(params.metaMessages ? [...params.metaMessages, ''] : []),
      ...(docsUrl ? [`Docs: ${docsUrl}`] : []),
      ...(details ? [`Details: ${details}`] : []),
      `Version: ${RelayerErrorBase.FULL_VERSION}`,
    ].join('\n');

    super(message, params.cause ? { cause: params.cause } : undefined);

    // This line is critical. If removed 'instanceof' will always fail
    // Restore prototype chain (required when extending Error in TypeScript)
    Object.setPrototypeOf(this, new.target.prototype);

    this._details = details;
    this._docsPath = docsPath;
    this._docsUrl = docsUrl;
    this._version = RelayerErrorBase.VERSION;
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
