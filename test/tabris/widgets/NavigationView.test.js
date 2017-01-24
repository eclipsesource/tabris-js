import {expect, restore, spy} from '../../test';
import ClientStub from '../ClientStub';
import Page from '../../../src/tabris/widgets/Page';
import Action from '../../../src/tabris/widgets/Action';
import SearchAction from '../../../src/tabris/widgets/SearchAction';
import Composite from '../../../src/tabris/widgets/Composite';
import NavigationView from '../../../src/tabris/widgets/NavigationView';
import NativeBridge from '../../../src/tabris/NativeBridge';
import ProxyStore from '../../../src/tabris/ProxyStore';
import WidgetCollection from '../../../src/tabris/WidgetCollection';

describe('NavigationView', function() {

  let client, navigationView;

  beforeEach(function() {
    client = new ClientStub();
    global.tabris = {
      on: () => {
      },
      _proxies: new ProxyStore(),
      _notify: (cid, event, param) => tabris._proxies.find(cid)._trigger(event, param)
    };
    global.tabris._nativeBridge = new NativeBridge(client);
    navigationView = new NavigationView();
    client.resetCalls();
  });

  afterEach(restore);

  it('children list is empty', function() {
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
    });

    it('is triggered when a covering page is removed', function() {
      navigationView.append(page1, page2);
      page1.on('appear', listener);
      page2.detach();
      expect(listener).to.have.been.calledOnce;
    });

  });

  describe('disappear event', function() {

    let page1, page2, listener;

    beforeEach(function() {
      page1 = new Page();
      page2 = new Page();
      listener = spy();
    });

    it('is triggered when a page is covered by another page', function() {
      navigationView.append(page1);
      page1.on('disappear', listener);
      navigationView.append(page2);
      expect(listener).to.have.been.calledOnce;
    });

    it('is triggered when page is detached', function() {
      navigationView.append(page1);
      page1.on('disappear', listener);
      page1.detach();
      expect(listener).to.have.been.calledOnce;
    });

    it('is only triggered on the topmost page when multiple pages are detached', function() {
      navigationView.append(page1, page2);
      page1.on('disappear', listener);
      page2.on('disappear', listener);
      page1.detach();
      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWith(page2);
    });

  });

  describe('detach', function() {

    let page1, page2, page3;

    beforeEach(function() {
      page1 = new Page();
      page2 = new Page();
      page3 = new Page();
    });

    it('detaches all pages on top', function() {
      navigationView.append(page1, page2, page3);
      page1.detach();
      expect(navigationView.pages().toArray()).to.deep.equal([]);
    });

    it('does not affect pages below', function() {
      navigationView.append(page1, page2, page3);
      page2.detach();
      expect(navigationView.pages().toArray()).to.deep.equal([page1]);
    });

  });

  describe('stack', function() {

    let stack;

    beforeEach(function() {
      stack = navigationView.stack;
    });

    it('length can not be set', function() {
      stack.length = 23;
      expect(stack.length).to.equal(0);
    });

    it('throws when pushing a non-page', function() {
      expect(() => {
        stack.push(new Composite());
      }).to.throw(Error, 'NavigationView cannot contain children of type Composite');
    });

    describe('with no pages', function() {

      it('length is 0', function() {
        expect(stack.length).to.equal(0);
      });

      it('returns -1 for indexOf', function() {
        expect(stack.indexOf(new Page())).to.equal(-1);
      });

      it('returns undefined for first()', function() {
        expect(stack.first()).to.be.undefined;
      });

      it('returns undefined for last()', function() {
        expect(stack.last()).to.be.undefined;
      });

      it('pop() returns undefined', function() {
        expect(() => {
          stack.push(new Composite());
        }).to.throw('NavigationView cannot contain children of type Composite');
      });

      it('clear() returns empty WidgetCollection', function() {
        let collection = stack.clear();

        expect(collection instanceof WidgetCollection).to.be.true;
        expect(collection.length).to.equal(0);
      });

    });

    describe('pushing a single page', function() {

      let page;

      beforeEach(function() {
        page = new Page();
        client.resetCalls();
        stack.push(page);
      });

      it('increases length', function() {
        expect(stack.length).to.equal(1);
      });

      it('finds it with indexOf', function() {
        expect(stack.indexOf(page)).to.equal(0);
      });

      it('is returned by first()', function() {
        expect(stack.first()).to.equal(page);
      });

      it('is returned by last()', function() {
        expect(stack.last()).to.equal(page);
      });

      it('makes page a child of navigationView', function() {
        expect(client.calls()[0]).to.deep.equal({
          id: page.cid,
          op: 'set',
          properties: {parent: navigationView.cid}
        });
        expect(page.parent()).to.equal(navigationView);
      });

      describe('calling pop()', function() {

        let result;

        beforeEach(function() {
          client.resetCalls();
          result = stack.pop();
        });

        it('returns page', function() {
          expect(result).to.equal(page);
        });

        it('removes page from stack', function() {
          expect(stack.indexOf(page)).to.equal(-1);
        });

        it('sets length back to zero', function() {
          expect(stack.length).to.equal(0);
        });

        it('disposes page', function() {
          expect(client.calls()[0]).to.deep.equal({
            id: page.cid,
            op: 'destroy'
          });
          expect(page.parent()).to.be.null;
        });

      });

      describe('triggering back', function() {

        let disappearListener;

        beforeEach(function() {
          client.resetCalls();
          disappearListener = spy();
          page.on('disappear', disappearListener);
          navigationView._trigger('back');
        });

        it('removes page from stack', function() {
          expect(stack.indexOf(page)).to.equal(-1);
        });

        it('sets length back to zero', function() {
          expect(stack.length).to.equal(0);
        });

        it('detaches page from navigationView', function() {
          expect(client.calls()[0]).to.deep.equal({
            id: page.cid,
            op: 'destroy'
          });
          expect(page.parent()).to.be.null;
        });

        it('triggers page disappear event', function() {
          expect(disappearListener).to.have.been.calledOnce;
        });

      });

      describe('calling clear()', function() {

        let result;

        beforeEach(function() {
          client.resetCalls();
          result = stack.clear();
        });

        it('returns WidgetCollection with page', function() {
          expect(result.toArray()).to.deep.equal([page]);
        });

        it('removes page from stack', function() {
          expect(stack.indexOf(page)).to.equal(-1);
        });

        it('sets length back to zero', function() {
          expect(stack.length).to.equal(0);
        });

        it('detaches page from navigationView', function() {
          expect(client.calls({id: page.cid})[0]).to.deep.equal({
            id: page.cid,
            op: 'destroy'
          });
          expect(page.parent()).to.be.null;
        });

      });

    });

    describe('pushing a single page with autoDispose false', function() {

      let page;

      beforeEach(function() {
        page = new Page();
        page.autoDispose = false;
        client.resetCalls();
        stack.push(page);
      });

      describe('pop() a page with autoDispose false', function() {

        let result;

        beforeEach(function() {
          client.resetCalls();
          result = stack.pop();
        });

        it('returns page', function() {
          expect(result).to.equal(page);
        });

        it('removes page from stack', function() {
          expect(stack.indexOf(page)).to.equal(-1);
        });

        it('sets length back to zero', function() {
          expect(stack.length).to.equal(0);
        });

        it('detaches page from navigationView', function() {
          expect(client.calls({id: page.cid})[0]).to.deep.equal({
            id: page.cid,
            op: 'set',
            properties: {parent: null}
          });
          expect(page.parent()).to.be.null;
        });

      });

      describe('triggering back', function() {

        let disappearListener;

        beforeEach(function() {
          client.resetCalls();
          disappearListener = spy();
          page.on('disappear', disappearListener);
          navigationView._trigger('back');
        });

        it('removes page from stack', function() {
          expect(stack.indexOf(page)).to.equal(-1);
        });

        it('sets length back to zero', function() {
          expect(stack.length).to.equal(0);
        });

        it('detaches page from navigationView', function() {
          expect(client.calls()[0]).to.deep.equal({
            id: page.cid,
            op: 'set',
            properties: {parent: null}
          });
          expect(page.parent()).to.be.null;
        });

        it('triggers page disappear event', function() {
          expect(disappearListener).to.have.been.calledOnce;
        });

      });

      describe('calling clear()', function() {

        let result;

        beforeEach(function() {
          client.resetCalls();
          result = stack.clear();
        });

        it('returns WidgetCollection with page', function() {
          expect(result.toArray()).to.deep.equal([page]);
        });

        it('removes page from stack', function() {
          expect(stack.indexOf(page)).to.equal(-1);
        });

        it('sets length back to zero', function() {
          expect(stack.length).to.equal(0);
        });

        it('detaches page from navigationView', function() {
          expect(client.calls({id: page.cid})[0]).to.deep.equal({
            id: page.cid,
            op: 'set',
            properties: {parent: null}
          });
          expect(page.parent()).to.be.null;
        });

      });

    });

    describe('pushing five pages', function() {

      let pages, listener;

      beforeEach(function() {
        pages = [new Page(), new Page(), new Page(), new Page(), new Page()];
        pages.forEach(page => stack.push(page));
        listener = spy();
      });

      it('increases length', function() {
        expect(stack.length).to.equal(5);
      });

      it('finds entry it with indexOf', function() {
        expect(stack.indexOf(pages[0])).to.equal(0);
        expect(stack.indexOf(pages[4])).to.equal(4);
      });

      it('is returned by first()', function() {
        expect(stack.first()).to.equal(pages[0]);
      });

      it('is returned by last()', function() {
        expect(stack.last()).to.equal(pages[4]);
      });

      it('triggers page appear event', function() {
        let anotherPage = new Page();
        anotherPage.on('appear', listener);

        stack.push(anotherPage);

        expect(listener).to.have.been.calledWith(anotherPage);
      });

      it('triggers page disappear event', function() {
        pages[4].on('disappear', listener);

        stack.push(new Page());

        expect(listener).to.have.been.calledWith(pages[4]);
      });

      describe('triggering back', function() {

        beforeEach(function() {
          client.resetCalls();
          navigationView._trigger('back');
        });

        it('removes page from stack', function() {
          expect(stack.indexOf(pages[4])).to.equal(-1);
        });

        it('decreases length', function() {
          expect(stack.length).to.equal(4);
        });

        it('triggers page appear event', function() {
          pages[2].on('appear', listener);

          stack.pop();

          expect(listener).to.have.been.calledWith(pages[2]);
        });

        it('triggers page disappear event', function() {
          pages[3].on('disappear', listener);

          stack.pop();

          expect(listener).to.have.been.calledWith(pages[3]);
        });

      });

      describe('calling pop()', function() {

        let result;

        beforeEach(function() {
          client.resetCalls();
          result = stack.pop();
        });

        it('returns page', function() {
          expect(result).to.equal(pages[4]);
        });

        it('removes page from stack', function() {
          expect(stack.indexOf(pages[4])).to.equal(-1);
        });

        it('decreases length', function() {
          expect(stack.length).to.equal(4);
        });

        it('triggers page appear event', function() {
          pages[2].on('appear', listener);

          stack.pop();

          expect(listener).to.have.been.calledWith(pages[2]);
        });

        it('triggers page disappear event', function() {
          pages[3].on('disappear', listener);

          stack.pop();

          expect(listener).to.have.been.calledWith(pages[3]);
        });

      });

      describe('calling clear()', function() {

        let result;

        beforeEach(function() {
          client.resetCalls();
          pages.forEach(page => page.on('disappear', listener));
          result = stack.clear();
        });

        it('returns WidgetCollection with pages', function() {
          expect(result.toArray()).to.deep.equal(pages);
        });

        it('sets length back to zero', function() {
          expect(stack.length).to.equal(0);
        });

        it('disposes pages', function() {
          expect(client.calls({op: 'destroy'}).length).to.equal(5);
          expect(client.calls({op: 'destroy'}).map(call => call.id)).to.deep.equal([
            pages[4].cid,
            pages[3].cid,
            pages[2].cid,
            pages[1].cid,
            pages[0].cid,
          ]);
          expect(navigationView.children().length).to.equal(0);
        });

        it('CALLs stack_clear', function() {
          expect(client.calls()[0]).to.deep.equal({
            id: navigationView.cid,
            op: 'call',
            method: 'stack_clear',
            parameters: {}
          });
        });

        it('triggers last page disappear event', function() {
          expect(listener).to.have.been.calledOnce;
          expect(listener).to.have.been.calledWith(pages[4]);
        });

      });

    });

  });

});
