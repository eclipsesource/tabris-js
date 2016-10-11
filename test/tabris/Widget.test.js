import {expect, spy, stub, restore} from '../test';
import WidgetCollection from '../../src/tabris/WidgetCollection';
import ProxyStore from '../../src/tabris/ProxyStore';
import Layout from '../../src/tabris/Layout';
import NativeBridge from '../../src/tabris/NativeBridge';
import ClientStub from './ClientStub';
import Widget from '../../src/tabris/Widget';
import {extend, omit} from '../../src/tabris/util';

describe('Widget', function() {

  let client;
  let TestWidget;

  beforeEach(function() {
    client = new ClientStub();
    global.tabris = {
      on: () => {},
      _proxies: new ProxyStore(),
      device: {platform: 'Android', version: 18}
    };
    global.tabris._nativeBridge = new NativeBridge(client);
    TestWidget = Widget.extend({
      _name: 'TestWidget',
      _supportsChildren: true
    });
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

    it('translates textColor and background colors to arrays', function() {
      widget.set({textColor: 'red', background: 'rgba(1, 2, 3, 0.5)'});

      let call = client.calls({op: 'set'})[0];
      expect(call.properties.foreground).to.eql([255, 0, 0, 255]);
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

      expect(widget.get('font')).to.eql('italic bold 12px Arial');
    });

    it("returns 'initial' when no value is cached", function() {
      spy(client, 'get');

      expect(widget.get('font')).to.eql('initial');
      expect(client.get).not.to.have.been.called;
    });

    it('translates backgroundImage to array', function() {
      widget.set({backgroundImage: {src: 'bar', width: 23, height: 42}});

      let call = client.calls({op: 'set'})[0];
      expect(call.properties.backgroundImage).to.eql(['bar', 23, 42, null]);
    });

    it('prints warning when attempting to set bounds', function() {
      spy(console, 'warn');
      widget.set('bounds', {left: 1, top: 2, width: 3, height: 4});

      expect(client.calls({op: 'set'}).length).to.equal(0);
      expect(console.warn).to.have.been.calledWith(
        'TestWidget: Can not set read-only property "bounds".'
      );
    });

    it('sets elevation to value', function() {
      widget.set('elevation', 8);

      let call = client.calls({op: 'set'})[0];
      expect(call.properties.elevation).to.equal(8);
    });

    it('sets cornerRadius to value', function() {
      widget.set('cornerRadius', 4);

      let call = client.calls({op: 'set'})[0];
      expect(call.properties.cornerRadius).to.equal(4);
    });

    ['light', 'dark', 'default'].forEach((value) => {

      it('sets win_theme to valid value', function() {
        widget.set('win_theme', value);

        let call = client.calls({op: 'set'})[0];
        expect(call.properties.win_theme).to.equal(value);
      });

    });

    it('ignores setting win_theme to invalid value', function() {
      spy(console, 'warn');
      widget.set('win_theme', 'foo');

      expect(client.calls({op: 'set'}).length).to.equal(0);
    });

    it('returns win_theme default value', function() {
      expect(widget.get('win_theme')).to.equal('default');
    });

    it("support 'initial' for textColor, background and font", function() {
      widget.set({textColor: 'red', background: 'green', font: '23px Arial'});
      client.resetCalls();
      widget.set({textColor: 'initial', background: 'initial', font: 'initial'});

      let call = client.calls({op: 'set'})[0];
      expect(call.properties.foreground).to.be.null;
      expect(call.properties.background).to.be.null;
      expect(call.properties.font).to.be.null;
    });

    it('stores id property in widget.id', function() {
      widget.set('id', 'foo');

      expect(widget.id).to.equal('foo');
    });

    it('gets id property from widget.id', function() {
      widget.set('id', 'foo');

      expect(widget.get('id')).to.equal('foo');
    });

    it('stores class property in widget.classList', function() {
      widget.set('class', 'foo bar');

      expect(widget.classList).to.eql(['foo', 'bar']);
    });

    it('normalizes class property', function() {
      widget.set('class', ' foo bar   foobar  ');

      expect(widget.get('class')).to.equal('foo bar foobar');
    });

    it('has default class property value', function() {
      expect(widget.get('class')).to.equal('');
      expect(widget.classList.length).to.equal(0);
    });

    it('can modify class property value', function() {
      widget.classList.push('foo');
      widget.classList.push('bar');

      expect(widget.get('class')).to.equal('foo bar');
    });

    it('returns default initial default values', function() {
      expect(widget.get('highlightOnTouch')).to.be.false;
      expect(widget.get('enabled')).to.be.true;
      expect(widget.get('visible')).to.be.true;
      expect(widget.get('layoutData')).to.be.null;
      expect(widget.get('elevation')).to.equal(0);
      expect(widget.get('cornerRadius')).to.equal(0);
      expect(widget.get('opacity')).to.equal(1);
      expect(widget.get('transform')).to.eql({
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        translationX: 0,
        translationY: 0,
        translationZ: 0
      });
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

        expect(child.parent()).to.be.undefined;
      });

      it('DESTROYs native widget', function() {
        parent.dispose();

        expect(client.calls({op: 'destroy', id: parent.cid}).length).to.equal(1);
      });

      it('does not DESTROY native children', function() {
        parent.dispose();

        expect(client.calls({op: 'destroy', id: child.cid}).length).to.equal(0);
      });

      it("notifies parent's remove listeners", function() {
        let listener = spy();
        parent.on('removechild', listener);

        child.dispose();

        let args = listener.args[0];
        expect(args[0]).to.equal(parent);
        expect(args[1]).to.equal(child);
        expect(args[2]).to.eql({index: 0});
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
          widget.on('addchild', listener);
          result = widget.append(child1);
        });

        it("sets the child's parent", function() {
          let calls = client.calls();
          expect(calls.length).to.equal(1);
          expect(calls[0]).to.eql({op: 'set', id: child1.cid, properties: {parent: widget.cid}});
        });

        it('returns self to allow chaining', function() {
          expect(result).to.equal(widget);
        });

        it('notifies add listeners with arguments parent, child, event', function() {
          let args = listener.args[0];
          expect(args[0]).to.equal(widget);
          expect(args[1]).to.equal(child1);
          expect(args[2]).to.eql({});
        });

        it('children() contains appended child', function() {
          expect(widget.children().toArray()).to.contain(child1);
        });

        it('children() returns a safe copy', function() {
          widget.children()[0] = null;
          expect(widget.children().toArray()).to.deep.contain(child1);
        });

      });

      describe('when called with multiple proxies', function() {

        beforeEach(function() {
          result = widget.append(child1, child2);
        });

        it("sets the children's parent", function() {
          let calls = client.calls();
          expect(calls.length).to.equal(2);
          expect(calls[1]).to.eql({op: 'set', id: child2.cid, properties: {parent: widget.cid}});
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

        it("sets the widgets' parent", function() {
          let calls = client.calls();
          expect(calls.length).to.equal(2);
          expect(calls[0]).to.eql({op: 'set', id: child1.cid, properties: {parent: widget.cid}});
          expect(calls[1]).to.eql({op: 'set', id: child2.cid, properties: {parent: widget.cid}});
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

        it("sets the widgets' parent", function() {
          let calls = client.calls();
          expect(calls.length).to.equal(2);
          expect(calls[0]).to.eql({op: 'set', id: child1.cid, properties: {parent: widget.cid}});
          expect(calls[1]).to.eql({op: 'set', id: child2.cid, properties: {parent: widget.cid}});
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

      describe('when children are not supported', function() {

        it('throws an error', function() {
          TestWidget._supportsChildren = false;
          let child = new TestWidget();

          expect(() => {
            widget.append(child);
          }).to.throw(Error, 'TestWidget cannot contain children');
          expect(widget.children().toArray()).not.to.contain(child);
        });

      });

      describe('when called with children of unsupported type', function() {

        it('logs an error', function() {
          TestWidget._supportsChildren = () => false;
          let child = new TestWidget();

          expect(() => {
            widget.append(child);
          }).to.throw(Error, 'TestWidget cannot contain children of type TestWidget');
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

        it('parent() returns new parent', function() {
          expect(result.parent()).to.equal(parent1);
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

      let parent1, parent2, other;

      beforeEach(function() {
        parent1 = new TestWidget();
        parent2 = new TestWidget();
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

      describe('when called with a widget', function() {

        beforeEach(function() {
          widget.appendTo(parent1);
          other = new TestWidget().appendTo(parent2);
          widget.insertBefore(other);
        });

        it("removes widget from its old parent's children list", function() {
          expect(parent1.children().toArray()).not.to.contain(widget);
        });

        it("adds widget to new parent's children list", function() {
          expect(parent2.children().toArray()).to.contain(widget);
        });

        it('adds widget directly before the given widget', function() {
          let children = parent2.children();
          expect(children.indexOf(widget)).to.equal(children.indexOf(other) - 1);
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

      let parent1, parent2, other;

      beforeEach(function() {
        parent1 = new TestWidget();
        parent2 = new TestWidget();
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

      describe('when called with a widget', function() {

        beforeEach(function() {
          widget.appendTo(parent1);
          other = new TestWidget().appendTo(parent2);
          widget.insertAfter(other);
        });

        it("removes widget from its old parent's children list", function() {
          expect(parent1.children().toArray()).not.to.contain(widget);
        });

        it("adds widget to new parent's children list", function() {
          expect(parent2.children().toArray()).to.contain(widget);
        });

        it('adds widget directly after the given widget', function() {
          let children = parent2.children();
          expect(children.indexOf(widget)).to.equal(children.indexOf(other) + 1);
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

    });

  });

  describe('get default decoding', function() {

    let widget;

    beforeEach(function() {
      widget = new TestWidget();
      client.resetCalls();
    });

    it('translates textColor to string', function() {
      stub(client, 'get').returns([170, 255, 0, 128]);

      let result = widget.get('textColor');

      expect(result).to.equal('rgba(170, 255, 0, 0.5)');
    });

    it('translates background to string', function() {
      stub(client, 'get').returns([170, 255, 0, 128]);

      let result = widget.get('background');

      expect(result).to.equal('rgba(170, 255, 0, 0.5)');
    });

    it('translates background null to string', function() {
      stub(client, 'get').returns(null);

      let result = widget.get('background');

      expect(result).to.equal('rgba(0, 0, 0, 0)');
    });

    it('translates bounds to object', function() {
      stub(client, 'get').returns([1, 2, 3, 4]);

      let result = widget.get('bounds');

      expect(result).to.eql({left: 1, top: 2, width: 3, height: 4});
    });

    it('translates bounds to object', function() {
      stub(client, 'get').returns([1, 2, 3, 4]);

      let result = widget.get('bounds');

      expect(result).to.eql({left: 1, top: 2, width: 3, height: 4});
    });

    it('translates backgroundImage to object', function() {
      stub(client, 'get').returns(['foo', 23, 42]);

      let result = widget.get('backgroundImage');

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
      expect(widget.get('layoutData')).to.be.null;
    });

    it('store layoutData property locally', function() {
      widget.set('layoutData', {top: 10, left: ['#other', 10]});

      expect(widget.get('layoutData')).to.eql({top: 10, left: ['#other', 10]});
    });

    it('getter does not translate selectors', function() {
      widget.set('layoutData', {top: '#other', left: ['#other', 42]});

      expect(widget.get('layoutData')).to.eql({top: '#other', left: ['#other', 42]});
    });

    it('getter does not translate widgets', function() {
      widget.set('layoutData', {top: other, left: [other, 42]});

      expect(widget.get('layoutData')).to.eql({top: other, left: [other, 42]});
    });

    it('getter returns normalized percentages in arrays', function() {
      widget.set('layoutData', {left: '32%', top: [23, 42]});

      expect(widget.get('layoutData')).to.eql({left: '32%', top: ['23%', 42]});
    });

    it('getter returns arrays with zero percentage as plain offset', function() {
      widget.set('layoutData', {left: '32%', top: [0, 42]});

      expect(widget.get('layoutData')).to.eql({left: '32%', top: 42});
    });

    it('getter normalizes arrays with zero offset', function() {
      widget.set('layoutData', {left: ['#other', 0], top: [33, 0]});

      expect(widget.get('layoutData')).to.eql({left: '#other', top: '33%'});
    });

    it('getter replaces zero percentage', function() {
      widget.set('layoutData', {left: '0%', top: ['0%', 23]});

      expect(widget.get('layoutData')).to.eql({left: 0, top: 23});
    });

    it('SET layoutData after widget referenced by selector is added to parent', function() {
      other.dispose();
      widget.set('layoutData', {left: 23, baseline: '#other', right: ['#other', 42]});
      other = new TestWidget({id: 'other'}).appendTo(parent);

      let call = client.calls({op: 'set', id: widget.cid})[0];
      let expected = {left: 23, baseline: other.cid, right: [other.cid, 42]};
      expect(call.properties.layoutData).to.eql(expected);
    });

    it('SET layoutData after self is added to parent', function() {
      widget = new TestWidget();

      widget.set('layoutData', {left: 23, baseline: '#other', right: ['#other', 42]});
      widget.appendTo(parent);

      let call = client.calls({op: 'create'})[0];
      let expected = {left: 23, baseline: other.cid, right: [other.cid, 42]};
      expect(call.properties.layoutData).to.eql(expected);
    });

    it('SET preliminary layoutData if selector does not resolve in flush', function() {
      widget.set('layoutData', {left: 23, baseline: '#mother', right: ['other', 42]});

      let call = client.calls({op: 'set'})[0];
      let expected = {left: 23, baseline: 0, right: [0, 42]};
      expect(call.properties.layoutData).to.eql(expected);
    });

    it('SET layoutData again until selector resolves by adding sibling', function() {
      other.dispose();

      widget.set('layoutData', {right: '#other'});
      let withoutSibling = client.calls({op: 'set'});
      let retry = client.calls({op: 'set'});
      other = new TestWidget({id: 'other'}).appendTo(parent);
      let withSibling = client.calls({op: 'set'});
      let noRetry = client.calls({op: 'set'});

      expect(withoutSibling.length).to.equal(1);
      expect(retry.length).to.equal(1);
      expect(withSibling.length).to.equal(2);
      expect(noRetry.length).to.equal(2);
      expect(withoutSibling[0].properties.layoutData).to.eql({right: [0, 0]});
      expect(withSibling[1].properties.layoutData).to.eql({right: [other.cid, 0]});
    });

    it('SET layoutData again until selector resolves by setting parent', function() {
      widget = new TestWidget();
      let oldParent = new TestWidget();
      widget.appendTo(oldParent);
      client.resetCalls();

      widget.set('layoutData', {right: '#other'});
      let withoutParent = client.calls({op: 'set'});
      let retry = client.calls({op: 'set'});
      widget.appendTo(parent);
      let withParent = client.calls({op: 'set'});
      let noRetry = client.calls({op: 'set'});

      expect(withoutParent.length).to.equal(1);
      expect(retry.length).to.equal(1);
      expect(withParent.length).to.equal(2);
      expect(noRetry.length).to.equal(2);
      expect(withoutParent[0].properties.layoutData).to.eql({right: [0, 0]});
      expect(withParent[1].properties.layoutData).to.eql({right: [other.cid, 0]});
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

        expect(widget.get('layoutData')[attr]).to.eql(['#other', 10]);
      });

      it('resets layoutData properties', function() {
        let layoutData = {left: 1, right: 2, top: 3, bottom: 4};
        widget.set('layoutData', layoutData);
        widget.set(attr, null);

        expect(widget.get('layoutData')).to.eql(omit(layoutData, attr));
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

        expect(widget.get('layoutData')[attr]).to.equal(23);
      });

      it('resets layoutData properties', function() {
        let layoutData = {centerX: 0, centerY: 0, width: 100, height: 200};
        widget.set('layoutData', layoutData);
        widget.set(attr, null);

        expect(widget.get('layoutData')).to.eql(omit(layoutData, attr));
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
      spy(console, 'warn');

      widget.set('left', 10).set('width', 10).set('right', 10).set('left', null);

      let call = client.calls({op: 'set'})[0];
      let expected = {right: 10, width: 10};
      expect(call.properties.layoutData).to.eql(expected);
      expect(console.warn).not.to.have.been.called;
    });

    it('contradicting attributes will be warned against on flush', function() {
      spy(console, 'warn');

      widget.set('left', 10).set('width', 10).set('right', 10);

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

    it('change:bounds', function() {
      widget = new TestWidget().on('change:bounds', listener);

      widget._trigger('resize', {bounds: [1, 2, 3, 4]});

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWith(widget, {left: 1, top: 2, width: 3, height: 4});
      checkListen('resize');
    });

    it('resize', function() {
      widget = new TestWidget().on('resize', listener);

      widget._trigger('resize', {bounds: [1, 2, 3, 4]});

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWith(widget, {left: 1, top: 2, width: 3, height: 4});
      checkListen('resize');
    });

  });

});

describe('Widget.extend', function() {

  it('adds default events copy', function() {
    let TestWidget = Widget.extend({});

    expect(TestWidget._events.resize).to.be.instanceof(Object);
    expect(TestWidget._events).not.to.equal(Widget.extend._defaultEvents);
  });

  it('extends default events', function() {
    let custom = {foo: {name: 'bar'}, touchstart: {name: 'touchstart'}};

    let TestWidget = Widget.extend({_events: custom});

    expect(TestWidget._events).to.eql(
      extend({}, TestWidget._events, custom)
    );
  });

  it('adds custom properties', function() {
    let TestWidget = Widget.extend({_properties: {foo: {type: 'number'}}});

    expect(TestWidget._properties.foo).not.to.be.undefined;
    expect(TestWidget._properties.foo.type.encode('23')).to.equal(23);
  });

  it('adds default properties', function() {
    let TestWidget = Widget.extend({});

    expect(TestWidget._properties.enabled).not.to.be.undefined;
    expect(TestWidget._properties.visible).not.to.be.undefined;
  });

  it('extends default properties', function() {
    let custom = {foo: 'any', enabled: {type: 'number'}};

    let TestWidget = Widget.extend({_properties: custom});

    expect(TestWidget._properties.foo).not.to.be.undefined;
    expect(TestWidget._properties.enabled.type.encode('23')).to.equal(23);
  });

  it('created widgets are instanceof Widget', function() {
    let TestWidget = Widget.extend({});

    let instance = new TestWidget();

    expect(instance).to.be.instanceof(Widget);
  });

});
