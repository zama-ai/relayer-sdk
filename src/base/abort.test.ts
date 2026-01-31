import { throwIfAborted } from './abort';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/base/abort.test.ts
// npx jest --colors --passWithNoTests --coverage ./src/base/abort.test.ts --collectCoverageFrom=./src/base/abort.ts
//
////////////////////////////////////////////////////////////////////////////////

describe('throwIfAborted', () => {
  //////////////////////////////////////////////////////////////////////////////
  // No-op cases
  //////////////////////////////////////////////////////////////////////////////

  it('does nothing when signal is undefined', () => {
    expect(() => throwIfAborted(undefined)).not.toThrow();
  });

  it('does nothing when signal is null', () => {
    expect(() => throwIfAborted(null)).not.toThrow();
  });

  it('does nothing when signal is not aborted', () => {
    const controller = new AbortController();
    expect(() => throwIfAborted(controller.signal)).not.toThrow();
  });

  //////////////////////////////////////////////////////////////////////////////
  // Throws when aborted
  //////////////////////////////////////////////////////////////////////////////

  it('throws AbortError when signal is aborted', () => {
    const controller = new AbortController();
    controller.abort();

    expect(() => throwIfAborted(controller.signal)).toThrow();
  });

  it('thrown error has name AbortError', () => {
    const controller = new AbortController();
    controller.abort();

    try {
      throwIfAborted(controller.signal);
      throw new Error('Expected to throw');
    } catch (error) {
      expect((error as Error).name).toBe('AbortError');
    }
  });

  it('throws when signal aborted with custom reason', () => {
    const controller = new AbortController();
    const customReason = new Error('Custom abort reason');
    controller.abort(customReason);

    expect(() => throwIfAborted(controller.signal)).toThrow();
  });

  //////////////////////////////////////////////////////////////////////////////
  // Fallback behavior (simulated older environment)
  //////////////////////////////////////////////////////////////////////////////

  it('uses fallback when throwIfAborted method is not available', () => {
    // Create a mock signal without throwIfAborted method
    const mockSignal = {
      aborted: true,
      reason: undefined,
      onabort: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    } as unknown as AbortSignal;

    expect(() => throwIfAborted(mockSignal)).toThrow(DOMException);
  });

  it('fallback throws DOMException with AbortError name', () => {
    const mockSignal = {
      aborted: true,
      reason: undefined,
      onabort: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    } as unknown as AbortSignal;

    try {
      throwIfAborted(mockSignal);
      throw new Error('Expected to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(DOMException);
      expect((error as DOMException).name).toBe('AbortError');
      expect((error as DOMException).message).toBe(
        'This operation was aborted',
      );
    }
  });

  it('fallback does not throw when signal not aborted', () => {
    const mockSignal = {
      aborted: false,
      reason: undefined,
      onabort: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    } as unknown as AbortSignal;

    expect(() => throwIfAborted(mockSignal)).not.toThrow();
  });
});
