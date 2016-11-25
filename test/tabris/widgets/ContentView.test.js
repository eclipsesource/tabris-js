import {expect, restore} from '../../test';
import ProxyStore from '../../../src/tabris/ProxyStore';
import NativeBridge from '../../../src/tabris/NativeBridge';
import ClientStub from '../ClientStub';
import {create as createUi} from '../../../src/tabris/widgets/Ui';
import ContentView from '../../../src/tabris/widgets/ContentView';
import Composite from '../../../src/tabris/widgets/Composite';

describe('ContentView', function() {

  let ui, contentView, client;

  beforeEach(function() {
    client = new ClientStub();
    global.tabris = {
      on: () => {},
      _notify: (cid, event, param) => tabris._proxies.find(cid)._trigger(event, param),
      _proxies: new ProxyStore()
    };
    global.tabris._nativeBridge = new NativeBridge(client);
    ui = createUi();
    contentView = ui.contentView;
  });

  afterEach(restore);

  it('can not be created standalone', function() {
    expect(() => {
      new ContentView({});
    }).to.throw(Error);
  });

  it('is a ContentView', function() {
    expect(contentView).to.be.an.instanceOf(ContentView);
  });

  it('CREATEs Composite', function() {
    let createCall = client.calls({op: 'create', id: contentView.cid})[0];
    expect(createCall.type).to.equal('tabris.Composite');
    expect(createCall.properties).to.contain.all.keys({root: true});
  });

  it('SETs parent', function() {
    let createCall = client.calls({op: 'create', id: contentView.cid})[0];
    expect(createCall.properties).to.contain.all.keys({parent: ui.cid});
  });

  it('is child of ui', function() {
    expect(contentView.parent()).to.equal(ui);
  });

  it('can not be disposed', function() {
    expect(() => {
      contentView.dispose();
    }).to.throw(Error);
  });

  it('can not be reparented', function() {
    expect(() => {
      new Composite().append(contentView);
    }).to.throw(Error);
  });

});
