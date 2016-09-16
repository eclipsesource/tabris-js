import {expect, restore} from '../../test';
import ClientStub from '../ClientStub';
import Page from '../../../src/tabris/widgets/Page';
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
      on: () => {},
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
        var collection = stack.clear();

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
          properties: {parent: navigationView.cid}});
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

      let pages;

      beforeEach(() => {
        pages = [new Page(), new Page(), new Page(), new Page(), new Page()];
        pages.forEach((page) => stack.push(page));
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

      });

      describe('calling clear()', () => {

        let result;

        beforeEach(() => {
          client.resetCalls();
          result = stack.clear();
        });

        it('returns WidgetCollection with pages', () => {
          expect(result.toArray()).to.deep.equal(pages);
        });

        it('sets length back to zero', () => {
          expect(stack.length).to.equal(0);
        });

        it('detaches pages from navigationView', () => {
          expect(client.calls({op: 'set'}).length).to.equal(5);
          expect(client.calls()[1]).to.deep.equal({
            id: pages[0].cid,
            op: 'set',
            properties: {parent: null}
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

      });

    });

  });

});
