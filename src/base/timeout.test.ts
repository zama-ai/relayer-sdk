import { abortableSleep } from './timeout';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/base/timeout.test.ts
// npx jest --colors --passWithNoTests --coverage ./src/base/timeout.test.ts --collectCoverageFrom=./src/base/timeout.ts
//
////////////////////////////////////////////////////////////////////////////////

describe('abortableSleep', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  //////////////////////////////////////////////////////////////////////////////
  // Basic sleep behavior
  //////////////////////////////////////////////////////////////////////////////

  it('resolves after specified delay', async () => {
    const promise = abortableSleep(1000);

    jest.advanceTimersByTime(999);
    // Should not resolve yet
    let resolved = false;
    promise.then(() => {
      resolved = true;
    });

    await Promise.resolve(); // flush microtasks
    expect(resolved).toBe(false);

    jest.advanceTimersByTime(1);
    await promise;
  });

  it('resolves without signal', async () => {
    const promise = abortableSleep(100);
    jest.advanceTimersByTime(100);
    await expect(promise).resolves.toBeUndefined();
  });

  it('resolves with undefined signal', async () => {
    const promise = abortableSleep(100, undefined);
    jest.advanceTimersByTime(100);
    await expect(promise).resolves.toBeUndefined();
  });

  //////////////////////////////////////////////////////////////////////////////
  // Abort before sleep starts
  //////////////////////////////////////////////////////////////////////////////

  it('throws immediately if signal already aborted', () => {
    const controller = new AbortController();
    controller.abort();

    // throwIfAborted throws synchronously before Promise is created
    expect(() => abortableSleep(1000, controller.signal)).toThrow();
  });

  it('throws AbortError if signal already aborted', () => {
    const controller = new AbortController();
    controller.abort();

    try {
      abortableSleep(1000, controller.signal);
      throw new Error('Expected to throw');
    } catch (error) {
      expect((error as Error).name).toBe('AbortError');
    }
  });

  //////////////////////////////////////////////////////////////////////////////
  // Abort during sleep
  //////////////////////////////////////////////////////////////////////////////

  it('rejects when signal is aborted during sleep', async () => {
    const controller = new AbortController();
    const promise = abortableSleep(1000, controller.signal);

    // Advance halfway
    jest.advanceTimersByTime(500);

    // Abort
    controller.abort();

    await expect(promise).rejects.toThrow();
  });

  it('rejected error has name AbortError when aborted during sleep', async () => {
    const controller = new AbortController();
    const promise = abortableSleep(1000, controller.signal);

    jest.advanceTimersByTime(500);
    controller.abort();

    try {
      await promise;
      throw new Error('Expected to throw');
    } catch (error) {
      expect((error as Error).name).toBe('AbortError');
    }
  });

  it('preserves abort reason as cause', async () => {
    const controller = new AbortController();
    const customReason = new Error('Custom reason');

    const promise = abortableSleep(1000, controller.signal);

    jest.advanceTimersByTime(500);
    controller.abort(customReason);

    try {
      await promise;
      throw new Error('Expected to throw');
    } catch (error) {
      expect((error as Error).cause).toBe(customReason);
    }
  });

  //////////////////////////////////////////////////////////////////////////////
  // Timer cleanup
  //////////////////////////////////////////////////////////////////////////////

  it('clears timeout when aborted', async () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    const controller = new AbortController();

    const promise = abortableSleep(1000, controller.signal);

    controller.abort();

    try {
      await promise;
    } catch {
      // Expected
    }

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  //////////////////////////////////////////////////////////////////////////////
  // Edge cases
  //////////////////////////////////////////////////////////////////////////////

  it('works with zero delay', async () => {
    const promise = abortableSleep(0);
    jest.advanceTimersByTime(0);
    await expect(promise).resolves.toBeUndefined();
  });

  it('non-aborted signal allows sleep to complete', async () => {
    const controller = new AbortController();
    const promise = abortableSleep(100, controller.signal);

    jest.advanceTimersByTime(100);

    await expect(promise).resolves.toBeUndefined();
  });
});
