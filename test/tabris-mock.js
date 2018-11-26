import NativeObjectRegistry from '../src/tabris/NativeObjectRegistry';
import NativeBridge from '../src/tabris/NativeBridge';
import Events from '../src/tabris/Events';
import {ConstraintLayout, LayoutQueue} from '../src/tabris/Layout';
import ColumnLayout from '../src/tabris/ColumnLayout';

export function mockTabris(client) {
  if (!client) {
    throw new Error('Cannot mock without a client');
  }
  delete ConstraintLayout._default;
  delete LayoutQueue._instance;
  delete ColumnLayout._column;
  global.tabris = Object.assign({
    Module: {getSourceMap() { return null; }},
    flush() {
      this.trigger('flush');
      this._nativeBridge.flush();
    },
    _client: client,
    _stackTraceStack: [],
    _nativeObjectRegistry: new NativeObjectRegistry(),
    _notify: (cid, event, param) => tabris._nativeObjectRegistry.find(cid)._trigger(event, param),
    started: true,
    device: {platform: 'test'}
  }, Events);
  global.tabris._nativeBridge = new NativeBridge(client);
}
