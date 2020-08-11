import typescript from 'rollup-plugin-typescript2';

export default {
  input: './src/boot/main.js',
  output: {
    file: 'build/boot-transpiled.js',
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
