import 'tabris';

let storage: Storage = localStorage;
storage = secureStorage;

storage.setItem('foo', 'bar');
storage.getItem('foo');
storage.removeItem('foo');
storage.clear();
const l: number = storage.length;
const key: string = storage.key(0);
