import {expect, mockTabris, restore} from '../../test';
import ClientStub from '../ClientStub';
import {create as createUi} from '../../../src/tabris/widgets/Ui';
import StatusBar from '../../../src/tabris/widgets/StatusBar';
import Composite from '../../../src/tabris/widgets/Composite';

describe('StatusBar', function() {

  let ui, statusBar, client;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
    ui = createUi();
    statusBar = ui.statusBar;
  });

  afterEach(restore);

  it('can not be created standalone', function() {
    expect(() => {
      new StatusBar({});
    }).to.throw(Error);
  });

  it('is a StatusBar', function() {
    expect(statusBar).to.be.an.instanceOf(StatusBar);
  });

  it('SETs parent', function() {
    let createCall = client.calls({op: 'create', id: statusBar.cid})[0];
    expect(createCall.properties).to.contain.all.keys({parent: ui.cid});
  });

  it('is child of ui', function() {
    expect(statusBar.parent()).to.equal(ui);
  });

  it('can not be disposed', function() {
    expect(() => {
      statusBar.dispose();
    }).to.throw(Error);
  });

  it('can not be reparented', function() {
    expect(() => {
      new Composite().append(statusBar);
    }).to.throw(Error);
  });

  it('supports property "theme"', () => {
    statusBar.theme = 'light';

    expect(statusBar.theme).to.eq('light');
  });

  it('supports property "theme"', () => {
    statusBar.theme = 'light';

    expect(statusBar.theme).to.eq('light');
  });

  it('supports property "displayMode"', () => {
    statusBar.displayMode = 'hide';

    expect(statusBar.displayMode).to.eq('hide');
  });

  it('supports property "height"', () => {
    statusBar.height;

    expect(client.calls({op: 'get', id: statusBar.cid, property: 'height'}).length).to.equal(1);
  });

  it('throws exception when setting read only property "height"', () => {
    expect(() => {
      statusBar.height = 64;
    }).to.throw('StatusBar "height" is read only');
  });

});
