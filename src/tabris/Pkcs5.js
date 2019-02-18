import NativeObject from './NativeObject';

class Pbkdf2 extends NativeObject {

  constructor(properties) {
    super(properties);
    this._nativeListen('done', true);
  }

  start(parameters) {
    this._nativeCall('start', parameters);
  }

  get _nativeType() {
    return 'tabris.pkcs5.Pbkdf2';
  }

}

export default class Pkcs5 {

  pbkdf2(password, salt, iterationCount, keySize) {
    return new Promise((resolve) => {
      if (arguments.length < 4) {
        throw new Error('Not enough arguments to pbkdf2');
      }
      if (typeof password !== 'string') {
        throw new Error('Invalid type for password in pbkdf2');
      }
      if (!(salt instanceof Uint8Array)) {
        throw new Error('Invalid type for salt in pbkdf2');
      }
      if (typeof iterationCount !== 'number' || iterationCount <= 0) {
        throw new Error('Invalid number for iterationCount in pbkdf2');
      }
      if (typeof keySize !== 'number' || keySize <= 0) {
        throw new Error('Invalid number for keySize in pbkdf2');
      }
      const pbkdf2 = new Pbkdf2();
      pbkdf2.on('done', (event) => {
        pbkdf2.dispose();
        resolve(event.key);
      });
      // TODO: transfer salt as typed array once iOS 9 support is discontinued
      pbkdf2.start({password, salt: toArray(salt), iterationCount, keySize});
    });
  }

}

function toArray(typedArray) {
  const array = new Array(typedArray.length);
  for (let i = 0; i < typedArray.length; i++) {
    array[i] = typedArray[i];
  }
  return array;
}
