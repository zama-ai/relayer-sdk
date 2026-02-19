import { version, sdkName } from '../_version';

import type { Prettify } from '@base/types/utils';
import type { ErrorBaseParams } from '@base/errors/ErrorBase';
import { ErrorBase } from '@base/errors/ErrorBase';

////////////////////////////////////////////////////////////////////////////////
// ProtocolErrorBase
////////////////////////////////////////////////////////////////////////////////

export type ProtocolErrorBaseType = ProtocolErrorBase & {
  name: 'ProtocolErrorBase';
};

export type ProtocolErrorBaseParams = Prettify<
  Omit<ErrorBaseParams, 'docsUrl' | 'name' | 'version'> & {
    readonly docsPath?: string;
    readonly docsSlug?: string;
    readonly name: string;
  }
>;

export abstract class ProtocolErrorBase extends ErrorBase {
  private static readonly PKG_NAME = sdkName;
  private static readonly VERSION = version;
  private static readonly DEFAULT_DOCS_BASE_URL =
    'https//docs.zama.org' as const;
  private static readonly FULL_VERSION =
    `${ProtocolErrorBase.PKG_NAME}@${ProtocolErrorBase.VERSION}` as const;

  readonly #docsPath: string | undefined;

  constructor(params: ProtocolErrorBaseParams) {
    let docsPath: string | undefined;
    if (params.cause instanceof ProtocolErrorBase) {
      docsPath = params.docsPath ?? params.cause.docsPath;
    } else {
      docsPath = params.docsPath;
    }

    let docsUrl: string | undefined = undefined;
    if (docsPath !== undefined) {
      if (!docsPath.startsWith('/')) {
        docsPath = '/' + docsPath;
      }
      docsUrl = `${ProtocolErrorBase.DEFAULT_DOCS_BASE_URL}${docsPath}${params.docsSlug !== undefined ? `#${params.docsSlug}` : ''}`;
    }

    super({
      ...params,
      name: 'ProtocolErrorBase',
      version: ProtocolErrorBase.FULL_VERSION,
      docsUrl,
    });
  }

  public get docsPath(): string | undefined {
    return this.#docsPath;
  }
}
