import { version, sdkName } from '../_version';

import type { Prettify } from '@base/types/utils';
import type { ErrorBaseParams } from '@base/errors/ErrorBase';
import { ErrorBase } from '@base/errors/ErrorBase';

export type RelayerErrorBaseType = RelayerErrorBase & {
  name: 'RelayerErrorBase';
};

export type RelayerErrorBaseParams = Prettify<
  Omit<ErrorBaseParams, 'docsUrl' | 'name' | 'version'> & {
    readonly docsPath?: string;
    readonly docsSlug?: string;
    readonly name: string;
  }
>;

export abstract class RelayerErrorBase extends ErrorBase {
  private static readonly PKG_NAME = sdkName;
  private static readonly VERSION = version;
  private static readonly DEFAULT_DOCS_BASE_URL =
    'https//docs.zama.org' as const;
  private static readonly FULL_VERSION =
    `${RelayerErrorBase.PKG_NAME}@${RelayerErrorBase.VERSION}` as const;

  readonly #docsPath: string | undefined;

  constructor(params: RelayerErrorBaseParams) {
    let docsPath: string | undefined;
    if (params.cause instanceof RelayerErrorBase) {
      docsPath = params.docsPath ?? params.cause.docsPath;
    } else {
      docsPath = params.docsPath;
    }

    let docsUrl: string | undefined = undefined;
    if (docsPath !== undefined) {
      if (!docsPath.startsWith('/')) {
        docsPath = '/' + docsPath;
      }
      docsUrl = `${RelayerErrorBase.DEFAULT_DOCS_BASE_URL}${docsPath}${params.docsSlug !== undefined ? `#${params.docsSlug}` : ''}`;
    }

    super({
      ...params,
      name: 'RelayerErrorBase',
      version: RelayerErrorBase.FULL_VERSION,
      docsUrl,
    });
  }

  public get docsPath(): string | undefined {
    return this.#docsPath;
  }
}
