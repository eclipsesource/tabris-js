import {expect, mockTabris, spy, stub, restore} from '../test';
import WidgetCollection from '../../src/tabris/WidgetCollection';
import Layout from '../../src/tabris/Layout';
import ClientStub from './ClientStub';
import Widget from '../../src/tabris/Widget';
import Composite from '../../src/tabris/widgets/Composite';
import {omit} from '../../src/tabris/util';

describe('Widget', function() {

  class TestWidget extends Composite {
    get _nativeType() {
      return 'TestWidget';
    }
  }

  let client;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
  });

  afterEach(restore);

  describe('constructor', function() {

    it('prevents instantiation', function() {
      expect(() => {
        new Widget();
      }).to.throw(Error, 'Cannot instantiate abstract Widget');
    });

  });

  describe('instance', function() {

    let widget;

    beforeEach(function() {
      widget = new TestWidget();
      client.resetCalls();
    });

    it('is a Widget instance', function() {
      expect(widget).to.be.instanceof(Widget);
    });

    it('translates background color to arrays', function() {
      widget.set({background: 'rgba(1, 2, 3, 0.5)'});

      let call = client.calls({op: 'set'})[0];
      expect(call.properties.background).to.eql([1, 2, 3, 128]);
    });

    it('translates font string to object', function() {
      widget.set({font: '12px Arial'});

      let call = client.calls({op: 'set'})[0];
      expect(call.properties.font)
        .to.eql({family: ['Arial'], size: 12, style: 'normal', weight: 'normal'});
    });

    it('normalizes font string', function() {
      widget.set({font: 'bold italic   12px Arial'});

      expect(widget.font).to.eql('italic bold 12px Arial');
    });

    it("returns 'initial' when no value is cached", function() {
      spy(client, 'get');

      expect(widget.font).to.eql('initial');
      expect(client.get).not.to.have.been.called;
    });

    it('translates backgroundImage to array', function() {
      widget.set({backgroundImage: {src: 'bar', width: 23, height: 42}});

      let call = client.calls({op: 'set'})[0];
      expect(call.properties.backgroundImage).to.eql(['bar', 23, 42, null]);
    });

    it('prints warning when attempting to set bounds', function() {
      stub(console, 'warn');

      widget.bounds = {left: 1, top: 2, width: 3, height: 4};

      expect(client.calls({op: 'set'}).length).to.equal(0);
      expect(console.warn).to.have.been.calledWith('Can not set read-only property "bounds"');
    });

    it('sets elevation to value', function() {
      widget.elevation = 8;

      let call = client.calls({op: 'set'})[0];
      expect(call.properties.elevation).to.equal(8);
    });

    it('sets cornerRadius to value', function() {
      widget.cornerRadius = 4;

      let call = client.calls({op: 'set'})[0];
      expect(call.properties.cornerRadius).to.equal(4);
    });

    ['light', 'dark', 'default'].forEach((value) => {

      it('sets win_theme to valid value', function() {
        widget.win_theme = value;

        let call = client.calls({op: 'set'})[0];
        expect(call.properties.win_theme).to.equal(value);
      });

    });

    it('ignores setting win_theme to invalid value', function() {
      stub(console, 'warn');

      widget.win_theme = 'foo';

      expect(client.calls({op: 'set'}).length).to.equal(0);
    });

    it('returns win_theme default value', function() {
      expect(widget.win_theme).to.equal('default');
    });

    it("support 'initial' for background and font", function() {
      widget.set({background: 'green', font: '23px Arial'});
      client.resetCalls();
      widget.set({background: 'initial', font: 'initial'});

      let call = client.calls({op: 'set'})[0];
      expect(call.properties.background).to.be.null;
      expect(call.properties.font).to.be.null;
    });

    it('stores id property in widget.id', function() {
      widget.id = 'foo';

      expect(widget.id).to.equal('foo');
    });

    it('gets id property from widget.id', function() {
      widget.id = 'foo';

      expect(widget.id).to.equal('foo');
    });

    it('stores class property in widget.classList', function() {
      widget.class = 'foo bar';

      expect(widget.classList).to.eql(['foo', 'bar']);
    });

    it('normalizes class property', function() {
      widget.class = ' foo bar   foobar  ';

      expect(widget.class).to.equal('foo bar foobar');
    });

    it('has default class property value', function() {
      expect(widget.class).to.equal('');
      expect(widget.classList.length).to.equal(0);
    });

    it('can modify class property value', function() {
      widget.classList.push('foo');
      widget.classList.push('bar');

      expect(widget.class).to.equal('foo bar');
    });

    it('returns default initial default values', function() {
      expect(widget.highlightOnTouch).to.be.false;
      expect(widget.enabled).to.be.true;
      expect(widget.visible).to.be.true;
      expect(widget.layoutData).to.be.null;
      expect(widget.elevation).to.equal(0);
      expect(widget.cornerRadius).to.equal(0);
      expect(widget.opacity).to.equal(1);
      expect(widget.transform).to.eql({
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        translationX: 0,
        translationY: 0,
        translationZ: 0
      });
    });

    it('has read-only data object', function() {
      let data = widget.data;
      widget.data = {};

      expect(widget.data.constructor).to.equal(Object);
      expect(widget.data).to.equal(data);
    });

    describe('dispose', function() {

      let parent, child;

      beforeEach(function() {
        parent = new TestWidget();
        child = new TestWidget().appendTo(parent);
        client.resetCalls();
      });

      it('disposes children', function() {
        parent.dispose();

        expect(child.isDisposed()).to.be.true;
      });

      it('removes from parent', function() {
        child.dispose();

        expect(parent.children().toArray()).to.eql([]);
      });

      it('removes parent', function() {
        child.dispose();

        expect(child.parent()).to.be.null;
      });

      it('DESTROYs native widget', function() {
        parent.dispose();

        expect(client.calls({op: 'destroy', id: parent.cid}).length).to.equal(1);
      });

      it('does not DESTROY native children', function() {
        parent.dispose();

        expect(client.calls({op: 'destroy', id: child.cid}).length).to.equal(0);
      });

      it("notifies parent's `removeChild` listener", function() {
        let listener = spy();
        parent.on('removeChild', listener);

        child.dispose();

        expect(listener).to.have.been.calledOnce;
        expect(listener).to.have.been.calledWithMatch({target: parent, child, index: 0});
      });

      it("notifies parent's `removeChild` listener with correct index", function() {
        new TestWidget().insertBefore(child);
        let listener = spy();
        parent.on('removeChild', listener);

        child.dispose();

        expect(listener).to.have.been.calledWithMatch({target: parent, child, index: 1});
      });

      it("notifies all children's dispose listeners", function() {
        let log = [];
        let child2 = new TestWidget().appendTo(parent);
        parent.on('dispose', () => log.push('parent'));
        child.on('dispose', () => log.push('child'));
        child2.on('dispose', () => log.push('child2'));

        parent.dispose();

        expect(log).to.eql(['parent', 'child', 'child2']);
      });

      it("notifies children's dispose listeners recursively", function() {
        let log = [];
        child = new TestWidget().appendTo(parent);
        let grandchild = new TestWidget().appendTo(child);
        parent.on('dispose', () => log.push('parent'));
        child.on('dispose', () => log.push('child'));
        grandchild.on('dispose', () => log.push('grandchild'));

        parent.dispose();

        expect(log).to.eql(['parent', 'child', 'grandchild']);
      });

      describe('when disposed', function() {

        beforeEach(function() {
          widget.dispose();
        });

        it('calling append fails', function() {
          expect(() => {
            widget.append();
          }).to.throw(Error, 'Object is disposed');
        });

        it('calling appendTo fails', function() {
          expect(() => {
            widget.append();
          }).to.throw(Error, 'Object is disposed');
        });

      });

    });

    describe('append', function() {

      let widget, child1, child2, listener, result;

      beforeEach(function() {
        widget = new TestWidget();
        child1 = new TestWidget({id: 'child1'});
        child2 = new TestWidget({id: 'child2'});
        client.resetCalls();
        listener = spy();
      });

      describe('when called with a widget', function() {

        beforeEach(function() {
          widget.on('addChild', listener);
          result = widget.append(child1);
        });

        it("sets the child's parent and calls native `insertChild` method", function() {
          let calls = client.calls();
          expect(calls.length).to.equal(2);
          expect(calls[0]).to.eql({op: 'set', id: child1.cid, properties: {parent: widget.cid}});
          expect(calls[1]).to.eql({op: 'call', id: widget.cid, method: 'insertChild',
            parameters: {child: child1.cid, index: 0}});
        });

        it('returns self to allow chaining', function() {
          expect(result).to.equal(widget);
        });

        it('notifies `addChild` listener with arguments parent, child, event', function() {
          expect(listener).to.have.been.calledOnce;
          expect(listener).to.have.been.calledWithMatch({target: widget, child: child1, index: 0});
        });

        it('children() contains appended child', function() {
          expect(widget.children().toArray()).to.contain(child1);
        });

        it('children() returns a safe copy', function() {
          widget.children()[0] = null;
          expect(widget.children().toArray()).to.deep.contain(child1);
        });

      });

      describe('when called with multiple widgets', function() {

        beforeEach(function() {
          result = widget.append(child1, child2);
        });

        it("sets the children's parent and calls native `insertChild` method", function() {
          let calls = client.calls();
          expect(calls.length).to.equal(4);
          expect(calls[0]).to.eql({op: 'set', id: child1.cid, properties: {parent: widget.cid}});
          expect(calls[1]).to.eql({op: 'call', id: widget.cid, method: 'insertChild',
            parameters: {child: child1.cid, index: 0}});
        });

        it('returns self to allow chaining', function() {
          expect(result).to.equal(widget);
        });

        it('children() contains appended children', function() {
          expect(widget.children().toArray()).to.contain(child1);
          expect(widget.children().toArray()).to.contain(child2);
        });

        it('children() with matcher contains filtered children', function() {
          expect(widget.children('#child1').toArray()).to.eql([child1]);
          expect(widget.children('#child2').toArray()).to.eql([child2]);
        });

      });

      describe('when called with an array of widgets', function() {

        beforeEach(function() {
          result = widget.append([child1, child2]);
        });

        it("sets the widgets' parent and calls native `insertChild` method", function() {
          let calls = client.calls();
          expect(calls.length).to.equal(4);
          expect(calls[0]).to.eql({op: 'set', id: child1.cid, properties: {parent: widget.cid}});
          expect(calls[1]).to.eql({op: 'call', id: widget.cid, method: 'insertChild',
            parameters: {child: child1.cid, index: 0}});
          expect(calls[2]).to.eql({op: 'set', id: child2.cid, properties: {parent: widget.cid}});
          expect(calls[3]).to.eql({op: 'call', id: widget.cid, method: 'insertChild',
            parameters: {child: child2.cid, index: 1}});
        });

        it('adds the widgets to children list', function() {
          expect(widget.children().toArray()).to.eql([child1, child2]);
        });

        it('returns self to allow chaining', function() {
          expect(result).to.equal(widget);
        });

      });

      describe('when called with a widget collection', function() {

        beforeEach(function() {
          result = widget.append(new WidgetCollection([child1, child2]));
        });

        it("sets the widgets' native parent and calls native `insertChild`", function() {
          let calls = client.calls();
          expect(calls.length).to.equal(4);
          expect(calls[0]).to.eql({op: 'set', id: child1.cid, properties: {parent: widget.cid}});
          expect(calls[1]).to.eql({op: 'call', id: widget.cid, method: 'insertChild',
            parameters: {child: child1.cid, index: 0}});
          expect(calls[2]).to.eql({op: 'set', id: child2.cid, properties: {parent: widget.cid}});
          expect(calls[3]).to.eql({op: 'call', id: widget.cid, method: 'insertChild',
            parameters: {child: child2.cid, index: 1}});
        });

        it('adds the widgets to children list', function() {
          expect(widget.children().toArray()).to.eql([child1, child2]);
        });

        it('returns self to allow chaining', function() {
          expect(result).to.equal(widget);
        });

      });

      describe('when called with non-widget', function() {

        it('throws an error', function() {
          expect(() => {
            widget.append({});
          }).to.throw(Error, 'Cannot append non-widget');
        });

      });

      describe('when child is not accepted', function() {

        it('throws an error', function() {
          let child = new TestWidget();
          stub(widget, '_acceptChild').callsFake(() => false);

          expect(() => {
            widget.append(child);
          }).to.throw(Error, 'TestWidget could not be appended to TestWidget');
          expect(widget.children().toArray()).not.to.contain(child);
        });

      });

    });

    describe('appendTo', function() {

      let parent1, result;

      beforeEach(function() {
        parent1 = new TestWidget();
        client.resetCalls();
        result = widget.appendTo(parent1);
      });

      describe('when called with a parent', function() {

        it('returns self to allow chaining', function() {
          expect(result).to.equal(widget);
        });

        it("sets the widget's parent", function() {
          let setCall = client.calls({op: 'set', id: widget.cid})[0];
          expect(setCall.properties.parent).to.eql(parent1.cid);
        });

        it("is added to parent's children list", function() {
          expect(parent1.children().toArray()).to.contain(widget);
        });

      });

      describe('when called with another parent', function() {

        let parent2;

        beforeEach(function() {
          parent2 = new TestWidget();
          widget.appendTo(parent2);
        });

        it("is removed from old parent's children list", function() {
          expect(parent1.children().toArray()).not.to.contain(widget);
        });

        it("is added to new parent's children list", function() {
          expect(parent2.children().toArray()).to.contain(widget);
        });
      });

      describe('when called with a collection', function() {

        let parent1, parent2, result;

        beforeEach(function() {
          parent1 = new TestWidget();
          parent2 = new TestWidget();
          client.resetCalls();
          result = widget.appendTo(new WidgetCollection([parent1, parent2]));
        });

        it('returns self to allow chaining', function() {
          expect(result).to.equal(widget);
        });

        it("first entry is added to parent's children list", function() {
          expect(parent1.children().toArray()).to.contain(widget);
        });

        it("other entry not added to parent's children list", function() {
          expect(parent2.children().toArray()).not.to.contain(widget);
        });

      });

      describe('when called with non-widget', function() {

        it('throws an error', function() {
          expect(() => {
            widget.appendTo({});
          }).to.throw(Error, 'Cannot append to non-widget');
        });

      });

    });

    describe('insertBefore', function() {

      let parent1, parent2, other, listener;

      beforeEach(function() {
        parent1 = new TestWidget();
        parent2 = new TestWidget();
        listener = spy();
      });

      it('throws when disposed', function() {
        expect(() => {
          widget.insertBefore({});
        }).to.throw(Error, 'Cannot insert before non-widget');
      });

      it('throws when called with a non-widget', function() {
        expect(() => {
          widget.insertBefore({});
        }).to.throw(Error, 'Cannot insert before non-widget');
      });

      it('throws when called with an empty widget collection', function() {
        expect(() => {
          widget.insertBefore(parent1.find('.missing'));
        }).to.throw(Error, 'Cannot insert before non-widget');
      });

      it('throws when called with an orphan widget', function() {
        expect(() => {
          widget.insertBefore(new TestWidget());
        }).to.throw(Error, 'Cannot insert before orphan');
      });

      describe('when called with a widget', function() {

        beforeEach(function() {
          widget.appendTo(parent1);
          other = new TestWidget().appendTo(parent2);
        });

        it("removes widget from its old parent's children list", function() {
          widget.insertBefore(other);
          expect(parent1.children().toArray()).not.to.contain(widget);
        });

        it("adds widget to new parent's children list", function() {
          widget.insertBefore(other);
          expect(parent2.children().toArray()).to.contain(widget);
        });

        it('adds widget directly before the given widget', function() {
          widget.insertBefore(other);
          let children = parent2.children();
          expect(children.indexOf(widget)).to.equal(children.indexOf(other) - 1);
        });

        it('triggers remove event with index', function() {
          parent1.on('removeChild', listener);

          widget.insertBefore(other);

          expect(listener).to.have.been.calledWithMatch({target: parent1, child: widget, index: 0});
        });

        it('triggers add event with index', function() {
          parent2.on('addChild', listener);

          widget.insertBefore(other);

          expect(listener).to.have.been.calledWithMatch({target: parent2, child: widget, index: 0});
        });

      });

      describe('when called with a sibling widget', function() {

        beforeEach(function() {
          other = new TestWidget().appendTo(parent1);
          widget.appendTo(parent1);
          widget.insertBefore(other);
        });

        it('re-orders widgets', function() {
          expect(parent1.children().toArray()).to.eql([widget, other]);
        });

      });

      describe('when called with a widget collection', function() {

        beforeEach(function() {
          new TestWidget({class: 'child'}).appendTo(parent1);
          new TestWidget({class: 'child'}).appendTo(parent2);
          let grandparent = new TestWidget().append(parent1, parent2);
          widget.insertBefore(grandparent.find('.child'));
        });

        it('inserts only before the first the widget of the collection', function() {
          expect(parent1.children().toArray()).to.contain(widget);
          expect(parent2.children().toArray()).not.to.contain(widget);
        });

      });

    });

    describe('insertAfter', function() {

      let parent1, parent2, other, listener;

      beforeEach(function() {
        parent1 = new TestWidget();
        parent2 = new TestWidget();
        listener = spy();
      });

      it('throws when disposed', function() {
        widget.dispose();

        expect(() => {
          widget.insertAfter({});
        }).to.throw(Error, 'Object is disposed');
      });

      it('throws when called with a non-widget', function() {
        expect(() => {
          widget.insertAfter({});
        }).to.throw(Error, 'Cannot insert after non-widget');
      });

      it('throws when called with an empty widget collection', function() {
        expect(() => {
          widget.insertAfter(parent1.find('.missing'));
        }).to.throw(Error, 'Cannot insert after non-widget');
      });

      it('throws when called with an orphan widget', function() {
        expect(() => {
          widget.insertAfter(new TestWidget());
        }).to.throw(Error, 'Cannot insert after orphan');
      });

      describe('when called with a widget', function() {

        beforeEach(function() {
          widget.appendTo(parent1);
          other = new TestWidget().appendTo(parent2);
        });

        it("removes widget from its old parent's children list", function() {
          widget.insertAfter(other);
          expect(parent1.children().toArray()).not.to.contain(widget);
        });

        it("adds widget to new parent's children list", function() {
          widget.insertAfter(other);
          expect(parent2.children().toArray()).to.contain(widget);
        });

        it('adds widget directly after the given widget', function() {
          widget.insertAfter(other);
          let children = parent2.children();
          expect(children.indexOf(widget)).to.equal(children.indexOf(other) + 1);
        });

        it('triggers `removeChild` event with index', function() {
          parent1.on('removeChild', listener);

          widget.insertAfter(other);

          expect(listener).to.have.been.calledWithMatch({target: parent1, child: widget, index: 0});
        });

        it('triggers `addChild` event with index', function() {
          parent2.on('addChild', listener);

          widget.insertAfter(other);

          expect(listener).to.have.been.calledWithMatch({target: parent2, child: widget, index: 1});
        });

      });

      describe('when called with a sibling widget', function() {

        beforeEach(function() {
          widget.appendTo(parent1);
          other = new TestWidget().appendTo(parent1);
          widget.insertAfter(other);
        });

        it('re-orders widgets', function() {
          expect(parent1.children().toArray()).to.eql([other, widget]);
        });

      });

      describe('when called with a widget collection', function() {

        beforeEach(function() {
          new TestWidget({class: 'child'}).appendTo(parent1);
          new TestWidget({class: 'child'}).appendTo(parent2);
          let grandparent = new TestWidget().append(parent1, parent2);
          widget.insertAfter(grandparent.find('.child'));
        });

        it('inserts only before the first the widget of the collection', function() {
          expect(parent1.children().toArray()).to.contain(widget);
          expect(parent2.children().toArray()).not.to.contain(widget);
        });

      });

    });

    describe('detach', function() {

      it('throws when disposed', function() {
        widget.dispose();

        expect(() => {
          widget.detach();
        }).to.throw(Error, 'Object is disposed');
      });

      it('removes the widget from its parent', function() {
        let parent = new TestWidget();
        widget.appendTo(parent);

        widget.detach();

        expect(parent.children().toArray()).to.eql([]);
        expect(widget.parent()).to.be.null;
      });

    });

    describe('parent', function() {

      it('returns null by default', function() {
        expect(widget.parent()).to.be.null;
      });

      it('returns the parent when appended', function() {
        let parent = new TestWidget();
        widget.appendTo(parent);
        expect(widget.parent()).to.equal(parent);
      });

    });

    describe('siblings', function() {

      let child1, child2, child3;

      beforeEach(function() {
        child1 = new TestWidget();
        child2 = new TestWidget();
        child3 = new TestWidget();
      });

      it('returns empty collection when called without a parent', function() {
        expect(widget.siblings().toArray()).to.eql([]);
      });

      it('returns empty collection when there are no siblings', function() {
        widget.append(child1);

        expect(child1.siblings().toArray()).to.eql([]);
      });

      it('returns collection with all siblings', function() {
        widget.append(child1, child2, child3);

        expect(child2.siblings().toArray()).to.eql([child1, child3]);
      });

      it('does not include grand children', function() {
        widget.append(child1, child2);
        child2.append(child3);

        expect(child1.siblings().toArray()).to.eql([child2]);
      });

      it('returns filtered list when called with a selector', function() {
        let button1 = new TestWidget({class: 'child'});
        let button2 = new TestWidget({class: 'child'});
        widget.append(child1, button1, child2, button2, child3);

        expect(child1.siblings('.child').toArray()).to.eql([button1, button2]);
      });

    });

    describe('find', function() {

      let child1, child2, child1_1, child1_2, child1_2_1;

      beforeEach(function() {
        child1 = new TestWidget({id: 'foo'}).appendTo(widget);
        child2 = new TestWidget({class: 'bar'}).appendTo(widget);
        child1_1 = new TestWidget({}).appendTo(child1);
        child1_2 = new TestWidget({class: 'bar'}).appendTo(child1);
        child1_2_1 = new TestWidget({id: 'foo'}).appendTo(child1_2);
      });

      it('* selector returns all descendants', function() {
        expect(widget.find('*').toArray()).to.eql([child1, child1_1, child1_2, child1_2_1, child2]);
      });

      it('# selector returns all descendants with given id', function() {
        expect(widget.find('#foo').toArray()).to.eql([child1, child1_2_1]);
      });

      it('. selector returns all descendants with given class', function() {
        expect(widget.find('.bar').toArray()).to.eql([child1_2, child2]);
      });

    });

    describe('apply', function() {

      let child1, child2, child1_1;
      let targets;

      beforeEach(function() {
        child1 = new TestWidget({id: 'foo', class: 'myclass'}).appendTo(widget);
        child2 = new TestWidget({id: 'bar'}).appendTo(widget);
        child1_1 = new TestWidget().appendTo(child1);
        targets = [widget, child1, child2, child1_1];
        targets.forEach((target) => {
          target.set = spy();
        });
      });

      it('returns self', function() {
        expect(widget.apply({})).to.equal(widget);
      });

      it('applies properties to all children', function() {
        let props = {prop1: 'v1', prop2: 'v2'};
        widget.apply({'*': props});

        expect(widget.set).to.have.been.calledWith(props);
        expect(child1.set).to.have.been.calledWith(props);
        expect(child2.set).to.have.been.calledWith(props);
        expect(child1_1.set).to.have.been.calledWith(props);
      });

      it('applies properties to children with specific id', function() {
        widget.apply({'#foo': {prop1: 'v1'}, '#bar': {prop2: 'v2'}});

        expect(widget.set).not.to.have.been.called;
        expect(child1.set).to.have.been.calledWith({prop1: 'v1'});
        expect(child2.set).to.have.been.calledWith({prop2: 'v2'});
        expect(child1_1.set).not.to.have.been.called;
      });

      it('applies properties to children with specific type', function() {
        widget.apply({'.myclass': {prop1: 'v1'}});

        expect(widget.set).not.to.have.been.called;
        expect(child1.set).to.have.been.calledWith({prop1: 'v1'});
        expect(child2.set).not.to.have.been.called;
        expect(child1_1.set).not.to.have.been.called;
      });

      it('applies properties in order *, Type, class, id', function() {
        widget.apply({
          '#foo': {prop1: 'v4'},
          '.myclass': {prop1: 'v3'},
          'TestWidget': {prop1: 'v2'},
          '*': {prop1: 'v1'}
        });

        expect(child1.set.args.map(args => args[0].prop1)).to.eql(['v1', 'v2', 'v3', 'v4']);
      });

      it('does not fail on empty widget', function() {
        expect(() => {
          new TestWidget().apply({foo: {bar: 23}});
        }).not.to.throw();
      });

    });

  });

  describe('get default decoding', function() {

    let widget;

    beforeEach(function() {
      widget = new TestWidget();
      client.resetCalls();
    });

    it('translates background to string', function() {
      stub(client, 'get').returns([170, 255, 0, 128]);

      let result = widget.background;

      expect(result).to.equal('rgba(170, 255, 0, 0.5)');
    });

    it('translates background null to string', function() {
      stub(client, 'get').returns(null);

      let result = widget.background;

      expect(result).to.equal('rgba(0, 0, 0, 0)');
    });

    it('translates bounds to object', function() {
      stub(client, 'get').returns([1, 2, 3, 4]);

      let result = widget.bounds;

      expect(result).to.eql({left: 1, top: 2, width: 3, height: 4});
    });

    it('translates bounds to object', function() {
      stub(client, 'get').returns([1, 2, 3, 4]);

      let result = widget.bounds;

      expect(result).to.eql({left: 1, top: 2, width: 3, height: 4});
    });

    it('translates backgroundImage to object', function() {
      stub(client, 'get').returns(['foo', 23, 42]);

      let result = widget.backgroundImage;

      expect(result).to.eql({src: 'foo', width: 23, height: 42});
    });

  });

  describe('layoutData:', function() {

    let parent, widget, other;

    beforeEach(function() {
      parent = new TestWidget();
      widget = new TestWidget().appendTo(parent);
      other = new TestWidget({id: 'other'}).appendTo(parent);
      client.resetCalls();
    });

    it('return null for undefined layoutData', function() {
      expect(widget.layoutData).to.be.null;
    });

    it('store layoutData property locally', function() {
      widget.layoutData = {top: 10, left: ['#other', 10]};

      expect(widget.layoutData).to.eql({top: 10, left: ['#other', 10]});
    });

    it('getter does not translate selectors', function() {
      widget.layoutData = {top: '#other', left: ['#other', 42]};

      expect(widget.layoutData).to.eql({top: '#other', left: ['#other', 42]});
    });

    it('getter does not translate widgets', function() {
      widget.layoutData = {top: other, left: [other, 42]};

      expect(widget.layoutData).to.eql({top: other, left: [other, 42]});
    });

    it('getter returns normalized percentages in arrays', function() {
      widget.layoutData = {left: '32%', top: [23, 42]};

      expect(widget.layoutData).to.eql({left: '32%', top: ['23%', 42]});
    });

    it('getter returns arrays with zero percentage as plain offset', function() {
      widget.layoutData = {left: '32%', top: [0, 42]};

      expect(widget.layoutData).to.eql({left: '32%', top: 42});
    });

    it('getter normalizes arrays with zero offset', function() {
      widget.layoutData = {left: ['#other', 0], top: [33, 0]};

      expect(widget.layoutData).to.eql({left: '#other', top: '33%'});
    });

    it('getter replaces zero percentage', function() {
      widget.layoutData = {left: '0%', top: ['0%', 23]};

      expect(widget.layoutData).to.eql({left: 0, top: 23});
    });

    it('SET layoutData after widget referenced by selector is added to parent', function() {
      other.dispose();
      widget.layoutData = {left: 23, baseline: '#other', right: ['#other', 42]};
      other = new TestWidget({id: 'other'}).appendTo(parent);

      let call = client.calls({op: 'set', id: widget.cid})[0];
      let expected = {left: 23, baseline: other.cid, right: [other.cid, 42]};
      expect(call.properties.layoutData).to.eql(expected);
    });

    it('SET layoutData after self is added to parent', function() {
      widget = new TestWidget();

      widget.layoutData = {left: 23, baseline: '#other', right: ['#other', 42]};
      widget.appendTo(parent);

      let call = client.calls({op: 'create'})[0];
      let expected = {left: 23, baseline: other.cid, right: [other.cid, 42]};
      expect(call.properties.layoutData).to.eql(expected);
    });

    it('SET preliminary layoutData if selector does not resolve in flush', function() {
      widget.layoutData = {left: 23, baseline: '#mother', right: ['other', 42]};

      let call = client.calls({op: 'set'})[0];
      let expected = {left: 23, baseline: 0, right: [0, 42]};
      expect(call.properties.layoutData).to.eql(expected);
    });

    it('SET layoutData again when selector resolves by adding sibling', function() {
      other.dispose();
      widget.layoutData = {right: '#other'};
      client.resetCalls();

      other = new TestWidget({id: 'other'}).appendTo(parent);

      let setCalls = client.calls({op: 'set'});
      expect(setCalls.length).to.equal(1);
      expect(setCalls[0].properties.layoutData).to.eql({right: [other.cid, 0]});
    });

    it('SET layoutData again when selector resolves by setting parent', function() {
      widget = new TestWidget();
      widget.appendTo(new TestWidget());
      widget.layoutData = {right: '#other'};
      client.resetCalls();

      widget.appendTo(parent);

      let setCalls = client.calls({op: 'set'});
      expect(setCalls.length).to.equal(2);
      expect(setCalls[1].properties.layoutData).to.eql({right: [other.cid, 0]});
    });

  });

  describe('layout attributes', function() {

    let parent, widget, other;

    beforeEach(function() {
      parent = new TestWidget();
      other = new TestWidget({id: 'other'}).appendTo(parent);
      widget = new TestWidget().appendTo(parent);
      client.resetCalls();
    });

    ['left', 'right', 'top', 'bottom'].forEach((attr) => {

      it('modifies layoutData', function() {
        widget.set(attr, ['#other', 10]);

        expect(widget.layoutData[attr]).to.eql(['#other', 10]);
      });

      it('resets layoutData properties', function() {
        let layoutData = {left: 1, right: 2, top: 3, bottom: 4};
        widget.layoutData = layoutData;
        widget.set(attr, null);

        expect(widget.layoutData).to.eql(omit(layoutData, attr));
      });

      it('getter does not translate selectors', function() {
        widget.set(attr, ['#other', 10]);

        expect(widget.get(attr)).to.eql(['#other', 10]);
      });

      it('getter does not translate widgets', function() {
        widget.set(attr, [other, 42]);

        expect(widget.get(attr)).to.eql([other, 42]);
      });

      it('getter returns normalized percentages in arrays', function() {
        widget.set(attr, [23, 42]);

        expect(widget.get(attr)).to.eql(['23%', 42]);
      });

      it('getter returns arrays with zero percentage as plain offset', function() {
        widget.set(attr, [0, 42]);

        expect(widget.get(attr)).to.equal(42);
      });

      it('getter returns offset 0 as plain 0', function() {
        widget.set(attr, 0);

        expect(widget.get(attr)).to.equal(0);
      });

      it('getter normalizes arrays with zero offset', function() {
        widget.set(attr, ['#other', 0]);

        expect(widget.get(attr)).to.equal('#other');
      });

      it('SETs layoutData', function() {
        widget.set(attr, 23);

        let call = client.calls({op: 'set'})[0];
        let expected = {};
        expected[attr] = 23;
        expect(call.properties.layoutData).to.eql(expected);
      });

    });

    ['width', 'height', 'centerX', 'centerY'].forEach((attr) => {

      it('modifies layoutData', function() {
        widget.set(attr, 23);

        expect(widget.layoutData[attr]).to.equal(23);
      });

      it('resets layoutData properties', function() {
        let layoutData = {centerX: 0, centerY: 0, width: 100, height: 200};
        widget.layoutData = layoutData;
        widget.set(attr, null);

        expect(widget.layoutData).to.eql(omit(layoutData, attr));
      });

      it('SETs layoutData', function() {
        widget.set(attr, 23);

        let call = client.calls({op: 'set'})[0];
        let expected = {};
        expected[attr] = 23;
        expect(call.properties.layoutData).to.eql(expected);
      });

    });

    it('contradicting attributes can be set temporarily without warning', function() {
      stub(console, 'warn');

      widget.left = 10;
      widget.width = 10;
      widget.right = 10;
      widget.left = null;

      let call = client.calls({op: 'set'})[0];
      let expected = {right: 10, width: 10};
      expect(call.properties.layoutData).to.eql(expected);
      expect(console.warn).not.to.have.been.called;
    });

    it('contradicting attributes will be warned against on flush', function() {
      stub(console, 'warn');

      widget.left = 10;
      widget.width = 10;
      widget.right = 10;

      let call = client.calls({op: 'set'})[0];
      let expected = {right: 10, left: 10};
      expect(call.properties.layoutData).to.eql(expected);
      expect(console.warn).to.have.been.called;
    });

  });

  describe('flushLayout', function() {

    let parent, child;

    beforeEach(function() {
      parent = new TestWidget();
      Layout.flushQueue();
    });

    it('calls renderLayoutData on children', function() {
      child = new TestWidget({
        layoutData: {left: 23, top: 42}
      }).appendTo(parent);
      client.resetCalls();

      parent._flushLayout();

      let call = client.calls({op: 'set', id: child.cid})[0];
      expect(call.properties.layoutData).to.eql({left: 23, top: 42});
    });

    it('does not fail when there are no children', function() {
      expect(() => {
        parent._flushLayout();
      }).not.to.throw();
    });

    it('is triggered by appending a child', function() {
      spy(parent, '_flushLayout');
      child = new TestWidget();

      child.appendTo(parent);
      Layout.flushQueue();

      expect(parent._flushLayout).to.have.been.called;
    });

    it('is triggered by re-parenting a child', function() {
      let parent2 = new TestWidget();
      child = new TestWidget().appendTo(parent);
      spy(parent, '_flushLayout');
      spy(parent2, '_flushLayout');

      child.appendTo(parent2);
      Layout.flushQueue();

      expect(parent._flushLayout).to.have.been.called;
    });

    it('is triggered by disposing of a child', function() {
      child = new TestWidget().appendTo(parent);
      spy(parent, '_flushLayout');

      child.dispose();
      Layout.flushQueue();

      expect(parent._flushLayout).to.have.been.called;
    });

  });

  describe('native events:', function() {

    let listener, widget;

    function checkListen(event) {
      let listen = client.calls({op: 'listen', id: widget.cid});
      expect(listen.length).to.equal(1);
      expect(listen[0].event).to.equal(event);
      expect(listen[0].listen).to.be.true;
    }

    beforeEach(function() {
      listener = spy();
    });

    it('boundsChanged', function() {
      widget = new TestWidget().on('boundsChanged', listener);

      widget._trigger('resize', {bounds: [1, 2, 3, 4]});

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: widget, value: {left: 1, top: 2, width: 3, height: 4}});
      checkListen('resize');
    });

    it('resize', function() {
      widget = new TestWidget().on('resize', listener);

      widget._trigger('resize', {bounds: [1, 2, 3, 4]});

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: widget, left: 1, top: 2, width: 3, height: 4});
      checkListen('resize');
    });

    ['touchStart', 'touchMove', 'touchEnd', 'touchCancel'].forEach(name => {
      it(name, function() {
        widget = new TestWidget().on(name, listener);

        widget._trigger(name, {});

        expect(listener).to.have.been.calledOnce;
        expect(listener).to.have.been.calledWithMatch({target: widget});
        checkListen(name);
      });
    });


  });

});
