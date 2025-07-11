import { RelayerFetchResponseJson, RelayerOperation } from './fetchRelayer';

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
        const responseText = await response.text();
        message = `Relayer didn't response correctly. Bad status ${response.statusText}. Content: ${responseText}`;
        break;
      }
    }
  }

  const cause = {
    code: 'RELAYER_FETCH_ERROR',
    operation,
    status: response.status,
    statusText: response.statusText,
    url: response.url,
  };

  throw new Error(message, {
    cause,
  });
}

export function throwRelayerJSONError(
  operation: RelayerOperation,
  error: unknown,
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

  const cause = {
    code: 'RELAYER_NO_JSON_ERROR',
    operation,
    error,
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

  const cause = {
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
  json: RelayerFetchResponseJson,
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

  const cause = {
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

  const cause = {
    code: 'RELAYER_UNKNOWN_ERROR',
    operation,
    error,
  };

  throw new Error(message ?? "Relayer didn't response correctly.", {
    cause,
  });
}
