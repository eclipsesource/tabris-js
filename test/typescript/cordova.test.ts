// Example declarations by cordova

interface CordovaPlugins {}

interface Cordova {
  plugins: CordovaPlugins;
}

interface Window {
  cordova: Cordova;
}

// Example declarations by cordova plugins

interface ExamplePlugin {
  foo: () => 'bar';
}

interface CordovaPlugins {
  myPlugin1: ExamplePlugin;
}

interface Window {
  plugins: CordovaPlugins;
}

interface Navigator {
  myPlugin2: ExamplePlugin;
}

interface Document {
  addEventListener(type: 'foo', cb: (bar: 'bar') => 'bar'): void;
  removeEventListener(type: 'foo', cb: (bar: 'bar') => 'bar'): void;
}

declare var cordova: Cordova;

// Example usage

let test: 'bar' = navigator.myPlugin2.foo();
test = plugins.myPlugin1.foo();
test = cordova.plugins.myPlugin1.foo();
document.addEventListener('foo', value => test = value);
document.removeEventListener('foo', value => test = value);

test = window.navigator.myPlugin2.foo();
test = window.plugins.myPlugin1.foo();
test = window.cordova.plugins.myPlugin1.foo();
window.document.addEventListener('foo', value => test = value);
window.document.removeEventListener('foo', value => test = value);
