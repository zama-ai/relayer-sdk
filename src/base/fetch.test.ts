import { getResponseBytes } from './fetch';

////////////////////////////////////////////////////////////////////////////////
//
// Jest Command line
// =================
//
// npx jest --colors --passWithNoTests ./src/base/fetch.test.ts
// npx jest --colors --passWithNoTests --coverage ./src/base/fetch.test.ts --collectCoverageFrom=./src/base/fetch.ts
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

    const response = await fetch('https://example.com/data');
    const result = await getResponseBytes(response);

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

    const response = await fetch('https://example.com/data');
    const result = await getResponseBytes(response);

    expect(result).toEqual(testData);
  });
});
