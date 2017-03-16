import ProxyStore from '../src/tabris/ProxyStore';
import NativeBridge from '../src/tabris/NativeBridge';
import Events from '../src/tabris/Events';

export function mockTabris(client) {
  if (!client) {
    throw new Error('Cannot mock without a client');
  }
  global.tabris = Object.assign({
    _client: client,
    _proxies: new ProxyStore(),
    _notify: (cid, event, param) => tabris._proxies.find(cid)._trigger(event, param),
    started: true,
    device: {platform: 'test'}
  }, Events);
  global.tabris._nativeBridge = new NativeBridge(client);
}
