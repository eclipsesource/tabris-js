// global declarations as needed in internal code
declare var tabris: typeof import('./main');
declare var console: import('./Console').default;
declare namespace global {
  export var console: import('./Console').default;
  export var localStorage: import('./Storage').default;
  export var secureStorage: import('./Storage').default;
  export var crypto: import('./Crypto').default;
  export var tabris: typeof import('./main');
}
