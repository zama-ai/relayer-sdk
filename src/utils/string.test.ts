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

    const s = 'hello/';
    const suffix = '';
    console.log(s.slice(0, -1));
    console.log(s.slice(0, -0));
    console.log(s.slice(0, -suffix.length));
    // s.endsWith('') ? s.slice(0, -suffix.length) : s;
    // if ()
    //expect(removeSuffix('hello/', '')).toEqual('hello/');
    expect(removeSuffix('hello/', 'o')).toEqual('hello/');
  });
});
