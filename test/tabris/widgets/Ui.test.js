import {expect, restore} from '../../test';
import ProxyStore from '../../../src/tabris/ProxyStore';
import NativeBridge from '../../../src/tabris/NativeBridge';
import ClientStub from '../ClientStub';
import Ui, {create} from '../../../src/tabris/widgets/Ui';
import ContentView from '../../../src/tabris/widgets/ContentView';
import Composite from '../../../src/tabris/widgets/Composite';

describe('Ui', function() {

  let client, ui;

  beforeEach(function() {
    client = new ClientStub();
    global.tabris = {
      on: () => {},
      _notify: (cid, event, param) => tabris._proxies.find(cid)._trigger(event, param),
      _proxies: new ProxyStore()
    };
    global.tabris._nativeBridge = new NativeBridge(client);
    ui = create();
  });

  afterEach(restore);

  it('can not be created standalone', function() {
    expect(() => {
      new Ui({});
    }).to.throw(Error);
  });

  it('is instanceof Composite', function() {
    expect(ui).to.be.an.instanceOf(Composite);
  });

  it('is instanceof Ui', function() {
    expect(ui).to.be.an.instanceOf(Ui);
  });

  it('is CREATEed', function() {
    let createCalls = client.calls({op: 'create'});
    expect(createCalls[0].id).to.equal(ui.cid);
    expect(createCalls[0].type).to.equal('tabris.Ui');
  });

  it('contains children', function() {
    expect(ui.children().length).to.equal(4);
    expect(ui.children().indexOf(ui.contentView)).not.to.equal(-1);
    expect(ui.children().indexOf(ui.statusBar)).not.to.equal(-1);
    expect(ui.children().indexOf(ui.navigationBar)).not.to.equal(-1);
    expect(ui.children().indexOf(ui.drawer)).not.to.equal(-1);
  });

  it('does not accept any children', function() {
    expect(() => {
      ui.append(new Composite());
    }).to.throw(Error);
  });

  it('can not be appended', function() {
    expect(() => {
      new Composite().append(ui);
    }).to.throw(Error);
  });

  it('can not be disposed', function() {
    expect(() => {
      ui.dispose();
    }).to.throw(Error);
  });

  it('has no parent', function() {
    expect(ui.parent()).to.be.null;
  });

  it('overrides initial value for win_theme', function() {
    expect(ui.win_theme).to.equal('light');
  });

  describe('contentView', function() {

    it('is instance of ContentView', function() {
      expect(ui.contentView).to.be.an.instanceOf(ContentView);
    });

    it('is read-only ', function() {
      let contentView = ui.contentView;

      delete ui.contentView;
      ui.contentView = undefined;

      expect(ui.contentView).to.equal(contentView);
    });

  });

});
