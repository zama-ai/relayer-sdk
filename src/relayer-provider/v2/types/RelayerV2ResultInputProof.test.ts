import {
  assertIsRelayerV2ResultInputProof,
  assertIsRelayerV2ResultInputProofAccepted,
  assertIsRelayerV2ResultInputProofRejected,
} from './RelayerV2ResultInputProof';

// npx jest --colors --passWithNoTests --coverage ./src/relayer-provider/v2/types/RelayerV2ResultInputProof.test.ts --collectCoverageFrom=./src/relayer-provider/v2/types/RelayerV2ResultInputProof.ts

function test_assertIsRelayerV2ResultInputProof_accepted() {
  expect(() =>
    assertIsRelayerV2ResultInputProof({ foo: 'bar' }, 'Foo'),
  ).toThrow('Invalid Foo.accepted');
  expect(() =>
    assertIsRelayerV2ResultInputProofAccepted(
      { accepted: false, extra_data: '0xdead' },
      'Foo',
    ),
  ).toThrow('Invalid Foo.accepted');
  expect(() =>
    assertIsRelayerV2ResultInputProof({ accepted: true }, 'Foo'),
  ).toThrow('Invalid Foo.extra_data');
  expect(() =>
    assertIsRelayerV2ResultInputProof(
      { accepted: true, extra_data: 'dead' },
      'Foo',
    ),
  ).toThrow('Invalid bytes hex Foo.extra_data');
  expect(() =>
    assertIsRelayerV2ResultInputProof(
      { accepted: true, extra_data: '0xdead' },
      'Foo',
    ),
  ).toThrow('Invalid Foo.handles');
  expect(() =>
    assertIsRelayerV2ResultInputProof(
      { accepted: true, extra_data: '0xdead', handles: 'hello' },
      'Foo',
    ),
  ).toThrow('Invalid array Foo.handles');
  expect(() =>
    assertIsRelayerV2ResultInputProof(
      { accepted: true, extra_data: '0xdead', handles: ['hello'] },
      'Foo',
    ),
  ).toThrow('Invalid bytes32 hex Foo.handles[0]');
  expect(() =>
    assertIsRelayerV2ResultInputProof(
      {
        accepted: true,
        extra_data: '0xdead',
        handles: [
          '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
        ],
      },
      'Foo',
    ),
  ).toThrow('Invalid Foo.signatures');
  expect(() =>
    assertIsRelayerV2ResultInputProof(
      {
        accepted: true,
        extra_data: '0xdead',
        handles: [
          '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
        ],
        signatures: {},
      },
      'Foo',
    ),
  ).toThrow('Invalid array Foo.signatures');
  expect(() =>
    assertIsRelayerV2ResultInputProof(
      {
        accepted: true,
        extra_data: '0xdead',
        handles: [
          '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
        ],
        signatures: [123],
      },
      'Foo',
    ),
  ).toThrow('Invalid bytes hex Foo.signatures[0]');
  expect(() =>
    assertIsRelayerV2ResultInputProof(
      {
        accepted: true,
        extra_data: '0xdead',
        handles: [
          '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
        ],
        signatures: ['0x12'],
      },
      'Foo',
    ),
  ).not.toThrow();
}

function test_assertIsRelayerV2ResultInputProof_rejected() {
  expect(() =>
    assertIsRelayerV2ResultInputProof({ accepted: false }, 'Foo'),
  ).toThrow('Invalid Foo.extra_data');
  expect(() =>
    assertIsRelayerV2ResultInputProofRejected(
      { accepted: true, extra_data: '0xdead' },
      'Foo',
    ),
  ).toThrow('Invalid Foo.accepted');
  expect(() =>
    assertIsRelayerV2ResultInputProof(
      { accepted: false, extra_data: 'dead' },
      'Foo',
    ),
  ).toThrow('Invalid bytes hex Foo.extra_data');
  expect(() =>
    assertIsRelayerV2ResultInputProof(
      { accepted: false, extra_data: '0xdead' },
      'Foo',
    ),
  ).not.toThrow();
}

describe('RelayerV2ResultInputProof', () => {
  it('assertIsRelayerV2ResultInputProof accepted', () => {
    test_assertIsRelayerV2ResultInputProof_accepted();
  });
  it('assertIsRelayerV2ResultInputProof rejected', () => {
    test_assertIsRelayerV2ResultInputProof_rejected();
  });
});
