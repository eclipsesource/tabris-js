import {expect, spy, stub, restore, match, mockTabris} from '../../test';
import ClientStub from '../ClientStub';
import Page from '../../../src/tabris/widgets/Page';
import Action from '../../../src/tabris/widgets/Action';
import SearchAction from '../../../src/tabris/widgets/SearchAction';
import Composite from '../../../src/tabris/widgets/Composite';
import NavigationView from '../../../src/tabris/widgets/NavigationView';
import WidgetCollection from '../../../src/tabris/WidgetCollection';
import EventObject from '../../../src/tabris/EventObject';
import Layout from '../../../src/tabris/Layout';
import Color from '../../../src/tabris/Color';

describe('NavigationView', function() {

  let client, navigationView;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
    navigationView = new NavigationView();
    client.resetCalls();
  });

  afterEach(restore);

  it('has an empty children list', function() {
    expect(navigationView.children().toArray()).to.eql([]);
  });

  it('can not append a Composite', function() {
    expect(() => {
      navigationView.append(new Composite());
    }).to.throw();
  });

  it('layout is null', function() {
    expect(navigationView.layout).to.equal(null);
  });

  it('layout can not be set', function() {
    expect(() => navigationView.layout = Layout.default()).to.throw();
  });

  it('can append a Page', function() {
    let page = new Page();

    navigationView.append(page);

    expect(navigationView.children()[0]).to.equal(page);
  });

  it('can append an Action', function() {
    let action = new Action();

    navigationView.append(action);

    expect(navigationView.children()[0]).to.equal(action);
  });

  it('can append a SearchAction', function() {
    let action = new SearchAction();

    navigationView.append(action);

    expect(navigationView.children()[0]).to.equal(action);
  });

  it('can set navigationAction', function() {
    let action = new Action();

    navigationView.navigationAction = action;

    expect(navigationView.navigationAction).to.equal(action);
  });

  describe('toolbarVisible', function() {

    it('is true by default', function() {
      expect(navigationView.toolbarVisible).to.be.true;
    });

    it('is rendered', function() {
      navigationView.toolbarVisible = false;

      expect(client.calls({id: navigationView.cid})[0].properties).to.deep.equal({toolbarVisible: false});
    });

  });

  describe('toolbarHeight', function() {

    it('supports get', function() {
      stub(client, 'get').returns(23);

      let height = navigationView.toolbarHeight;

      expect(height).to.equal(23);
      expect(client.get).to.have.been.calledWith(navigationView.cid, 'toolbarHeight');
    });

    it('ignores set', function() {
      stub(console, 'warn');
      stub(client, 'get').returns(23);
      spy(client, 'set');
      navigationView.toolbarHeight = 12;

      let height = navigationView.toolbarHeight;

      expect(height).to.equal(23);
      expect(client.set).not.to.have.been.calledWith(navigationView.cid, 'toolbarHeight');
    });

    it('support change event', function() {
      let listener = spy();
      navigationView.onToolbarHeightChanged(listener);

      tabris._notify(navigationView.cid, 'toolbarHeightChanged', {toolbarHeight: 23});

      expect(client.calls({op: 'listen', id: navigationView.cid, event: 'toolbarHeightChanged'})[0].listen)
        .to.be.true;
      expect(listener).to.have.been.calledOnce;
      expect(listener.firstCall.args[0].target).to.equal(navigationView);
      expect(listener.firstCall.args[0].value).to.equal(23);
    });

  });

  describe('toolbarColor', function() {

    it('supports colors', function() {
      navigationView.toolbarColor = 'red';

      expect(Color.from(navigationView.toolbarColor).toArray()).to.deep.equal([255, 0, 0, 255]);
    });

  });

  describe('titleTextColor', function() {

    it('supports colors', function() {
      navigationView.titleTextColor = '#00ff00';

      expect(Color.from(navigationView.titleTextColor).toArray()).to.deep.equal([0, 255, 0, 255]);
    });

  });

  describe('actionColor', function() {

    it('supports colors', function() {
      navigationView.actionColor = 'red';

      expect(Color.from(navigationView.actionColor).toArray()).to.deep.equal([255, 0, 0, 255]);
    });

  });

  describe('actionTextColor', function() {

    it('supports colors', function() {
      navigationView.actionTextColor = 'blue';

      expect(Color.from(navigationView.actionTextColor).toArray()).to.deep.equal([0, 0, 255, 255]);
    });

  });

  describe('pageAnimation', function() {

    it('is "default" by default', function() {
      expect(navigationView.pageAnimation).to.be.equal('default');
    });

    it('is rendered', function() {
      navigationView.pageAnimation = 'none';

      expect(client.calls({id: navigationView.cid})[0].properties).to.deep.equal({pageAnimation: 'none'});
    });

  });

  describe('pages', function() {

    it('returns empty WidgetCollection by default', function() {
      expect(navigationView.pages()).to.be.instanceof(WidgetCollection);
      expect(navigationView.pages().length).to.equal(0);
      expect([]).to.be.empty;
    });

    describe('when pages are added', function() {

      let pages, page1;

      beforeEach(function() {
        pages = [page1 = new Page({id: 'page1'}), new Page(), new Page()];
        navigationView.append(pages);
      });

      it('contains added pages', function() {
        expect(navigationView.pages().toArray()).to.deep.equal(pages);
      });

      it('accepts a selector argument', function() {
        let pages = navigationView.pages('#page1').toArray();
        expect(pages).to.deep.equal([page1]);
      });

      it('does not contain other children', function() {
        navigationView.append(new Action(), new SearchAction());
        expect(navigationView.pages().toArray()).to.deep.equal(pages);
      });

    });

  });

  describe('appear event', function() {

    let page1, page2, listener;

    beforeEach(function() {
      page1 = new Page();
      page2 = new Page();
      listener = spy();
    });

    it('is triggered when a page is appended', function() {
      page1.onAppear(listener);

      navigationView.append(page1);

      expect(listener).to.have.been.calledOnce;
      expect(listener.firstCall.args[0].target).to.equal(page1);
    });

    it('is an EventObject', function() {
      page1.onAppear(listener);

      navigationView.append(page1);

      expect(listener).to.have.been.calledWith(match.instanceOf(EventObject));
    });

    it('is triggered when a covering page is removed', function() {
      navigationView.append(page1, page2);
      page1.onAppear(listener);
      page2.onAppear(listener);

      page2.detach();

      expect(listener).to.have.been.calledOnce;
      expect(listener.firstCall.args[0].target).to.equal(page1);
    });

    it('is not triggered when hidden page is removed', function() {
      navigationView.append(page1, page2);
      page1.onAppear(listener);
      page2.onAppear(listener);

      page1.detach();

      expect(listener).to.not.have.been.called;
    });

  });

  describe('disappear event', function() {

    let page1, page2, listener;

    beforeEach(function() {
      page1 = new Page();
      page2 = new Page();
      listener = spy();
    });

    it('is triggered when page is detached', function() {
      navigationView.append(page1);
      page1.onDisappear(listener);

      page1.detach();

      expect(listener).to.have.been.calledOnce;
      expect(listener.firstCall.args[0].target).to.equal(page1);
    });

    it('is an EventObject', function() {
      navigationView.append(page1);
      page1.onDisappear(listener);

      page1.detach();

      expect(listener).to.have.been.calledWith(match.instanceOf(EventObject));
    });

    it('is triggered when page is disposed', function() {
      navigationView.append(page1);
      page1.onDisappear(listener);

      page1.dispose();

      expect(listener).to.have.been.calledOnce;
      expect(listener.firstCall.args[0].target).to.equal(page1);
    });

    it('is triggered when a page is covered by another page', function() {
      navigationView.append(page1);
      page1.onDisappear(listener);
      page2.onDisappear(listener);

      navigationView.append(page2);

      expect(listener).to.have.been.calledOnce;
      expect(listener.firstCall.args[0].target).to.equal(page1);
    });

    it('is not triggered when a page in the middle is removed', function() {
      navigationView.append(page1, page2);
      page1.onDisappear(listener);
      page2.onDisappear(listener);

      page1.detach();

      expect(listener).to.not.have.been.called;
    });

  });

  describe('detach', function() {

    let page1, page2, page3;

    beforeEach(function() {
      page1 = new Page();
      page2 = new Page();
      page3 = new Page();
    });

    it('detaches a page in the middle', function() {
      navigationView.append(page1, page2, page3);
      page2.detach();
      expect(navigationView.pages().toArray()).to.deep.equal([page1, page3]);
    });

  });

  describe('toXML', function() {

    it('prints xml element with drawerActionVisible and toolbarVisible if false', function() {
      stub(client, 'get').returns([0, 1, 2, 3]);
      expect(navigationView.set({drawerActionVisible: true, toolbarVisible: true}).toXML()).to.equal(
        `<NavigationView cid='${navigationView.cid}' bounds='{left: 0, top: 1, width: 2, height: 3}'/>`
      );
      expect(navigationView.set({drawerActionVisible: false, toolbarVisible: false}).toXML()).to.match(
        /<NavigationView .* drawerActionVisible='false' toolbarVisible='false'\/>/
      );
    });

  });

});
