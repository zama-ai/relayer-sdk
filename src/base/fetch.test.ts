import { fetchBytes } from './fetch';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/utils/fetch.test.ts
// npx jest --colors --passWithNoTests --coverage ./src/utils/fetch.test.ts --collectCoverageFrom=./src/utils/fetch.ts
//
////////////////////////////////////////////////////////////////////////////////

describe('fetchBytes', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  //////////////////////////////////////////////////////////////////////////////

  it('fetches bytes using arrayBuffer method', async () => {
    const testData = new Uint8Array([1, 2, 3, 4, 5]);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: jest.fn().mockResolvedValue(testData.buffer),
    });

    const result = await fetchBytes('https://example.com/data');
    expect(result).toEqual(testData);
    expect(global.fetch).toHaveBeenCalledWith('https://example.com/data');
  });

  //////////////////////////////////////////////////////////////////////////////

  it('fetches bytes using bytes method when available', async () => {
    const testData = new Uint8Array([1, 2, 3, 4, 5]);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      bytes: jest.fn().mockResolvedValue(testData),
    });

    const result = await fetchBytes('https://example.com/data');
    expect(result).toEqual(testData);
  });

  //////////////////////////////////////////////////////////////////////////////

  it('throws error when response is not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      url: 'https://example.com/not-found',
    });

    await expect(fetchBytes('https://example.com/not-found')).rejects.toThrow(
      'HTTP error! status: 404 on https://example.com/not-found',
    );
  });
});
