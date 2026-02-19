import {
  InvalidPropertyError,
  missingPropertyError,
  throwMissingPropertyError,
} from './InvalidPropertyError';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/base/errors/InvalidPropertyError.test.ts
//
////////////////////////////////////////////////////////////////////////////////

describe('InvalidPropertyError', () => {
  describe('missing property', () => {
    // Format: missing {subject}, expected {expectedType}

    it('missing property with simple expectedType', () => {
      const error = new InvalidPropertyError(
        {
          subject: 'config',
          property: 'timeout',
          type: 'undefined',
          expectedType: 'number',
        },
        {},
      );
      expect(error.message).toBe('missing config.timeout, expected number');
      expect(error.name).toBe('InvalidPropertyError');
    });

    it('missing property with array expectedType', () => {
      const error = new InvalidPropertyError(
        {
          subject: 'config',
          property: 'value',
          type: 'undefined',
          expectedType: ['number', 'string'],
        },
        {},
      );
      expect(error.message).toBe(
        'missing config.value, expected number|string',
      );
    });

    it('missing property with custom expectedType', () => {
      const error = new InvalidPropertyError(
        {
          subject: 'config',
          property: 'foo',
          type: 'undefined',
          expectedType: 'Custom',
          expectedCustomType: 'FooType',
        },
        {},
      );
      expect(error.message).toBe('missing config.foo, expected FooType');
    });

    it('missing property with index', () => {
      const error = new InvalidPropertyError(
        {
          subject: 'config',
          property: 'addresses',
          index: 2,
          type: 'undefined',
          expectedType: 'address',
        },
        {},
      );
      expect(error.message).toBe(
        'missing config.addresses[2], expected address',
      );
    });
  });

  describe('type error', () => {
    // Format: {subject} has unexpected type, expected {expectedType}
    // Format: {subject} has unexpected type, expected {expectedType}, got {type}

    it('type error without actual type', () => {
      const error = new InvalidPropertyError(
        {
          subject: 'config',
          property: 'timeout',
          expectedType: 'number',
        },
        {},
      );
      expect(error.message).toBe(
        'config.timeout has unexpected type, expected number',
      );
    });

    it('type error with actual type', () => {
      const error = new InvalidPropertyError(
        {
          subject: 'config',
          property: 'timeout',
          expectedType: 'number',
          type: 'string',
        },
        {},
      );
      expect(error.message).toBe(
        'config.timeout has unexpected type, expected number, got string',
      );
    });

    it('type error with array expectedType', () => {
      const error = new InvalidPropertyError(
        {
          subject: 'config',
          property: 'value',
          expectedType: ['number', 'string'],
          type: 'object',
        },
        {},
      );
      expect(error.message).toBe(
        'config.value has unexpected type, expected number|string, got object',
      );
    });

    it('type error with index', () => {
      const error = new InvalidPropertyError(
        {
          subject: 'config',
          property: 'addresses',
          index: 2,
          expectedType: 'Custom',
          expectedCustomType: 'Address',
          type: 'number',
        },
        {},
      );
      expect(error.message).toBe(
        'config.addresses[2] has unexpected type, expected Address, got number',
      );
    });

    it('type error with unknown type does not show got', () => {
      const error = new InvalidPropertyError(
        {
          subject: 'config',
          property: 'value',
          expectedType: 'number',
          type: 'unknown',
        },
        {},
      );
      expect(error.message).toBe(
        'config.value has unexpected type, expected number',
      );
    });
  });

  describe('value error', () => {
    // Format: {subject} is invalid. '{value}' is not a valid {expectedType}
    // Format: {subject} has unexpected value, expected '{expectedValue}'
    // Format: {subject} has unexpected value '{value}', expected '{expectedValue}'

    it('value error without value, without expectedValue', () => {
      // Edge case: type matches but no value info - shouldn't happen in practice
      const error = new InvalidPropertyError(
        {
          subject: 'config',
          property: 'retries',
          type: 'number',
          expectedType: 'number',
        },
        {},
      );
      expect(error.message).toBe(
        'config.retries is invalid, expected valid number',
      );
    });

    it('value error with value, without expectedValue', () => {
      const error = new InvalidPropertyError(
        {
          subject: 'config',
          property: 'retries',
          type: 'number',
          expectedType: 'number',
          value: '-1',
        },
        {},
      );
      expect(error.message).toBe(
        "config.retries is invalid. '-1' is not a valid number",
      );
    });

    it('value error without value, with expectedValue', () => {
      const error = new InvalidPropertyError(
        {
          subject: 'config',
          property: 'mode',
          type: 'string',
          expectedType: 'string',
          expectedValue: 'production',
        },
        {},
      );
      expect(error.message).toBe(
        "config.mode has unexpected value, expected 'production'",
      );
    });

    it('value error with value and expectedValue', () => {
      const error = new InvalidPropertyError(
        {
          subject: 'config',
          property: 'mode',
          type: 'string',
          expectedType: 'string',
          value: 'invalid',
          expectedValue: 'production',
        },
        {},
      );
      expect(error.message).toBe(
        "config.mode has unexpected value 'invalid', expected 'production'",
      );
    });

    it('value error with array expectedValue', () => {
      const error = new InvalidPropertyError(
        {
          subject: 'config',
          property: 'mode',
          type: 'string',
          expectedType: 'string',
          value: 'invalid',
          expectedValue: ['production', 'development'],
        },
        {},
      );
      expect(error.message).toBe(
        "config.mode has unexpected value 'invalid', expected 'production|development'",
      );
    });
  });

  describe('subject formatting', () => {
    it('empty property uses subject only', () => {
      const error = new InvalidPropertyError(
        {
          subject: 'config',
          property: '',
          expectedType: 'Custom',
          expectedCustomType: 'object',
          type: 'string',
        },
        {},
      );
      expect(error.message).toBe(
        'config has unexpected type, expected object, got string',
      );
    });

    it('empty property with index', () => {
      const error = new InvalidPropertyError(
        {
          subject: 'items',
          property: '',
          index: 0,
          expectedType: 'Custom',
          expectedCustomType: 'object',
          type: 'string',
        },
        {},
      );
      expect(error.message).toBe(
        'items[0] has unexpected type, expected object, got string',
      );
    });
  });
});

describe('missingPropertyError', () => {
  it('creates error for missing property', () => {
    const error = missingPropertyError(
      {
        subject: 'config',
        property: 'apiKey',
        expectedType: 'string',
      },
      {},
    );
    expect(error.message).toBe('missing config.apiKey, expected string');
    expect(error.name).toBe('InvalidPropertyError');
  });

  it('creates error with custom expectedType', () => {
    const error = missingPropertyError(
      {
        subject: 'options',
        property: 'address',
        expectedType: 'Custom',
        expectedCustomType: 'Address',
      },
      {},
    );
    expect(error.message).toBe('missing options.address, expected Address');
  });
});

describe('throwMissingPropertyError', () => {
  it('throws InvalidPropertyError', () => {
    expect(() =>
      throwMissingPropertyError(
        {
          subject: 'config',
          property: 'apiKey',
          expectedType: 'string',
        },
        {},
      ),
    ).toThrow(InvalidPropertyError);
  });

  it('throws with correct message', () => {
    expect(() =>
      throwMissingPropertyError(
        {
          subject: 'config',
          property: 'apiKey',
          expectedType: 'string',
        },
        {},
      ),
    ).toThrow('missing config.apiKey, expected string');
  });
});
