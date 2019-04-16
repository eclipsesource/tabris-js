import { tabris, NativeObject } from 'tabris';

const nativeObject: NativeObject = tabris;
const bool: boolean = tabris.started;
const str: string = tabris.version;

tabris._defineModule('my-module', () => {});
tabris._init({}, {headless: false});
tabris._init({});
tabris._notify('$0', 'event', {});
tabris.flush();
tabris.onFlush(() => {});
tabris.onLayout(() => {});
tabris.onStart(() => {});
tabris.onLog(({message, level}) => {
  const fn: Function = console[level];
  const str2: string = message;
});
