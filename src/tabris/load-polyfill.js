if (typeof window === 'undefined') {
  global.window = global;
}
delete global.Promise;
require('./polyfill.min.js');
