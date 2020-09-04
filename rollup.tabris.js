import {resolve} from 'path';
import inject from 'rollup-plugin-inject';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: './src/tabris/main.js',
  output: {
    file: 'build/tabris-bundle.js',
    format: 'cjs',
    intro: 'if (typeof global === \'undefined\') { window.global = window; }' // May be running in browser
  },
  plugins: [
    typescript({
      tsconfig: './src/tabris/tsconfig.json',
      typescript: require('./node_modules/typescript'),
      include: ['*.ts+(|x)', '**/*.ts+(|x)', '*.js+(|x)', '**/*.js+(|x)'],
      exclude: []
    }),
    inject({
      Promise: resolve('./src/tabris/Promise.js')
    })
  ]
};
