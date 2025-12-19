import { ensure0x, removeSuffix } from './string';

// npx jest --colors --passWithNoTests --coverage ./src/utils/string.test.ts --collectCoverageFrom=./src/utils/string.ts

describe('string', () => {
  it('ensure0x', () => {
    expect(ensure0x('hello')).toEqual('0xhello');
    expect(ensure0x('0xhello')).toEqual('0xhello');
  });

  it('removeSuffix', () => {
    expect(removeSuffix('hello/', '/')).toEqual('hello');
    expect(removeSuffix('hello/', 'o/')).toEqual('hell');
    expect(removeSuffix('hello/', '')).toEqual('hello/');
    expect(removeSuffix('hello/', 'o')).toEqual('hello/');
  });
});
