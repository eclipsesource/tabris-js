import {expect, spy, stub, restore, mockTabris} from '../../test';
import ClientStub from '../ClientStub';
import Page from '../../../src/tabris/widgets/Page';
import Action from '../../../src/tabris/widgets/Action';
import SearchAction from '../../../src/tabris/widgets/SearchAction';
import Composite from '../../../src/tabris/widgets/Composite';
import NavigationView from '../../../src/tabris/widgets/NavigationView';
import WidgetCollection from '../../../src/tabris/WidgetCollection';

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

  describe('toolbarVisible', function() {

    it('is true by default', function() {
      expect(navigationView.toolbarVisible).to.be.true;
    });

    it('is rendered', function() {
      navigationView.toolbarVisible = false;

      expect(client.calls({id: navigationView.cid})[0].properties).to.deep.equal({toolbarVisible: false});
    });

  });

  describe('topToolbarHeight', function() {

    it('supports get', function() {
      stub(client, 'get').returns(23);

      let height = navigationView.topToolbarHeight;

      expect(height).to.equal(23);
      expect(client.get).to.have.been.calledWith(navigationView.cid, 'topToolbarHeight');
    });

    it('ignores set', function() {
      stub(console, 'warn');
      stub(client, 'get').returns(23);
      spy(client, 'set');
      navigationView.topToolbarHeight = 12;

      let height = navigationView.topToolbarHeight;

      expect(height).to.equal(23);
      expect(client.set).not.to.have.been.calledWith(navigationView.cid, 'topToolbarHeight');
    });

    it('support change event', function() {
      let listener = spy();
      navigationView.on('topToolbarHeightChanged', listener);

      tabris._notify(navigationView.cid, 'change_topToolbarHeight', {value: 23});

      expect(client.calls({op: 'listen', id: navigationView.cid, event: 'change_topToolbarHeight'})[0].listen)
        .to.be.true;
      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: navigationView, value: 23});
    });

  });

  describe('bottomToolbarHeight', function() {

    it('supports get', function() {
      stub(client, 'get').returns(23);

      let height = navigationView.bottomToolbarHeight;

      expect(height).to.equal(23);
      expect(client.get).to.have.been.calledWith(navigationView.cid, 'bottomToolbarHeight');
    });

    it('ignores set', function() {
      stub(console, 'warn');
      stub(client, 'get').returns(23);
      spy(client, 'set');
      navigationView.bottomToolbarHeight = 12;

      let height = navigationView.bottomToolbarHeight;

      expect(height).to.equal(23);
      expect(client.set).not.to.have.been.calledWith(navigationView.cid, 'bottomToolbarHeight');
    });

    it('support change event', function() {
      let listener = spy();
      navigationView.on('bottomToolbarHeightChanged', listener);

      tabris._notify(navigationView.cid, 'change_bottomToolbarHeight', {value: 23});

      expect(client.calls({op: 'listen', id: navigationView.cid, event: 'change_bottomToolbarHeight'})[0].listen)
        .to.be.true;
      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: navigationView, value: 23});
    });

  });

  describe('toolbarColor', function() {

    it('supports colors', function() {
      navigationView.toolbarColor = 'red';

      expect(navigationView.toolbarColor).to.equal('rgba(255, 0, 0, 1)');
    });

  });

  describe('titleTextColor', function() {

    it('supports colors', function() {
      navigationView.titleTextColor = '#00ff00';

      expect(navigationView.titleTextColor).to.equal('rgba(0, 255, 0, 1)');
    });

  });

  describe('actionColor', function() {

    it('supports colors', function() {
      navigationView.actionColor = 'red';

      expect(navigationView.actionColor).to.equal('rgba(255, 0, 0, 1)');
    });

  });

  describe('actionTextColor', function() {

    it('supports colors', function() {
      navigationView.actionTextColor = 'blue';

      expect(navigationView.actionTextColor).to.equal('rgba(0, 0, 255, 1)');
    });

  });

  describe('animated', function() {

    it('is true by default', function() {
      expect(navigationView.animated).to.be.true;
    });

    it('is rendered', function() {
      navigationView.animated = false;

      expect(client.calls({id: navigationView.cid})[0].properties).to.deep.equal({animated: false});
    });

  });

  ['win_theme', 'win_toolbarTheme'].forEach(prop => describe(prop, function() {

    ['light', 'dark', 'default'].forEach(value => {

      it(`set ${prop} to ${value} value`, function() {
        navigationView[prop] = value;

        let call = client.calls({op: 'set'})[0];
        expect(call.properties[prop]).to.equal(value);
      });

    });

    it(`ignores setting ${prop} to invalid value`, function() {
      stub(console, 'warn');

      navigationView.set(prop, 'foo');

      expect(client.calls({op: 'set'}).length).to.equal(0);
    });


    it(`return ${prop} default value`, function() {
      expect(navigationView.get(prop)).to.equal('default');
    });

  }));

  describe('pages', function() {

    it('returns empty WidgetCollection by default', function() {
      expect(navigationView.pages()).to.be.instanceof(WidgetCollection);
      expect(navigationView.pages().length).to.equal(0);
      expect([]).to.be.empty;
    });

    describe('when pages are added', function() {

      let pages;

      beforeEach(function() {
        pages = [new Page(), new Page(), new Page()];
        navigationView.append(pages);
      });

      it('contains added pages', function() {
        expect(navigationView.pages().toArray()).to.deep.equal(pages);
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
      page1.on('appear', listener);

      navigationView.append(page1);

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: page1});
    });

    it('is triggered when a covering page is removed', function() {
      navigationView.append(page1, page2);
      page1.on('appear', listener);
      page2.on('appear', listener);

      page2.detach();

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: page1});
    });

    it('is not triggered when hidden page is removed', function() {
      navigationView.append(page1, page2);
      page1.on('appear', listener);
      page2.on('appear', listener);

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
      page1.on('disappear', listener);

      page1.detach();

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: page1});
    });

    it('is triggered when page is disposed', function() {
      navigationView.append(page1);
      page1.on('disappear', listener);

      page1.dispose();

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: page1});
    });

    it('is triggered when a page is covered by another page', function() {
      navigationView.append(page1);
      page1.on('disappear', listener);
      page2.on('disappear', listener);

      navigationView.append(page2);

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: page1});
    });

    it('is not triggered when a page in the middle is removed', function() {
      navigationView.append(page1, page2);
      page1.on('disappear', listener);
      page2.on('disappear', listener);

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

});
