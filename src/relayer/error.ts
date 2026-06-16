import type { RelayerOperation } from '@relayer-provider/types/public-api';
import type { RelayerV1ProviderErrorCause } from '@relayer-provider/v1/types';
import { isNonEmptyString, isRecordStringProperty } from '@base/string';

export function getErrorCause(e: unknown): object | undefined {
  if (e instanceof Error && typeof e.cause === 'object' && e.cause !== null) {
    return e.cause;
  }
  return undefined;
}

export function getErrorCauseCode(e: unknown): string | undefined {
  const cause = getErrorCause(e);
  if (!cause || !('code' in cause) || !cause.code) {
    return undefined;
  }
  if (typeof cause.code !== 'string') {
    return undefined;
  }
  return cause.code;
}

export function getErrorCauseStatus(e: unknown): number | undefined {
  const cause = getErrorCause(e);
  if (!cause || !('status' in cause) || cause.status === undefined) {
    return undefined;
  }
  if (typeof cause.status !== 'number') {
    return undefined;
  }
  return cause.status;
}

export function getErrorCauseErrorMessage(e: unknown): string | undefined {
  const cause = getErrorCause(e);
  if (!cause || !('error' in cause) || !cause.error) {
    return undefined;
  }
  if (cause.error instanceof Error) {
    return cause.error.message;
  }
  if (
    typeof cause.error === 'object' &&
    'message' in cause.error &&
    typeof cause.error.message === 'string'
  ) {
    return cause.error.message;
  }
  return undefined;
}

export async function throwRelayerResponseError(
  operation: RelayerOperation,
  response: Response,
): Promise<never> {
  // Read the body once, up front, so we can both preserve it in the error cause
  // and surface any message the relayer or an intermediary (e.g. Cloudflare or
  // Kong) provided — instead of assuming the reason for the failure. This
  // matters for auth failures: e.g. a 403 edge block for a missing `x-api-key`
  // header carries a useful message that was previously discarded.
  const { responseJson, serverMessage } = await readRelayerErrorBody(response);

  let message: string;

  // Special case for 429
  if (response.status === 429) {
    message = `Relayer rate limit exceeded: Please wait and try again later.`;
  } else {
    switch (operation) {
      case 'PUBLIC_DECRYPT': {
        message = `Public decrypt failed: relayer respond with HTTP code ${response.status}`;
        break;
      }
      case 'USER_DECRYPT': {
        message = `User decrypt failed: relayer respond with HTTP code ${response.status}`;
        break;
      }
      case 'KEY_URL': {
        message = `HTTP error! status: ${response.status}`;
        break;
      }
      default: {
        message = `Relayer didn't response correctly. Bad status ${response.statusText}.`;
        break;
      }
    }
  }

  // Surface the relayer/intermediary message when present.
  if (isNonEmptyString(serverMessage)) {
    message = `${message} ${serverMessage}`;
  }

  const cause: RelayerV1ProviderErrorCause = {
    code: 'RELAYER_FETCH_ERROR',
    operation,
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    response,
    responseJson,
  };

  throw new Error(message, {
    cause,
  });
}

/**
 * Best-effort read of a relayer error response body. Returns the parsed JSON
 * (or raw text) for the error cause, plus the message provided by the relayer
 * or an intermediary (Cloudflare/Kong). The body may be a relayer JSON error
 * (`{ error: { message } }`), a flat `{ message }`, or plain text. Never throws.
 */
async function readRelayerErrorBody(
  response: Response,
): Promise<{ responseJson: unknown; serverMessage: string | undefined }> {
  let responseText = '';
  try {
    responseText = await response.text();
  } catch {
    return { responseJson: '', serverMessage: undefined };
  }

  if (!isNonEmptyString(responseText)) {
    return { responseJson: '', serverMessage: undefined };
  }

  try {
    const parsed: unknown = JSON.parse(responseText);
    // Relayer errors may be nested under `error`; edge/gateway errors
    // (Cloudflare/Kong) are usually flat `{ message, label }`.
    const err: unknown =
      typeof parsed === 'object' && parsed !== null && 'error' in parsed
        ? (parsed as { error: unknown }).error
        : parsed;
    const serverMessage = isRecordStringProperty(err, 'message')
      ? err.message
      : undefined;
    return { responseJson: parsed, serverMessage };
  } catch {
    // Body was not JSON — surface the raw text (truncated to stay readable).
    return {
      responseJson: responseText,
      serverMessage: responseText.slice(0, 512),
    };
  }
}

export function throwRelayerJSONError(
  operation: RelayerOperation,
  error: unknown,
  response: Response,
): never {
  let message: string;
  switch (operation) {
    case 'PUBLIC_DECRYPT': {
      message = "Public decrypt failed: Relayer didn't return a JSON";
      break;
    }
    case 'USER_DECRYPT': {
      message = "User decrypt failed: Relayer didn't return a JSON";
      break;
    }
    default: {
      message = "Relayer didn't return a JSON";
      break;
    }
  }

  const cause: RelayerV1ProviderErrorCause = {
    code: 'RELAYER_NO_JSON_ERROR',
    operation,
    error,
    response,
  };

  throw new Error(message, {
    cause,
  });
}

export function throwRelayerUnexpectedJSONError(
  operation: RelayerOperation,
  error: unknown,
): never {
  let message: string;
  switch (operation) {
    case 'PUBLIC_DECRYPT': {
      message =
        'Public decrypt failed: Relayer returned an unexpected JSON response';
      break;
    }
    case 'USER_DECRYPT': {
      message =
        'User decrypt failed: Relayer returned an unexpected JSON response';
      break;
    }
    default: {
      message = 'Relayer returned an unexpected JSON response';
      break;
    }
  }

  const cause: RelayerV1ProviderErrorCause = {
    code: 'RELAYER_UNEXPECTED_JSON_ERROR',
    operation,
    error,
  };

  throw new Error(message, {
    cause,
  });
}

export function throwRelayerInternalError(
  operation: RelayerOperation,
  json: unknown,
): never {
  let message: string;
  switch (operation) {
    case 'PUBLIC_DECRYPT': {
      message =
        "Pulbic decrypt failed: the public decryption didn't succeed for an unknown reason";
      break;
    }
    case 'USER_DECRYPT': {
      message =
        "User decrypt failed: the user decryption didn't succeed for an unknown reason";
      break;
    }
    default: {
      message = "Relayer didn't response correctly.";
      break;
    }
  }

  const cause: RelayerV1ProviderErrorCause = {
    code: 'RELAYER_INTERNAL_ERROR',
    operation,
    error: json,
  };

  throw new Error(message, {
    cause,
  });
}

export function throwRelayerUnknownError(
  operation: RelayerOperation,
  error: unknown,
  message?: string,
): never {
  if (!message) {
    switch (operation) {
      case 'PUBLIC_DECRYPT': {
        message = "Public decrypt failed: Relayer didn't respond";
        break;
      }
      case 'USER_DECRYPT': {
        message = "User decrypt failed: Relayer didn't respond";
        break;
      }
      default: {
        message = "Relayer didn't response correctly. Bad JSON.";
        break;
      }
    }
  }

  const cause: RelayerV1ProviderErrorCause = {
    code: 'RELAYER_UNKNOWN_ERROR',
    operation,
    error,
  };

  throw new Error(message ?? "Relayer didn't response correctly.", {
    cause,
  });
}
