import {expect, mockTabris, restore, spy, stub} from '../../test';
import ClientMock from '../ClientMock';
import StatusBar, {create} from '../../../src/tabris/widgets/StatusBar';
import Composite from '../../../src/tabris/widgets/Composite';

describe('StatusBar', function() {

  let statusBar, client;

  const checkListen = function(event) {
    const listen = client.calls({op: 'listen', id: statusBar.cid});
    expect(listen.length).to.equal(1);
    expect(listen[0].event).to.equal(event);
    expect(listen[0].listen).to.equal(true);
  };

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
    statusBar = create();
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

  it('create CREATEs StatusBar', function() {
    expect(client.calls({op: 'create', type: 'tabris.StatusBar'}).length).to.equal(1);
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

  it('supports property "theme" light', () => {
    statusBar.theme = 'light';

    expect(statusBar.theme).to.eq('light');
  });

  it('supports property "theme" dark', () => {
    statusBar.theme = 'dark';

    expect(statusBar.theme).to.eq('dark');
  });

  it('supports property "displayMode"', () => {
    statusBar.displayMode = 'hide';

    expect(statusBar.displayMode).to.eq('hide');
  });

  it('supports property "height"', () => {
    statusBar.height;

    expect(client.calls({op: 'get', id: statusBar.cid, property: 'height'}).length).to.equal(1);
  });

  it('does not set read-only property "height"', () => {
    stub(console, 'warn');
    client.resetCalls();

    statusBar.height = 64;

    expect(client.calls({op: 'set', id: statusBar.cid}).length).to.equal(0);
    expect(console.warn).to.have.been.calledWithMatch('Can not set read-only property "height"');
  });

  it('fires tap event', function() {
    const listener = spy();
    statusBar.onTap(listener);

    tabris._notify(statusBar.cid, 'tap', {x: 30, y: 10});

    checkListen('tap');
    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: statusBar});
  });

});
