import typescript from 'rollup-plugin-typescript2';

export default {
  input: './src/boot/main.ts',
  output: {
    file: 'build/boot-bundled.js',
    format: 'cjs'
  },
  plugins: [
    typescript({
      tsconfig: './src/boot/tsconfig.json',
      typescript: require('./node_modules/typescript'),
      include: ['*.ts+(|x)', '**/*.ts+(|x)', '*.js+(|x)', '**/*.js+(|x)'],
      exclude: []
    })
  ]
};
