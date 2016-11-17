import {expect, restore} from '../../test';
import ProxyStore from '../../../src/tabris/ProxyStore';
import NativeBridge from '../../../src/tabris/NativeBridge';
import ClientStub from '../ClientStub';
import {create as createUI} from '../../../src/tabris/widgets/UI';
import NavigationBar from '../../../src/tabris/widgets/NavigationBar';
import Composite from '../../../src/tabris/widgets/Composite';

describe('NavigationBar', function() {

  let ui, navigationBar, client;

  beforeEach(function() {
    client = new ClientStub();
    global.tabris = {
      on: () => {
      },
      _notify: (cid, event, param) => tabris._proxies.find(cid)._trigger(event, param),
      _proxies: new ProxyStore()
    };
    global.tabris._nativeBridge = new NativeBridge(client);
    ui = createUI();
    navigationBar = ui.navigationBar;
  });

  afterEach(restore);

  it('can not be created standalone', function() {
    expect(() => {
      new NavigationBar({});
    }).to.throw(Error);
  });

  it('is a NavigationBar', function() {
    expect(navigationBar).to.be.an.instanceOf(NavigationBar);
  });

  it('SETs parent', function() {
    let createCall = client.calls({op: 'create', id: navigationBar.cid})[0];
    expect(createCall.properties).to.contain.all.keys({parent: ui.cid});
  });

  it('is child of ui', function() {
    expect(navigationBar.parent()).to.equal(ui);
  });

  it('can not be disposed', function() {
    expect(() => {
      navigationBar.dispose();
    }).to.throw(Error);
  });

  it('can not be reparented', function() {
    expect(() => {
      new Composite().append(navigationBar);
    }).to.throw(Error);
  });

  it('supports property "displayMode"', () => {
    navigationBar.displayMode = 'hide';

    expect(navigationBar.displayMode).to.eq('hide');
  });

  it('supports property "height"', () => {
    navigationBar.height;

    expect(client.calls({op: 'get', id: navigationBar.cid, property: 'height'}).length).to.equal(1);
  });

  it('throws exception when setting read only property "height"', () => {
    expect(() => {
      navigationBar.height = 64;
    }).to.throw('NavigationBar "height" is read only');
  });

});
