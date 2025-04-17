import OMT from '@surma/rollup-plugin-off-main-thread';

import copy from 'rollup-plugin-copy';
import json from '@rollup/plugin-json';
import url from '@rollup/plugin-url';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import path from 'path';
import fs from 'fs';

const wasmBindgenRayon = fs.readdirSync(
  path.resolve('node_modules/tfhe/snippets'),
)[0];

const nodePlugins = [
  json(),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.rollup.json',
  }),
];

const webPlugins = [
  json(),
  url(),
  nodePolyfills(),
  replace({
    preventAssignment: true,
    'node-tfhe': 'tfhe',
    'node-tkms': 'tkms',
  }),
  typescript({
    tsconfig: './tsconfig.rollup.json',
    exclude: 'node_modules/**',
  }),
  commonjs(),
  resolve({
    browser: true,
    resolveOnly: ['tfhe', 'tkms'],
    extensions: ['.js', '.ts', '.wasm'],
  }),
];

export default [
  {
    input: 'src/web.ts',
    output: {
      file: 'lib/web.js',
      name: 'fhevm',
      format: 'es',
    },
    plugins: [
      ...webPlugins,
      copy({
        targets: [
          { src: 'node_modules/tfhe/tfhe_bg.wasm', dest: 'lib/' },
          { src: 'node_modules/tkms/kms_lib_bg.wasm', dest: 'lib/' },
        ],
      }),
    ],
  },
  {
    input: `./node_modules/tfhe/snippets/${wasmBindgenRayon}/src/workerHelpers.js`,
    output: {
      file: 'lib/workerHelpers.js',
      inlineDynamicImports: true,
      name: 'worker',
      format: 'esm',
    },
    plugins: [OMT()],
  },
  {
    input: 'src/node.ts',
    output: {
      file: 'lib/node.cjs',
      name: 'fhevm',
      format: 'cjs',
    },
    plugins: [...nodePlugins],
  },
];
