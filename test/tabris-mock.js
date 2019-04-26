import NativeObjectRegistry from '../src/tabris/NativeObjectRegistry';
import NativeBridge from '../src/tabris/NativeBridge';
import Events from '../src/tabris/Events';
import {ConstraintLayout, LayoutQueue} from '../src/tabris/Layout';
import StackLayout from '../src/tabris/StackLayout';
import Tabris from '../src/tabris/Tabris';

export function mockTabris(client) {
  if (!client) {
    throw new Error('Cannot mock without a client');
  }
  delete ConstraintLayout._default;
  delete LayoutQueue._instance;
  delete StackLayout._default;
  global.tabris = Object.assign({
    Module: {getSourceMap() { return null; }},
    flush: Tabris.prototype.flush,
    _notify: Tabris.prototype._notify,
    _client: client,
    _stackTraceStack: [],
    _nativeObjectRegistry: new NativeObjectRegistry(),
    started: true,
    device: {platform: 'test'}
  }, Events);
  global.tabris._nativeBridge = new NativeBridge(client);
}
