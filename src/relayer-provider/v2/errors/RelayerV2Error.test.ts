import { InvalidPropertyError } from '../../../errors/InvalidPropertyError';
import { RelayerV2ResponseInvalidBodyError } from './RelayerV2ResponseInvalidBodyError';
import { RelayerV2AbortError } from './RelayerV2AbortError';
import { RelayerV2FetchError } from './RelayerV2FetchError';
import { RelayerV2MaxRetryError } from './RelayerV2MaxRetryError';
import { RelayerV2ResponseApiError } from './RelayerV2ResponseApiError';
import { RelayerV2ResponseInputProofRejectedError } from './RelayerV2ResponseInputProofRejectedError';
import { RelayerV2ResponseStatusError } from './RelayerV2ResponseStatusError';
import { RelayerV2StateError } from './RelayerV2StateError';
import { RelayerV2TimeoutError } from './RelayerV2TimeoutError';

// npx jest --colors --passWithNoTests ./src/relayer-provider/v2/errors/RelayerV2Error.test.ts

////////////////////////////////////////////////////////////////////////////////
// Test Constants
////////////////////////////////////////////////////////////////////////////////

const TEST_STATE = {
  aborted: false,
  canceled: false,
  failed: true,
  fetching: false,
  running: false,
  succeeded: false,
  terminated: true,
  timeout: false,
};

////////////////////////////////////////////////////////////////////////////////
// RelayerV2ResponseInvalidBodyError
////////////////////////////////////////////////////////////////////////////////

describe('RelayerV2ResponseInvalidBodyError', () => {
  it('error.name is the class name', () => {
    const cause = new InvalidPropertyError({
      objName: 'body',
      property: 'foo',
      expectedType: 'string',
      type: 'number',
    });

    const error = new RelayerV2ResponseInvalidBodyError({
      cause,
      bodyJson: '{"foo": 123}',
      fetchMethod: 'POST',
      url: 'https://example.com/api',
      operation: 'INPUT_PROOF',
      status: 400,
      retryCount: 0,
      elapsed: 100,
      state: TEST_STATE,
    });

    expect(error.name).toBe('RelayerV2ResponseInvalidBodyError');
  });
});

////////////////////////////////////////////////////////////////////////////////
// RelayerV2AbortError
////////////////////////////////////////////////////////////////////////////////

describe('RelayerV2AbortError', () => {
  it('error.name is the class name', () => {
    const error = new RelayerV2AbortError({
      url: 'https://example.com/api',
      operation: 'INPUT_PROOF',
    });

    expect(error.name).toBe('RelayerV2AbortError');
  });
});

////////////////////////////////////////////////////////////////////////////////
// RelayerV2FetchError
////////////////////////////////////////////////////////////////////////////////

describe('RelayerV2FetchError', () => {
  it('error.name is the class name', () => {
    const error = new RelayerV2FetchError({
      fetchMethod: 'POST',
      url: 'https://example.com/api',
      operation: 'INPUT_PROOF',
      retryCount: 0,
      elapsed: 100,
      state: TEST_STATE,
      cause: new Error('Network error'),
      message: 'Fetch error',
    });

    expect(error.name).toBe('RelayerV2FetchError');
  });
});

////////////////////////////////////////////////////////////////////////////////
// RelayerV2MaxRetryError
////////////////////////////////////////////////////////////////////////////////

describe('RelayerV2MaxRetryError', () => {
  it('error.name is the class name', () => {
    const error = new RelayerV2MaxRetryError({
      fetchMethod: 'POST',
      url: 'https://example.com/api',
      operation: 'INPUT_PROOF',
      retryCount: 3,
      elapsed: 5000,
      state: TEST_STATE,
    });

    expect(error.name).toBe('RelayerV2MaxRetryError');
  });
});

////////////////////////////////////////////////////////////////////////////////
// RelayerV2ResponseApiError
////////////////////////////////////////////////////////////////////////////////

describe('RelayerV2ResponseApiError', () => {
  it('error.name is the class name', () => {
    const error = new RelayerV2ResponseApiError({
      fetchMethod: 'POST',
      url: 'https://example.com/api',
      operation: 'INPUT_PROOF',
      status: 400,
      retryCount: 0,
      elapsed: 100,
      state: TEST_STATE,
      relayerApiError: {
        label: 'malformed_json',
        message: 'Invalid JSON payload',
      },
    });

    expect(error.name).toBe('RelayerV2ResponseApiError');
  });
});

////////////////////////////////////////////////////////////////////////////////
// RelayerV2ResponseInputProofRejectedError
////////////////////////////////////////////////////////////////////////////////

describe('RelayerV2ResponseInputProofRejectedError', () => {
  it('error.name is the class name', () => {
    const error = new RelayerV2ResponseInputProofRejectedError({
      fetchMethod: 'GET',
      url: 'https://example.com/api',
      operation: 'INPUT_PROOF',
      status: 200,
      retryCount: 0,
      elapsed: 100,
      state: TEST_STATE,
    });

    expect(error.name).toBe('RelayerV2ResponseInputProofRejectedError');
  });
});

////////////////////////////////////////////////////////////////////////////////
// RelayerV2ResponseStatusError
////////////////////////////////////////////////////////////////////////////////

describe('RelayerV2ResponseStatusError', () => {
  it('error.name is the class name', () => {
    const error = new RelayerV2ResponseStatusError({
      fetchMethod: 'POST',
      url: 'https://example.com/api',
      operation: 'INPUT_PROOF',
      status: 500,
      retryCount: 0,
      elapsed: 100,
      state: TEST_STATE,
    });

    expect(error.name).toBe('RelayerV2ResponseStatusError');
  });
});

////////////////////////////////////////////////////////////////////////////////
// RelayerV2StateError
////////////////////////////////////////////////////////////////////////////////

describe('RelayerV2StateError', () => {
  it('error.name is the class name', () => {
    const error = new RelayerV2StateError({
      state: TEST_STATE,
      message: 'Invalid state transition',
    });

    expect(error.name).toBe('RelayerV2StateError');
  });
});

////////////////////////////////////////////////////////////////////////////////
// RelayerV2TimeoutError
////////////////////////////////////////////////////////////////////////////////

describe('RelayerV2TimeoutError', () => {
  it('error.name is the class name', () => {
    const error = new RelayerV2TimeoutError({
      url: 'https://example.com/api',
      operation: 'INPUT_PROOF',
      timeoutMs: 30000,
    });

    expect(error.name).toBe('RelayerV2TimeoutError');
  });
});
