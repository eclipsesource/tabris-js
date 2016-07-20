import {expect, spy, stub, restore, match, mockTabris} from '../../test';
import ClientStub from '../ClientStub';
import CollectionView from '../../../src/tabris/widgets/CollectionView';
import Composite from '../../../src/tabris/widgets/Composite';

describe('CollectionView', function() {

  let client;
  let parent;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
    parent = new Composite();
    client.resetCalls();
  });

  afterEach(restore);

  describe('constructor', function() {

    beforeEach(function() {
      new CollectionView({background: 'yellow'}).appendTo(parent);
    });

    it('creates a native view', function() {
      let createCalls = client.calls({op: 'create'});
      expect(createCalls.length).to.equal(1);
      expect(createCalls[0].type).to.equal('tabris.CollectionView');
    });

    it('includes standard properties in native create', function() {
      let createCalls = client.calls({op: 'create'});
      expect(createCalls[0].properties.background).to.deep.equal([255, 255, 0, 255]);
    });

    it('listens on native events `requestinfo`, `createitem`, and `populateitem`', function() {
      expect(client.calls({op: 'listen', event: 'requestinfo'})[0].listen).to.equal(true);
      expect(client.calls({op: 'listen', event: 'createitem'})[0].listen).to.equal(true);
      expect(client.calls({op: 'listen', event: 'populateitem'})[0].listen).to.equal(true);
    });

  });

  describe('instance', function() {

    let view;

    beforeEach(function() {
      view = new CollectionView({background: 'yellow'}).appendTo(parent);
      client.resetCalls();
    });

    it('returns default property values', function() {
      expect(view.itemCount).to.equal(0);
      expect(view.cellType).to.equal(null);
      expect(view.cellHeight).to.equal('auto');
      expect(view.createCell).to.be.a('function');
      expect(view.updateCell).to.be.a('function');
      expect(view.refreshEnabled).to.equal(false);
      expect(view.refreshMessage).to.equal('');
    });

    describe('refreshIndicator', function() {

      it('calls native GET', function() {
        stub(client, 'get').returns(false);

        expect(view.refreshIndicator).to.equal(false);
      });

    });

    describe('createCell', function() {

      it('defaults to function that creates a cell', function() {
        expect(view.createCell).to.be.a('function');
        expect(view.createCell()).to.be.instanceOf(Composite);
      });

      it('accepts function', function() {
        let fn = spy();
        view.createCell = fn;
        expect(view.createCell).to.equal(fn);
      });

      it('does not SET property on client', function() {
        view.createCell = spy();
        expect(client.calls({op: 'set', id: view.cid}).length).to.equal(0);
      });

      it('calls native reload with item count', function() {
        view.itemCount = 10;
        client.resetCalls();

        view.createCell = spy();

        tabris.trigger('flush');
        let calls = client.calls({op: 'call', id: view.cid, method: 'reload'});
        expect(calls[0].parameters).to.deep.equal({items: 10});
      });

      it('does not call native reload when unchanged', function() {
        let fn = spy();
        view.createCell = fn;
        tabris.trigger('flush');
        client.resetCalls();

        view.createCell = fn;
        tabris.trigger('flush');

        let calls = client.calls({op: 'call', id: view.cid, method: 'reload'});
        expect(calls).to.be.empty;
      });

    });

    describe('updateCell', function() {

      it('defaults to function', function() {
        expect(view.updateCell).to.be.a('function');
      });

      it('accepts function', function() {
        let fn = spy();
        view.updateCell = fn;
        expect(view.updateCell).to.equal(fn);
      });

      it('does not SET property on client', function() {
        view.updateCell = spy();
        expect(client.calls({op: 'set', id: view.cid}).length).to.equal(0);
      });

      it('calls native reload with item count', function() {
        view.itemCount = 10;
        client.resetCalls();

        view.updateCell = spy();

        tabris.trigger('flush');
        let calls = client.calls({op: 'call', id: view.cid, method: 'reload'});
        expect(calls[0].parameters).to.deep.equal({items: 10});
      });

      it('does not call native reload when unchanged', function() {
        let fn = spy();
        view.updateCell = fn;
        tabris.trigger('flush');
        client.resetCalls();

        view.updateCell = fn;
        tabris.trigger('flush');

        let calls = client.calls({op: 'call', id: view.cid, method: 'reload'});
        expect(calls).to.be.empty;
      });
    });

    describe('creating cells on demand', function() {

      it('calls createCell', function() {
        view.createCell = spy(() => new Composite());
        view._trigger('createitem', {type: 0});
        expect(view.createCell).to.have.been.calledOnce;
      });

      it('throws when createCell returns wrong type', function() {
        view.createCell = spy(() => 23);
        expect(() => view._trigger('createitem', {type: 0})).to.throw(Error, 'Created cell is not a widget');
      });

      it('throws when createCell returns widget with a parent', function() {
        let cell = new Composite().appendTo(new Composite());
        view.createCell = spy(() => cell);
        expect(() => view._trigger('createitem', {type: 0})).to.throw(Error, 'Created cell already has a parent');
      });

    });

    ['firstVisibleIndex', 'lastVisibleIndex'].forEach((prop) => {

      describe(prop, function() {

        it('GETs property from client', function() {
          stub(client, 'get').returns(23);

          let result = view.get(prop);

          expect(result).to.equal(23);
          expect(client.get).to.have.been.called;
        });

        it('prevents setting the property', function() {
          stub(console, 'warn');
          spy(client, 'set');

          view.set(prop, 23);

          expect(client.set).to.have.not.been.called;
          expect(console.warn).to.have.been.called;
          expect(console.warn).to.have.been.calledWith(match(`Can not set read-only property "${prop}"`));
        });

      });

      let changeEvent = prop + 'Changed';

      describe(changeEvent, function() {

        it('issues native listen once', function() {
          let listener = spy();

          view.on(changeEvent, listener);
          view.on(changeEvent, listener);

          expect(client.calls({op: 'listen', id: view.cid, event: 'scroll'}).length).to.equal(1);
        });

        it('listener is notified once for every new index', function() {
          let listener = spy();
          let index = 23;
          view.on(changeEvent, listener);
          stub(client, 'get', () => index);

          view._trigger('scroll', {});
          view._trigger('scroll', {});
          view._trigger('scroll', {});
          index = 24;
          view._trigger('scroll', {});
          view._trigger('scroll', {});

          expect(listener).to.have.been.calledTwice;
          expect(listener.firstCall).to.have.been.calledWithMatch({target: view, value: 23});
          expect(listener.secondCall).to.have.been.calledWithMatch({target: view, value: 24});
        });

        it('listener is notified once even if other listeners are attached', function() {
          let listener = spy();
          view.on(changeEvent, listener);
          view.on(changeEvent, function() {});
          stub(client, 'get').returns(23);

          view._trigger('scroll', {});

          expect(listener).to.have.been.calledOnce;
        });

        it('listener is notified once after on-off-on', function() {
          let listener = spy();
          view.on(changeEvent, listener);
          view.off(changeEvent, listener);
          view.on(changeEvent, listener);
          stub(client, 'get').returns(23);

          view._trigger('scroll', {});

          expect(listener).to.have.been.calledOnce;
        });

      });

    });

    describe('cellType', function() {

      beforeEach(function() {
        spy(client, 'set');
      });

      it('accepts and returns function', function() {
        let fn = spy();
        view.cellType = fn;
        expect(view.cellType).to.equal(fn);
      });

      it('accepts and returns string', function() {
        view.cellType = 'foo';
        expect(view.cellType).to.equal('foo');
      });

      it('does not SET native property', function() {
        view.cellType = 'foo';
        tabris._nativeBridge.flush();
        expect(client.set).to.have.not.been.called;
      });

      it('calls native reload with item count', function() {
        view.itemCount = 10;
        client.resetCalls();

        view.cellType = 'cellType';

        tabris.trigger('flush');
        let calls = client.calls({op: 'call', id: view.cid, method: 'reload'});
        expect(calls[0].parameters).to.deep.equal({items: 10});
      });

      it('does not call native reload when unchanged', function() {
        view.cellType = 'cellType';
        tabris.trigger('flush');
        client.resetCalls();

        view.cellType = 'cellType';
        tabris.trigger('flush');

        let calls = client.calls({op: 'call', id: view.cid, method: 'reload'});
        expect(calls).to.be.empty;
      });

    });

    describe('cellHeight', function() {

      beforeEach(function() {
        spy(client, 'set');
      });

      it('accepts and returns function', function() {
        let fn = spy();
        view.cellHeight = fn;
        expect(view.cellHeight).to.equal(fn);
      });

      it('accepts and returns number', function() {
        view.cellHeight = 23;
        expect(view.cellHeight).to.equal(23);
      });

      it('accepts and returns "auto"', function() {
        view.cellHeight = 'auto';
        expect(view.cellHeight).to.equal('auto');
      });

      it('does not SET native property', function() {
        view.cellHeight = 23;
        tabris._nativeBridge.flush();
        expect(client.set).to.have.not.been.called;
      });

      it('calls native reload with item count', function() {
        view.itemCount = 10;
        client.resetCalls();

        view.cellHeight = 48;

        tabris.trigger('flush');
        let calls = client.calls({op: 'call', id: view.cid, method: 'reload'});
        expect(calls[0].parameters).to.deep.equal({items: 10});
      });

      it('does not call native reload when unchanged', function() {
        view.cellHeight = 48;
        tabris.trigger('flush');
        client.resetCalls();

        view.cellHeight = 48;
        tabris.trigger('flush');

        let calls = client.calls({op: 'call', id: view.cid, method: 'reload'});
        expect(calls).to.be.empty;
      });
    });

    describe('itemCount', function() {

      it('accepts numbers', function() {
        view.itemCount = 23;
        expect(view.itemCount).to.equal(23);
      });

      it('calls native reload with item count', function() {
        view.itemCount = 23;
        tabris.trigger('flush');
        let calls = client.calls({op: 'call', id: view.cid, method: 'reload'});
        expect(calls[0].parameters).to.deep.equal({items: 23});
      });

      it('does not call native reload when unchanged', function() {
        view.itemCount = 23;
        tabris.trigger('flush');
        client.resetCalls();

        view.itemCount = 23;
        tabris.trigger('flush');

        let calls = client.calls({op: 'call', id: view.cid, method: 'reload'});
        expect(calls).to.be.empty;
      });

    });

    describe('when `requestinfo` event is received', function() {

      let results;

      describe('when cellType and cellHeight are functions', function() {

        beforeEach(function() {
          view.cellType = spy(index => index % 2 === 0 ? 'bar' : 'foo');
          view.cellHeight = spy(index => index % 2 === 0 ? 50 : 80);
          results = [
            view._trigger('requestinfo', {index: 0}),
            view._trigger('requestinfo', {index: 1}),
            view._trigger('requestinfo', {index: 2}),
          ];
        });

        it('executes `cellType` function', function() {
          expect(view.cellType).to.have.been.calledWith(0);
          expect(view.cellType).to.have.been.calledWith(1);
          expect(view.cellType).to.have.been.calledWith(2);
        });

        it('executes `cellHeight` function', function() {
          expect(view.cellHeight).to.have.been.calledWith(0);
          expect(view.cellHeight).to.have.been.calledWith(1);
          expect(view.cellHeight).to.have.been.calledWith(2);
        });

        it('returns type and height', function() {
          expect(results).to.deep.equal([
            {type: 0, height: 50},
            {type: 1, height: 80},
            {type: 0, height: 50}
          ]);
        });

      });

      describe('when cellType and cellHeight are values', function() {

        beforeEach(function() {
          view.cellType = 'foo';
          view.cellHeight = 50;
          results = [
            view._trigger('requestinfo', {index: 0}),
            view._trigger('requestinfo', {index: 1}),
            view._trigger('requestinfo', {index: 2}),
          ];
        });

        it('returns type and height', function() {
          expect(results).to.deep.equal([
            {type: 0, height: 50},
            {type: 0, height: 50},
            {type: 0, height: 50}
          ]);
        });

      });

    });

    describe('when `select` event is received', function() {

      it('triggers select on the collection view', function() {
        let listener = spy();
        view.on('select', listener);

        view._trigger('select', {index: 0});

        expect(listener).to.have.been.calledOnce;
        expect(listener).to.have.been.calledWithMatch({target: view, index: 0});
      });

    });

    describe('when `scroll` event is received', function() {

      it('triggers `scroll` on collection view', function() {
        let listener = spy();
        view.on('scroll', listener);

        view._trigger('scroll', {deltaX: 23, deltaY: 42});

        expect(listener).to.have.been.calledOnce;
        expect(listener).to.have.been.calledWithMatch({target: view, deltaX: 23, deltaY: 42});
      });

    });

    describe('when `createitem` event is received', function() {

      let result, cell;

      beforeEach(function() {
        view.createCell = spy(() => {
          cell = new Composite();
          return cell;
        });
        result = view._trigger('createitem', {type: 0});
      });

      it('calls createCell with itemType null', function() {
        expect(view.createCell).to.have.been.calledWith(null);
      });

      it('returns the created cell`s id', function() {
        expect(result).to.equal(cell.cid);
      });

      it('sets the cell parent to the collection view', function() {
        expect(cell.parent()).to.equal(view);
      });

      it('returns cells as children', function() {
        expect(view.children().length).to.equal(1);
        expect(view.children()[0]).to.equal(cell);
      });

      describe('when calling cell.dispose()', function() {

        beforeEach(function() {
          stub(console, 'warn');
          cell.dispose();
        });

        it('cell is not disposed', function() {
          expect(cell.isDisposed()).to.equal(false);
        });

        it('a warning is logged', function() {
          let warning = 'Cannot dispose of collection view cell';
          expect(console.warn).to.have.been.calledWith(warning);
        });

      });

      describe('when calling cell.appendTo()', function() {

        beforeEach(function() {
          stub(console, 'warn');
          cell.appendTo(new Composite());
        });

        it('cell parent is unchanged', function() {
          expect(cell.parent()).to.equal(view);
        });

        it('a warning is logged', function() {
          let warning = 'Cannot re-parent collection view cell';
          expect(console.warn).to.have.been.calledWith(warning);
        });

      });

      describe('when view is disposed', function() {

        beforeEach(function() {
          view.dispose();
        });

        it('cells are disposed', function() {
          expect(cell.isDisposed()).to.equal(true);
        });

      });

    });

    describe('when `populateitem` event is received', function() {

      let cell;

      beforeEach(function() {
        cell = new Composite();
        view.updateCell = spy();
      });

      it('calls `updateCell`', function() {
        view._trigger('populateitem', {widget: cell.cid, index: 3});

        expect(view.updateCell).to.have.been.calledOnce;
        expect(view.updateCell).to.have.been.calledWith(cell, 3);
      });

    });

    describe('insert', function() {

      beforeEach(function() {
        view.itemCount = 3;
        client.resetCalls();
      });

      it('fails when index is not a number', function() {
        expect(() => view.insert(NaN)).to.throw(Error, 'Invalid index');
      });

      it('fails when count is not a number', function() {
        expect(() => view.insert(0, NaN)).to.throw(Error, 'Invalid insert count');
      });

      it('fails when count is zero or negative', function() {
        expect(() => view.insert(0, 0)).to.throw(Error, 'Invalid insert count');
        expect(() => view.insert(0, -1)).to.throw(Error, 'Invalid insert count');
      });

      it('calls native update', function() {
        view.insert(0, 3);

        let updateCall = client.calls({op: 'call', method: 'update', id: view.cid})[0];
        expect(updateCall.parameters).to.deep.equal({insert: [0, 3]});
      });

      it('updates itemCount', function() {
        view.insert(0, 3);

        expect(view.itemCount).to.equal(6);
      });

      it('handles single parameter', function() {
        view.insert(2);

        let updateCall = client.calls({op: 'call', method: 'update', id: view.cid})[0];
        expect(updateCall.parameters).to.deep.equal({insert: [2, 1]});
        expect(view.itemCount).to.equal(4);
      });

      it('handles negative index', function() {
        view.insert(-1);

        let updateCall = client.calls({op: 'call', method: 'update', id: view.cid})[0];
        expect(updateCall.parameters).to.deep.equal({insert: [2, 1]});
        expect(view.itemCount).to.equal(4);
      });

      it('adjusts index to bounds', function() {
        view.insert(5);

        let call = client.calls({op: 'call', method: 'update', id: view.cid})[0];
        expect(call.parameters).to.deep.equal({insert: [3, 1]});
        expect(view.itemCount).to.equal(4);
      });

      it('adjusts negative index to bounds', function() {
        view.insert(-5);

        let call = client.calls({op: 'call', method: 'update', id: view.cid})[0];
        expect(call.parameters).to.deep.equal({insert: [0, 1]});
        expect(view.itemCount).to.equal(4);
      });

    });

    describe('remove', function() {

      beforeEach(function() {
        view.itemCount = 3;
        client.resetCalls();
      });

      it('fails when index is not a number', function() {
        expect(() => view.remove(NaN)).to.throw(Error, 'Invalid index');
      });

      it('fails when count is not a number', function() {
        expect(() => view.remove(0, NaN)).to.throw(Error, 'Invalid remove count');
      });

      it('calls native update', function() {
        view.remove(1, 2);

        let updateCall = client.calls({op: 'call', method: 'update', id: view.cid})[0];
        expect(updateCall.parameters).to.deep.equal({remove: [1, 2]});
      });

      it('updates itemCount', function() {
        view.remove(1, 2);

        expect(view.itemCount).to.equal(1);
      });

      it('handles single parameter', function() {
        view.remove(1);

        let updateCall = client.calls({op: 'call', method: 'update', id: view.cid})[0];
        expect(updateCall.parameters).to.deep.equal({remove: [1, 1]});
        expect(view.itemCount).to.equal(2);
      });

      it('handles negative index', function() {
        view.remove(-1);

        let updateCall = client.calls({op: 'call', method: 'update', id: view.cid})[0];
        expect(updateCall.parameters).to.deep.equal({remove: [2, 1]});
        expect(view.itemCount).to.equal(2);
      });

      it('ignores index out of bounds', function() {
        view.remove(5, 2);

        let updateCalls = client.calls({op: 'call', method: 'update', id: view.cid});
        expect(updateCalls).to.be.empty;
        expect(view.itemCount).to.equal(3);
      });

      it('ignores negative index out of bounds', function() {
        view.remove(-5, 2);

        let updateCalls = client.calls({op: 'call', method: 'update', id: view.cid});
        expect(updateCalls).to.be.empty;
      });

      it('repairs count if exceeding', function() {
        view.remove(2, 5);

        let updateCall = client.calls({op: 'call', method: 'update', id: view.cid})[0];
        expect(updateCall.parameters).to.deep.equal({remove: [2, 1]});
        expect(view.itemCount).to.equal(2);
      });

      it('ignores zero count', function() {
        view.remove(2, 0);

        let updateCalls = client.calls({op: 'call', method: 'update', id: view.cid});
        expect(updateCalls).to.be.empty;
        expect(view.itemCount).to.equal(3);
      });

    });

    describe('refresh', function() {

      beforeEach(function() {
        view.itemCount = 3;
        client.resetCalls();
      });

      it('without parameters calls native update', function() {
        view.refresh();

        let updateCall = client.calls({op: 'call', method: 'update', id: view.cid})[0];
        expect(updateCall.parameters.reload).to.deep.equal([0, 3]);
      });

      it('calls native update', function() {
        view.refresh(1);

        let updateCall = client.calls({op: 'call', method: 'update', id: view.cid})[0];
        expect(updateCall.parameters.reload).to.deep.equal([1, 1]);
      });

      it('accepts negative index', function() {
        view.refresh(-1);

        let updateCall = client.calls({op: 'call', method: 'update', id: view.cid})[0];
        expect(updateCall.parameters.reload).to.deep.equal([2, 1]);
      });

      it('ignores out-of-bounds index', function() {
        view.refresh(5);

        let calls = client.calls({op: 'call', method: 'update', id: view.cid});
        expect(calls).to.be.empty;
      });

      it('fails with invalid parameter', function() {
        expect(() => {
          view.refresh(NaN);
        }).to.throw(Error, 'Invalid index');
      });

    });

    describe('reveal', function() {

      beforeEach(function() {
        view.itemCount = 3;
        client.resetCalls();
      });

      it('calls native reveal with index', function() {
        view.reveal(1);

        let call = client.calls({op: 'call', method: 'reveal', id: view.cid})[0];
        expect(call.parameters).to.deep.equal({index: 1});
      });

      it('accepts negative index', function() {
        view.reveal(-1);

        let call = client.calls({op: 'call', method: 'reveal', id: view.cid})[0];
        expect(call.parameters).to.deep.equal({index: 2});
      });

      it('ignores out-of-bounds index', function() {
        view.reveal(5);

        let calls = client.calls({op: 'call', method: 'reveal', id: view.cid});
        expect(calls).to.be.empty;
      });

      it('fails with invalid parameter', function() {
        expect(() => {
          view.refresh(NaN);
        }).to.throw();
      });

    });

    it('does not crash when disposed right after setting itemCount (bugfix)', function() {
      let view = new CollectionView();
      view.itemCount = 23;
      view.dispose();
      tabris.trigger('flush');
      expect(view.isDisposed()).to.equal(true);
    });

  });

});
