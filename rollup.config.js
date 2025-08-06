// rollup.config.js
export default {
  input: 'src/index.js',
  output: {
    file: 'dist/betaCalendar.js',
    format: 'umd',
    name: 'betaCalendar',
  }
};