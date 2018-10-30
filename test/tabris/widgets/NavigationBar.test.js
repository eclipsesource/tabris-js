import {expect, mockTabris, restore, stub} from '../../test';
import ClientStub from '../ClientStub';
import NavigationBar, {create} from '../../../src/tabris/widgets/NavigationBar';
import Composite from '../../../src/tabris/widgets/Composite';

describe('NavigationBar', function() {

  let navigationBar, client;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
    navigationBar = create();
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

  it('supports property "theme" light', () => {
    navigationBar.theme = 'light';

    expect(navigationBar.theme).to.eq('light');
  });

  it('supports property "theme" dark', () => {
    navigationBar.theme = 'dark';

    expect(navigationBar.theme).to.eq('dark');
  });

  it('supports property "displayMode"', () => {
    navigationBar.displayMode = 'hide';

    expect(navigationBar.displayMode).to.eq('hide');
  });

  it('supports property "height"', () => {
    navigationBar.height;

    expect(client.calls({op: 'get', id: navigationBar.cid, property: 'height'}).length).to.equal(1);
  });

  it('does not set read-only property "height"', () => {
    stub(console, 'warn');

    navigationBar.height = 64;

    expect(client.calls({op: 'set', id: navigationBar.cid}).length).to.equal(0);
    expect(console.warn).to.have.been.calledWith('Can not set read-only property "height"');
  });
});
