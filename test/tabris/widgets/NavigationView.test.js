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

describe('NavigationView', () => {

  let client, navigationView;

  beforeEach(() => {
    client = new ClientStub();
    global.tabris = {
      on: () => {
      },
      _proxies: new ProxyStore(),
      _notify: (cid, event, param) => tabris._proxies.find(cid)._trigger(event, param)
    };
    global.tabris._nativeBridge = new NativeBridge(client);
    client.resetCalls();
    navigationView = new NavigationView();
  });

  afterEach(restore);

  it('children list is empty', () => {
    expect(navigationView.children().toArray()).to.eql([]);
  });

  it('can not append a Composite', () => {
    expect(() => {
      navigationView.append(new Page());
    }).to.throw();
  });

  it('can not append a Page', () => {
    expect(() => {
      navigationView.append(new Page());
    }).to.throw();
  });

  it('can append an Action', () => {
    let action = new Action();

    navigationView.append(action);

    expect(navigationView.children()[0]).to.equal(action);
  });

  it('can append a SearchAction', () => {
    let action = new SearchAction();

    navigationView.append(action);

    expect(navigationView.children()[0]).to.equal(action);
  });

  it('has visible "toolbarVisible" by default', () => {
    expect(navigationView.toolbarVisible).to.be.true;
  });

  it('supports property "toolbarVisible"', () => {
    navigationView.toolbarVisible = false;

    expect(navigationView.toolbarVisible).to.be.false;
  });

  it('supports property "toolbarColor"', () => {
    navigationView.toolbarColor = 'red';

    expect(navigationView.toolbarColor).to.eq('rgba(255, 0, 0, 1)');
  });

  it('supports property "titleTextColor"', () => {
    navigationView.titleTextColor = '#00ff00';

    expect(navigationView.titleTextColor).to.eq('rgba(0, 255, 0, 1)');
  });

  it('supports property "actionColor"', () => {
    navigationView.actionColor = 'red';

    expect(navigationView.actionColor).to.eq('rgba(255, 0, 0, 1)');
  });

  it('supports property "actionTextColor"', () => {
    navigationView.actionTextColor = 'blue';

    expect(navigationView.actionTextColor).to.eq('rgba(0, 0, 255, 1)');
  });

  describe('stack', () => {

    let stack;

    beforeEach(() => {
      stack = navigationView.stack;
    });

    it('length can not be set', () => {
      stack.length = 23;
      expect(stack.length).to.equal(0);
    });

    it('throws when pushing a non-page', () => {
      expect(() => {
        stack.push(new Composite());
      }).to.throw(Error, 'Only instances of Page can be pushed.');
    });

    describe('with no pages', () => {

      it('length is 0', () => {
        expect(stack.length).to.equal(0);
      });

      it('returns -1 for indexOf', () => {
        expect(stack.indexOf(new Page())).to.equal(-1);
      });

      it('returns undefined for first()', () => {
        expect(stack.first()).to.be.undefined;
      });

      it('returns undefined for last()', () => {
        expect(stack.last()).to.be.undefined;
      });

      it('pop() returns undefined', () => {
        expect(() => {
          stack.push(new Composite());
        }).to.throw('Only instances of Page can be pushed.');
      });

      it('clear() returns empty WidgetCollection', () => {
        let collection = stack.clear();

        expect(collection instanceof WidgetCollection).to.be.true;
        expect(collection.length).to.equal(0);
      });

    });

    describe('pushing a single page', () => {

      let page;

      beforeEach(() => {
        page = new Page();
        client.resetCalls();
        stack.push(page);
      });

      it('increases length', () => {
        expect(stack.length).to.equal(1);
      });

      it('finds it with indexOf', () => {
        expect(stack.indexOf(page)).to.equal(0);
      });

      it('is returned by first()', () => {
        expect(stack.first()).to.equal(page);
      });

      it('is returned by last()', () => {
        expect(stack.last()).to.equal(page);
      });

      it('makes page a child of navigationView', () => {
        expect(client.calls()[0]).to.deep.equal({
          id: page.cid,
          op: 'set',
          properties: {parent: navigationView.cid}
        });
        expect(page.parent()).to.equal(navigationView);
      });

      it('CALLs stack_push', () => {
        expect(client.calls()[1]).to.deep.equal({
          id: navigationView.cid,
          op: 'call',
          method: 'stack_push',
          parameters: {page: page.cid}
        });
      });

      it('throws if page is pushed again', () => {
        expect(() => {
          stack.push(page);
        }).to.throw('Can not push a page that is already on the stack.');
      });

      describe('calling pop()', () => {

        let result;

        beforeEach(() => {
          client.resetCalls();
          result = stack.pop();
        });

        it('returns page', () => {
          expect(result).to.equal(page);
        });

        it('removes page from stack', () => {
          expect(stack.indexOf(page)).to.equal(-1);
        });

        it('sets length back to zero', () => {
          expect(stack.length).to.equal(0);
        });

        it('disposes page', () => {
          expect(client.calls()[1]).to.deep.equal({
            id: page.cid,
            op: 'destroy'
          });
          expect(page.parent()).to.be.undefined;
        });

        it('CALLs stack_pop', () => {
          expect(client.calls()[0]).to.deep.equal({
            id: navigationView.cid,
            op: 'call',
            method: 'stack_pop',
            parameters: {}
          });
        });

      });

      describe('triggering back', function() {

        let disappearListener;

        beforeEach(() => {
          client.resetCalls();
          disappearListener = spy();
          page.on('disappear', disappearListener);
          navigationView._trigger('back');
        });

        it('removes page from stack', () => {
          expect(stack.indexOf(page)).to.equal(-1);
        });

        it('sets length back to zero', () => {
          expect(stack.length).to.equal(0);
        });

        it('detaches page from navigationView', () => {
          expect(client.calls()[0]).to.deep.equal({
            id: page.cid,
            op: 'destroy'
          });
          expect(page.parent()).to.be.undefined;
        });

        it('does NOT CALL stack_pop', () => {
          expect(client.calls().length).to.equal(1);
        });

        it('triggers page disappear event', () => {
          expect(disappearListener).to.have.been.calledOnce;
        });

      });

      describe('calling clear()', () => {

        let result;

        beforeEach(() => {
          client.resetCalls();
          result = stack.clear();
        });

        it('returns WidgetCollection with page', () => {
          expect(result.toArray()).to.deep.equal([page]);
        });

        it('removes page from stack', () => {
          expect(stack.indexOf(page)).to.equal(-1);
        });

        it('sets length back to zero', () => {
          expect(stack.length).to.equal(0);
        });

        it('detaches page from navigationView', () => {
          expect(client.calls()[1]).to.deep.equal({
            id: page.cid,
            op: 'destroy'
          });
          expect(page.parent()).to.be.undefined;
        });

        it('CALLs stack_clear', () => {
          expect(client.calls()[0]).to.deep.equal({
            id: navigationView.cid,
            op: 'call',
            method: 'stack_clear',
            parameters: {}
          });
        });

      });

    });

    describe('pushing a single page with autoDispose false', () => {

      let page;

      beforeEach(() => {
        page = new Page();
        page.autoDispose = false;
        client.resetCalls();
        stack.push(page);
      });

      describe('pop() a page with autoDispose false', () => {

        let result;

        beforeEach(() => {
          client.resetCalls();
          result = stack.pop();
        });

        it('returns page', () => {
          expect(result).to.equal(page);
        });

        it('removes page from stack', () => {
          expect(stack.indexOf(page)).to.equal(-1);
        });

        it('sets length back to zero', () => {
          expect(stack.length).to.equal(0);
        });

        it('detaches page from navigationView', () => {
          expect(client.calls()[1]).to.deep.equal({
            id: page.cid,
            op: 'set',
            properties: {parent: null}
          });
          expect(page.parent()).to.be.null;
        });

        it('CALLs stack_pop', () => {
          expect(client.calls()[0]).to.deep.equal({
            id: navigationView.cid,
            op: 'call',
            method: 'stack_pop',
            parameters: {}
          });
        });

      });

      describe('triggering back', function() {

        let disappearListener;

        beforeEach(() => {
          client.resetCalls();
          disappearListener = spy();
          page.on('disappear', disappearListener);
          navigationView._trigger('back');
        });

        it('removes page from stack', () => {
          expect(stack.indexOf(page)).to.equal(-1);
        });

        it('sets length back to zero', () => {
          expect(stack.length).to.equal(0);
        });

        it('detaches page from navigationView', () => {
          expect(client.calls()[0]).to.deep.equal({
            id: page.cid,
            op: 'set',
            properties: {parent: null}
          });
          expect(page.parent()).to.be.null;
        });

        it('does NOT CALL stack_pop', () => {
          expect(client.calls().length).to.equal(1);
        });

        it('triggers page disappear event', () => {
          expect(disappearListener).to.have.been.calledOnce;
        });

      });

      describe('calling clear()', () => {

        let result;

        beforeEach(() => {
          client.resetCalls();
          result = stack.clear();
        });

        it('returns WidgetCollection with page', () => {
          expect(result.toArray()).to.deep.equal([page]);
        });

        it('removes page from stack', () => {
          expect(stack.indexOf(page)).to.equal(-1);
        });

        it('sets length back to zero', () => {
          expect(stack.length).to.equal(0);
        });

        it('detaches page from navigationView', () => {
          expect(client.calls()[1]).to.deep.equal({
            id: page.cid,
            op: 'set',
            properties: {parent: null}
          });
          expect(page.parent()).to.be.null;
        });

        it('CALLs stack_clear', () => {
          expect(client.calls()[0]).to.deep.equal({
            id: navigationView.cid,
            op: 'call',
            method: 'stack_clear',
            parameters: {}
          });
        });

      });

    });

    describe('pushing five pages', () => {

      let pages, eventLog;

      beforeEach(() => {
        pages = [new Page(), new Page(), new Page(), new Page(), new Page()];
        pages.forEach((page) => stack.push(page));
        eventLog = spy();
      });

      it('increases length', () => {
        expect(stack.length).to.equal(5);
      });

      it('finds entry it with indexOf', () => {
        expect(stack.indexOf(pages[0])).to.equal(0);
        expect(stack.indexOf(pages[4])).to.equal(4);
      });

      it('is returned by first()', () => {
        expect(stack.first()).to.equal(pages[0]);
      });

      it('is returned by last()', () => {
        expect(stack.last()).to.equal(pages[4]);
      });

      it('triggers page appear event', () => {
        let anotherPage = new Page();
        anotherPage.on('appear', eventLog);

        stack.push(anotherPage);

        expect(eventLog).to.have.been.calledWith(anotherPage);
      });

      it('triggers page disappear event', () => {
        pages[4].on('disappear', eventLog);

        stack.push(new Page());

        expect(eventLog).to.have.been.calledWith(pages[4]);
      });

      describe('triggering back', () => {

        beforeEach(() => {
          client.resetCalls();
          navigationView._trigger('back');
        });

        it('removes page from stack', () => {
          expect(stack.indexOf(pages[4])).to.equal(-1);
        });

        it('decreases length', () => {
          expect(stack.length).to.equal(4);
        });

        it('triggers page appear event', () => {
          pages[2].on('appear', eventLog);

          stack.pop();

          expect(eventLog).to.have.been.calledWith(pages[2]);
        });

        it('triggers page disappear event', () => {
          pages[3].on('disappear', eventLog);

          stack.pop();

          expect(eventLog).to.have.been.calledWith(pages[3]);
        });

      });

      describe('calling pop()', () => {

        let result;

        beforeEach(() => {
          client.resetCalls();
          result = stack.pop();
        });

        it('returns page', () => {
          expect(result).to.equal(pages[4]);
        });

        it('removes page from stack', () => {
          expect(stack.indexOf(pages[4])).to.equal(-1);
        });

        it('decreases length', () => {
          expect(stack.length).to.equal(4);
        });

        it('triggers page appear event', () => {
          pages[2].on('appear', eventLog);

          stack.pop();

          expect(eventLog).to.have.been.calledWith(pages[2]);
        });

        it('triggers page disappear event', () => {
          pages[3].on('disappear', eventLog);

          stack.pop();

          expect(eventLog).to.have.been.calledWith(pages[3]);
        });

      });

      describe('calling clear()', () => {

        let result;

        beforeEach(() => {
          client.resetCalls();
          pages.forEach((page) => {
            page.on('disappear', eventLog);
          });
          result = stack.clear();
        });

        it('returns WidgetCollection with pages', () => {
          expect(result.toArray()).to.deep.equal(pages);
        });

        it('sets length back to zero', () => {
          expect(stack.length).to.equal(0);
        });

        it('disposes pages', () => {
          expect(client.calls({op: 'destroy'}).length).to.equal(5);
          expect(client.calls()[1]).to.deep.equal({
            id: pages[0].cid,
            op: 'destroy'
          });
          expect(navigationView.children().length).to.equal(0);
        });

        it('CALLs stack_clear', () => {
          expect(client.calls()[0]).to.deep.equal({
            id: navigationView.cid,
            op: 'call',
            method: 'stack_clear',
            parameters: {}
          });
        });

        it('triggers last page disappear event', () => {
          expect(eventLog.callCount).to.be.equal(1);
          expect(eventLog).to.have.been.calledWith(pages[4]);
        });

      });

    });

  });

});
