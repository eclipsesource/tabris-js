import {resolve} from 'path';
import inject from 'rollup-plugin-inject';

export default {
  plugins: [
    inject({
      Promise: resolve('./src/tabris/Promise.js')
    })
  ]
};
