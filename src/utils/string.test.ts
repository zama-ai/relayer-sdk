import { ensure0x } from './string';

describe('string', () => {
  it('ensure0x', () => {
    expect(ensure0x('hello')).toEqual('0xhello');
    expect(ensure0x('0xhello')).toEqual('0xhello');
  });
});
