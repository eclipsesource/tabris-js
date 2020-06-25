import {expect, mockTabris, restore, spy, stub} from '../../test';
import WidgetCollection from '../../../src/tabris/WidgetCollection';
import Layout, {LayoutQueue, ConstraintLayout} from '../../../src/tabris/Layout';
import ClientMock from '../ClientMock';
import Widget from '../../../src/tabris/Widget';
import Composite from '../../../src/tabris/widgets/Composite';
import TextView from '../../../src/tabris/widgets/TextView';
import RadioButton from '../../../src/tabris/widgets/RadioButton';
import Button from '../../../src/tabris/widgets/Button';
import CheckBox from '../../../src/tabris/widgets/CheckBox';
import ToggleButton from '../../../src/tabris/widgets/ToggleButton';
import TextInput from '../../../src/tabris/widgets/TextInput';
import {omit} from '../../../src/tabris/util';
import LayoutData from '../../../src/tabris/LayoutData';
import Constraint from '../../../src/tabris/Constraint';
import {toXML} from '../../../src/tabris/Console';
import Font from '../../../src/tabris/Font';

describe('Widget', function() {

  class TestWidget extends Composite {

    constructor(props) {
      super(Object.assign({layout: null}, props));
    }

    get _nativeType() {
      return 'TestWidget';
    }
  }

  /** @type {ClientMock} */
  let client;

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
  });

  afterEach(restore);

  describe('constructor', function() {

    it('prevents instantiation', function() {
      expect(() => {
        new Widget();
      }).to.throw(Error, 'Can not create instance of abstract class Widget');
    });

    it('prevents overriding children with non-function', function() {
      expect(() => {
        new TestWidget({children: []});
      }).to.throw(Error, 'You may not override children with a non-function');
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

    it('translates background color to a color shader', function() {
      widget.set({background: 'rgba(1, 2, 3, 0.5)'});

      const call = client.calls({op: 'set'})[0];
      expect(call.properties.background).to.eql({type: 'color', color: ([1, 2, 3, 128])});
    });

    it('SETs equal background colors only once', function() {
      widget.set({background: 'rgba(1, 2, 3, 0.5)'});
      tabris.flush();
      widget.set({background: 'rgba(1, 2, 3, 0.5)'});

      expect(client.calls({op: 'set'}).length).to.equal(1);
    });

    it('SETs equal padding only once', function() {
      widget.set({padding: 2});
      tabris.flush();
      widget.set({padding: 2});

      expect(client.calls({op: 'set'}).length).to.equal(1);
      expect(client.calls({op: 'set'})[0].properties.padding).to.deep.equal({
        left: 2, top: 2, right: 2, bottom: 2
      });
    });

    it('SETs equal transform only once', function() {
      widget.set({transform: {scaleX: 2, scaleY: 3}});
      tabris.flush();
      widget.set({transform: {scaleX: 2, scaleY: 3}});

      expect(client.calls({op: 'set'}).length).to.equal(1);
      expect(client.calls({op: 'set'})[0].properties.transform).to.deep.equal({
        rotation: 0, scaleX: 2, scaleY: 3, translationX: 0, translationY: 0, translationZ: 0
      });
    });

    it('SETs non-equal background color', function() {
      widget.set({background: 'rgba(1, 2, 3, 0.5)'});
      tabris.flush();
      widget.set({background: 'rgba(1, 2, 3, 0.3)'});

      expect(client.calls({op: 'set'}).length).to.equal(2);
    });

    [TextView, RadioButton, CheckBox, ToggleButton, TextInput].forEach((type) => {

      describe(type.name + ' font', function() {

        beforeEach(function() {
          widget = new type();
          client.resetCalls();
        });

        it('converts font string to Font instance', function() {
          widget.set({font: '12px Arial'});

          expect(widget.font).to.be.instanceOf(Font);
          expect(widget.font.size).to.equal(12);
        });

        it('encodes font string', function() {
          widget.set({font: '12px Arial'});

          const call = client.calls({op: 'set'})[0];
          expect(call.properties.font)
            .to.eql({family: ['Arial'], size: 12, style: 'normal', weight: 'normal'});
        });

        it('support setting initial \'initial\'', function() {
          widget.set({font: '23px Arial'});
          client.resetCalls();
          widget.set({font: 'initial'});

          const call = client.calls({op: 'set'})[0];
          expect(call.properties.font).to.be.null;
        });

        it('returns \'initial\' when no font value is cached', function() {
          spy(client, 'get');

          expect(widget.font).to.eql('initial');
          expect(client.get).not.to.have.been.called;
        });

        it('SETs equal font only once', function() {
          widget.set({font: '12px Arial'});
          tabris.flush();
          widget.set({font: '12px Arial'});

          expect(client.calls({op: 'set'}).length).to.equal(1);
        });

      });

    });

    it('translates background to image shader', function() {
      widget.set({background: {src: 'bar', width: 23, height: 42}});

      const call = client.calls({op: 'set'})[0];
      expect(call.properties.background).to.deep.equal({
        type: 'image',
        image: {
          type: 'uri',
          src: 'bar',
          width: 23, height: 42, scale: null
        }
      });
    });

    it('SETs equal background gradients only once', function() {
      widget.set({background: {src: 'bar', width: 23, height: 42}});
      tabris.flush();
      widget.set({background: {src: 'bar', width: 23, height: 42}});

      expect(client.calls({op: 'set'}).length).to.equal(1);
    });

    it('decodes bounds', function() {
      client.properties(widget.cid).bounds = [0, 1, 2, 3];
      expect(widget.bounds).to.deep.equal({left: 0, top: 1, width: 2, height: 3});
    });

    it('decodes absoluteBounds', function() {
      client.properties(widget.cid).absoluteBounds = [0, 1, 2, 3];
      expect(widget.absoluteBounds).to.deep.equal({left: 0, top: 1, width: 2, height: 3});
    });

    it('prints warning when attempting to set bounds', function() {
      stub(console, 'warn');

      widget.bounds = {left: 1, top: 2, width: 3, height: 4};

      expect(client.calls({op: 'set'}).length).to.equal(0);
      expect(console.warn).to.have.been.calledWithMatch('Can not set read-only property "bounds"');
    });

    it('sets elevation to value', function() {
      widget.elevation = 8;

      const call = client.calls({op: 'set'})[0];
      expect(call.properties.elevation).to.equal(8);
    });

    it('sets cornerRadius to value', function() {
      widget.cornerRadius = 4;

      const call = client.calls({op: 'set'})[0];
      expect(call.properties.cornerRadius).to.equal(4);
    });

    it('support \'initial\' for background', function() {
      widget.set({background: 'green'});
      client.resetCalls();
      widget.set({background: 'initial'});

      const call = client.calls({op: 'set'})[0];
      expect(call.properties.background).to.be.null;
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
      expect(widget.layoutData).to.deep.equal(new LayoutData({}));
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

    it('has initial data object', function() {
      expect(widget.data.constructor).to.equal(Object);
    });

    it('data object can be replaced', function() {
      const data = {};
      widget.data = data;

      expect(widget.data).to.equal(data);
    });

    it('data can only be an object', function() {
      expect(() => widget.data = 23).to.throw(TypeError);
    });

    it('can be set to null', function() {
      widget.data = null;

      expect(widget.data).to.be.null;
    });

    it('data object can be replaced twice', function() {
      const data = {};
      widget.data = {};

      widget.data = data;

      expect(widget.data).to.equal(data);
    });

    it('data fires change events', function() {
      const listener = spy();
      widget.onDataChanged(listener);
      const data = {};

      widget.data = data;

      expect(listener).to.have.been.calledOnce;
      expect(listener.args[0][0].value).to.equal(data);
    });

    it('data is undefined after dispose', function() {
      widget.dispose();

      expect(widget.data).to.be.undefined;
    });

    describe('toXML', function() {

      let parent, child, child2;

      const bounds = 'bounds=\'{left: 0, top: 1, width: 2, height: 3}\'';

      beforeEach(function() {
        parent = new TestWidget();
        child = new Composite();
        child2 = new Button();
        stub(client, 'get').returns([0, 1, 2, 3]);
      });

      it('prints xml element', function() {
        expect(widget[toXML]()).to.be.equal(
          `<TestWidget cid='${widget.cid}' ${bounds}/>`
        );
      });

      it('prints xml element with id if given', function() {
        parent.id = 'test-id';
        expect(parent[toXML]()).to.be.equal(`<TestWidget cid='${parent.cid}' id='${parent.id}' ${bounds}/>`);
      });

      it('prints xml element with class if given', function() {
        parent.class = 'test-class';
        expect(parent[toXML]()).to.be.equal(`<TestWidget cid='${parent.cid}' class='${parent.class}' ${bounds}/>`);
      });

      it('prints xml element with both id and class', function() {
        parent.id = 'test-id';
        parent.class = 'test-class';
        expect(parent[toXML]()).to.be.equal(
          `<TestWidget cid='${parent.cid}' id='${parent.id}' class='${parent.class}' ${bounds}/>`
        );
      });

      it('prints xml element with visible and enabled', function() {
        parent.visible = false;
        parent.enabled = false;
        expect(parent[toXML]()).to.be.equal(
          `<TestWidget cid='${parent.cid}' ${bounds} enabled='false' visible='false'/>`
        );
      });

      it('prints xml tree with one child', function() {
        child.appendTo(parent);
        expect(parent[toXML]()).to.equal(
          `<TestWidget cid='${parent.cid}' ${bounds}>\n  <Composite cid='${child.cid}' ${bounds}/>\n</TestWidget>`
        );
      });

      it('prints xml tree with multiple children', function() {
        child.appendTo(parent);
        child2.appendTo(parent);
        expect(parent[toXML]()).to.equal(
          `<TestWidget cid='${parent.cid}' ${bounds}>\n` +
          `  <Composite cid='${child.cid}' ${bounds}/>\n` +
          `  <Button cid='${child2.cid}' ${bounds} text=''/>\n` +
          '</TestWidget>'
        );
      });

      it('prints xml tree with grandchild', function() {
        child2.appendTo(child);
        child.appendTo(parent);
        expect(parent[toXML]()).to.equal(
          `<TestWidget cid='${parent.cid}' ${bounds}>\n` +
          `  <Composite cid='${child.cid}' ${bounds}>\n` +
          `    <Button cid='${child2.cid}' ${bounds} text=''/>\n` +
          '  </Composite>\n' +
          '</TestWidget>'
        );
      });

    });

    it('provides string tag', function() {
      expect(Object.prototype.toString.call(widget)).to.equal('[object TestWidget]');
    });

    it('overrides toString', function() {
      expect(widget.toString()).to.equal(`TestWidget[cid="${widget.cid}"]`);
      expect((widget = new TestWidget({id: 'foo'})).toString()).to.equal(`TestWidget[cid="${widget.cid}"]#foo`);
      expect((widget = new TestWidget({class: 'foo bar'})).toString())
        .to.equal(`TestWidget[cid="${widget.cid}"].foo.bar`);
      expect((widget = new TestWidget({id: 'foo', class: 'bar'})).toString())
        .to.equal(`TestWidget[cid="${widget.cid}"]#foo.bar`);
    });

    it('toString works on disposed widget', function() {
      widget.dispose();
      const disposed = prop => {
        const result = new TestWidget(prop);
        result.dispose();
        return result;
      };
      expect(widget.toString()).to.equal(`TestWidget[cid="${widget.cid}"] (disposed)`);
      expect((widget = disposed({id: 'foo'})).toString()).to.equal(`TestWidget[cid="${widget.cid}"]#foo (disposed)`);
      expect((widget = disposed({class: 'foo bar'})).toString())
        .to.equal(`TestWidget[cid="${widget.cid}"].foo.bar (disposed)`);
      expect((widget = disposed({id: 'foo', class: 'bar'})).toString())
        .to.equal(`TestWidget[cid="${widget.cid}"]#foo.bar (disposed)`);
    });

    describe('dispose', function() {

      let parent, child;

      beforeEach(function() {
        parent = new TestWidget();
        child = new TextView().appendTo(parent);
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

      it('notifies parent\'s `removeChild` listener', function() {
        const listener = spy();
        parent.onRemoveChild(listener);

        child.dispose();

        expect(listener).to.have.been.calledOnce;
        expect(listener.getCall(0).args[0].target).to.equal(parent);
        expect(listener.getCall(0).args[0].child).to.equal(child);
        expect(listener.getCall(0).args[0].index).to.equal(0);
      });

      it('notifies parent\'s `removeChild` listener with correct index', function() {
        new TestWidget().insertBefore(child);
        const listener = spy();
        parent.onRemoveChild(listener);

        child.dispose();

        expect(listener.getCall(0).args[0].target).to.equal(parent);
        expect(listener.getCall(0).args[0].child).to.equal(child);
        expect(listener.getCall(0).args[0].index).to.equal(1);
      });

      it('notifies all children\'s dispose listeners', function() {
        const log = [];
        const child2 = new TestWidget().appendTo(parent);
        parent.onDispose(() => log.push('parent'));
        child.onDispose(() => log.push('child'));
        child2.onDispose(() => log.push('child2'));

        parent.dispose();

        expect(log).to.eql(['parent', 'child', 'child2']);
      });

      it('notifies children\'s dispose listeners recursively', function() {
        const log = [];
        child = new TestWidget().appendTo(parent);
        const grandchild = new TestWidget().appendTo(child);
        parent.onDispose(() => log.push('parent'));
        child.onDispose(() => log.push('child'));
        grandchild.onDispose(() => log.push('grandchild'));

        parent.dispose();

        expect(log).to.eql(['parent', 'child', 'grandchild']);
      });

      it('marks children as disposed', function() {
        parent.dispose();
        expect(child.toString()).to.contain('(disposed)');
      });

    });

    describe('when disposed', function() {

      beforeEach(function() {
        widget.dispose();
      });

      it('on() does not throw', function() {
        expect(() => widget.onDispose(() => {})).not.to.throw;
      });

      it('off() does not throw', function() {
        expect(() => widget.off('dispose', () => {})).not.to.throw;
      });

      it('once() does not throw', function() {
        expect(() => widget.once('dispose', () => {})).not.to.throw;
      });

      it('set() does not throw', function() {
        expect(() => widget.set({id: 'foo'})).not.to.throw;
      });

      it('get() returns undefined', function() {
        expect(widget.id).to.be.undefined;
      });

      it('parent() returns null', function() {
        expect(widget.parent()).to.be.null;
      });

      it('children() returns empty list', function() {
        expect(widget.children().length).to.equal(0);
      });

      it('siblings() returns empty list', function() {
        expect(widget.siblings().length).to.equal(0);
      });

      it('find() returns empty list', function() {
        expect(widget.find().length).to.equal(0);
      });

      it('append() fails', function() {
        expect(() => {
          widget.append();
        }).to.throw(Error, 'Object is disposed');
      });

      it('appendTo() fails', function() {
        expect(() => {
          widget.appendTo();
        }).to.throw(Error, 'Object is disposed');
      });

      it('insertBefore() fails', function() {
        expect(() => {
          widget.insertBefore();
        }).to.throw(Error, 'Object is disposed');
      });

      it('insertAfter() fails', function() {
        expect(() => {
          widget.insertAfter();
        }).to.throw(Error, 'Object is disposed');
      });

      it('detach() fails', function() {
        expect(() => {
          widget.detach();
        }).to.throw(Error, 'Object is disposed');
      });

      it('dispose() fails silently', function() {
        expect(() => widget.dispose()).not.to.throw();
      });

    });

    describe('append', function() {

      let parent, child1, child2, listener, result;

      beforeEach(function() {
        parent = new TestWidget();
        child1 = new TestWidget({id: 'child1'});
        child2 = new TestWidget({id: 'child2'});
        client.resetCalls();
        listener = spy();
      });

      describe('when called with a widget', function() {

        beforeEach(function() {
          parent.onAddChild(listener);
          result = parent.append(child1);
        });

        it('SETs children', function() {
          const calls = client.calls();
          expect(calls.length).to.equal(1);
          expect(calls[0]).to.eql({op: 'set', id: parent.cid, properties: {children: [child1.cid]}});
        });

        it('returns self to allow chaining', function() {
          expect(result).to.equal(parent);
        });

        it('notifies `addChild` listener with arguments parent, child, event', function() {
          expect(listener).to.have.been.calledOnce;
          expect(listener.getCall(0).args[0].target).to.equal(parent);
          expect(listener.getCall(0).args[0].child).to.equal(child1);
          expect(listener.getCall(0).args[0].index).to.equal(0);
        });

        it('children() returns WidgetCollection with host', function() {
          expect(parent.children()).to.be.instanceOf(WidgetCollection);
          expect(parent.children().host).to.equal(parent);
        });

        it('children() contains appended child', function() {
          expect(parent.children().toArray()).to.contain(child1);
        });

        it('children() returns a safe copy', function() {
          parent.children()[0] = null;
          expect(parent.children().toArray()).to.deep.contain(child1);
        });

        it('_children() contains appended child when children() is overwritten', function() {
          parent.children = () => new WidgetCollection();
          expect(parent._children().toArray()).to.contain(child1);
        });

      });

      describe('when called with multiple widgets', function() {

        beforeEach(function() {
          result = parent.append(child1, child2);
        });

        it('SETs children after flush', function() {
          tabris.flush();
          const calls = client.calls();
          expect(calls.length).to.equal(1);
          expect(calls[0]).to.eql({op: 'set', id: parent.cid, properties: {children: [child1.cid, child2.cid]}});
        });

        it('SETs children only once', function() {
          child1.detach();
          child2.detach();
          parent.append(child1, child2);

          tabris.flush();

          const calls = client.calls();
          expect(calls.length).to.equal(1);
          expect(calls[0]).to.eql({op: 'set', id: parent.cid, properties: {children: [child1.cid, child2.cid]}});
        });

        it('returns self to allow chaining', function() {
          expect(result).to.equal(parent);
        });

        it('children() contains appended children', function() {
          expect(parent.children().toArray()).to.contain(child1);
          expect(parent.children().toArray()).to.contain(child2);
        });

        it('children() with matcher contains filtered children', function() {
          expect(parent.children('#child1').toArray()).to.eql([child1]);
          expect(parent.children('#child2').toArray()).to.eql([child2]);
        });

      });

      describe('when called with an array of widgets', function() {

        beforeEach(function() {
          result = parent.append([child1, child2]);
          tabris.flush();
        });

        it('SETs children', function() {
          const calls = client.calls();
          expect(calls.length).to.equal(1);
          expect(calls[0]).to.eql({op: 'set', id: parent.cid, properties: {children: [child1.cid, child2.cid]}});
        });

        it('adds the widgets to children list', function() {
          expect(parent.children().toArray()).to.eql([child1, child2]);
        });

        it('returns self to allow chaining', function() {
          expect(result).to.equal(parent);
        });

      });

      describe('when called with a widget collection', function() {

        beforeEach(function() {
          result = parent.append(new WidgetCollection([child1, child2]));
          tabris.flush();
        });

        it('SETs children', function() {
          const calls = client.calls();
          expect(calls.length).to.equal(1);
          expect(calls[0]).to.eql({op: 'set', id: parent.cid, properties: {children: [child1.cid, child2.cid]}});
        });

        it('adds the widgets to children list', function() {
          expect(parent.children().toArray()).to.eql([child1, child2]);
        });

        it('returns self to allow chaining', function() {
          expect(result).to.equal(parent);
        });

      });

      describe('when called with non-widget', function() {

        it('throws an error', function() {
          expect(() => {
            parent.append({});
          }).to.throw(Error, `Cannot append non-widget {} to TestWidget[cid="${parent.cid}"]`);
        });

      });

      describe('when called with itself', function() {

        it('throws an error', function() {
          expect(() => {
            parent.append(parent);
          }).to.throw(Error, `Cannot append widget TestWidget[cid="${parent.cid}"] to itself`);
        });

      });

      describe('when child is not accepted', function() {

        it('throws an error', function() {
          const child = new TestWidget();
          stub(parent, '_acceptChild').callsFake(() => false);

          expect(() => {
            parent.append(child);
          }).to.throw(Error, /TestWidget\[cid=".*"\] could not be appended to TestWidget\[cid=".*"\]/);
          expect(parent.children().toArray()).not.to.contain(child);
        });

      });

    });

    describe('excludeFromLayout', function() {

      /** @type {TestWidget} */
      let parent;

      /** @type {TestWidget[]} */
      let children;

      beforeEach(function() {
        parent = new TestWidget();
        children = [new TestWidget({id: 'child1'}), new TestWidget({id: 'child2'}), new TestWidget({id: 'child3'})];
        client.resetCalls();
      });

      it('defaults to false', function() {
        expect(parent.excludeFromLayout).to.be.false;
      });

      it('can be set to true', function() {
        parent.excludeFromLayout = true;
        expect(parent.excludeFromLayout).to.be.true;
      });

      it('set to true removes child from SET operation before append', function() {
        children[1].excludeFromLayout = true;
        parent.append(children);

        tabris.flush();
        expect(client.calls()[0]).to.eql({op: 'set', id: parent.cid, properties: {
          children: [children[0].cid, children[2].cid]}
        });
      });

      it('set to true removes child from SET operation after append', function() {
        parent.append(children);
        children[1].excludeFromLayout = true;

        tabris.flush();
        expect(client.calls()[0]).to.eql({op: 'set', id: parent.cid, properties: {
          children: [children[0].cid, children[2].cid]}
        });
      });

      it('set to true schedules children flush', function() {
        parent.append(children);
        tabris.flush();
        client.resetCalls();

        children[1].excludeFromLayout = true;

        tabris.flush();
        expect(client.calls()[0]).to.eql({op: 'set', id: parent.cid, properties: {
          children: [children[0].cid, children[2].cid]}
        });
      });

      it('set to false schedules children flush', function() {
        children[1].excludeFromLayout = true;
        parent.append(children);
        tabris.flush();
        client.resetCalls();

        children[1].excludeFromLayout = false;

        tabris.flush();
        expect(client.calls()[0]).to.eql({op: 'set', id: parent.cid, properties: {
          children: [children[0].cid, children[1].cid, children[2].cid]}
        });
      });

    });

    describe('appendTo', function() {

      let parent1, result;

      beforeEach(function() {
        parent1 = new TestWidget();
        client.resetCalls();
        result = widget.appendTo(parent1);
        tabris.flush();
      });

      describe('when called with a parent', function() {

        it('returns self to allow chaining', function() {
          expect(result).to.equal(widget);
        });

        it('SETs children', function() {
          const calls = client.calls();
          expect(calls.length).to.equal(1);
          expect(calls[0]).to.eql({op: 'set', id: parent1.cid, properties: {children: [widget.cid]}});
        });

        it('is added to parent\'s children list', function() {
          expect(parent1.children().toArray()).to.contain(widget);
        });

      });

      describe('when called with another parent', function() {

        let parent2;

        beforeEach(function() {
          parent2 = new TestWidget();
          tabris.flush();
          client.resetCalls();
          widget.appendTo(parent2);
          tabris.flush();
        });

        it('is removed from old parent\'s children list', function() {
          expect(parent1.children().toArray()).not.to.contain(widget);
        });

        it('is added to new parent\'s children list', function() {
          expect(parent2.children().toArray()).to.contain(widget);
        });

        it('SETs children on old parent', function() {
          const calls = client.calls({op: 'set', id: parent1.cid});
          expect(calls.length).to.equal(1);
          expect(calls[0].properties).to.eql({children: []});
        });

        it('SETs children on new parent', function() {
          const calls = client.calls({op: 'set', id: parent2.cid});
          expect(calls.length).to.equal(1);
          expect(calls[0].properties).to.eql({children: [widget.cid]});
        });

      });

      describe('when called with a collection', function() {

        let parent2, parent3;

        beforeEach(function() {
          parent2 = new TestWidget();
          parent3 = new TestWidget();
          client.resetCalls();
          result = widget.appendTo(new WidgetCollection([parent3, parent2]));
        });

        it('returns self to allow chaining', function() {
          expect(result).to.equal(widget);
        });

        it('first entry is added to parent\'s children list', function() {
          expect(parent3.children().toArray()).to.contain(widget);
        });

        it('other entry not added to parent\'s children list', function() {
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
          tabris.flush();
          client.resetCalls();
        });

        it('removes widget from its old parent\'s children list', function() {
          widget.insertBefore(other);
          expect(parent1.children().toArray()).not.to.contain(widget);
        });

        it('adds widget to new parent\'s children list', function() {
          widget.insertBefore(other);
          expect(parent2.children().toArray()).to.contain(widget);
        });

        it('adds widget directly before the given widget', function() {
          widget.insertBefore(other);
          const children = parent2.children();
          expect(children.indexOf(widget)).to.equal(children.indexOf(other) - 1);
        });

        it('SETs children on old parent', function() {
          widget.insertBefore(other);
          tabris.flush();

          const calls = client.calls({op: 'set', id: parent1.cid});
          expect(calls.length).to.equal(1);
          expect(calls[0].properties).to.eql({children: []});
        });

        it('SETs children on new parent', function() {
          widget.insertBefore(other);
          tabris.flush();

          const calls = client.calls({op: 'set', id: parent2.cid});
          expect(calls.length).to.equal(1);
          expect(calls[0].properties).to.eql({children: [widget.cid, other.cid]});
        });

        it('triggers remove event with index', function() {
          parent1.onRemoveChild(listener);

          widget.insertBefore(other);

          expect(listener.getCall(0).args[0].target).to.equal(parent1);
          expect(listener.getCall(0).args[0].child).to.equal(widget);
          expect(listener.getCall(0).args[0].index).to.equal(0);
        });

        it('triggers add event with index', function() {
          parent2.onAddChild(listener);

          widget.insertBefore(other);

          expect(listener.getCall(0).args[0].target).to.equal(parent2);
          expect(listener.getCall(0).args[0].child).to.equal(widget);
          expect(listener.getCall(0).args[0].index).to.equal(0);
        });

      });

      describe('when called with a sibling widget', function() {

        beforeEach(function() {
          other = new TestWidget().appendTo(parent1);
          widget.appendTo(parent1);
          tabris.flush();
          client.resetCalls();
          widget.insertBefore(other);
          tabris.flush();
        });

        it('re-orders widgets', function() {
          expect(parent1.children().toArray()).to.eql([widget, other]);
        });

        it('SETs children', function() {
          const calls = client.calls({op: 'set', id: parent1.cid});
          expect(calls.length).to.equal(1);
          expect(calls[0].properties).to.eql({children: [widget.cid, other.cid]});
        });

      });

      describe('when called with a widget collection', function() {

        beforeEach(function() {
          new TestWidget({class: 'child'}).appendTo(parent1);
          new TestWidget({class: 'child'}).appendTo(parent2);
          const grandparent = new TestWidget().append(parent1, parent2);
          tabris.flush();
          client.resetCalls();
          widget.insertBefore(grandparent.find('.child'));
          tabris.flush();
        });

        it('inserts only before the first the widget of the collection', function() {
          expect(parent1.children().toArray()).to.contain(widget);
          expect(parent2.children().toArray()).not.to.contain(widget);
        });

        it('SETs children only once', function() {
          const calls = client.calls({op: 'set'});
          expect(calls.length).to.equal(1);
          expect(calls[0].id).to.eql(parent1.cid);
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

        let next;

        beforeEach(function() {
          widget.appendTo(parent1);
          other = new TestWidget().appendTo(parent2);
          next = new TestWidget().appendTo(parent2);
          tabris.flush();
          client.resetCalls();
        });

        it('removes widget from its old parent\'s children list', function() {
          widget.insertAfter(other);
          expect(parent1.children().toArray()).not.to.contain(widget);
        });

        it('adds widget to new parent\'s children list', function() {
          widget.insertAfter(other);
          expect(parent2.children().toArray()).to.contain(widget);
        });

        it('adds widget directly after the given widget', function() {
          widget.insertAfter(other);
          const children = parent2.children();
          expect(children.indexOf(widget)).to.equal(children.indexOf(other) + 1);
        });

        it('SETs children on old parent', function() {
          widget.insertAfter(other);
          tabris.flush();

          const calls = client.calls({op: 'set', id: parent1.cid});
          expect(calls.length).to.equal(1);
          expect(calls[0].properties).to.eql({children: []});
        });

        it('SETs children on new parent', function() {
          widget.insertAfter(other);
          tabris.flush();

          const calls = client.calls({op: 'set', id: parent2.cid});
          expect(calls.length).to.equal(1);
          expect(calls[0].properties).to.eql({children: [other.cid, widget.cid, next.cid]});
        });

        it('triggers `removeChild` event with index', function() {
          parent1.onRemoveChild(listener);

          widget.insertAfter(other);

          expect(listener.getCall(0).args[0].target).to.equal(parent1);
          expect(listener.getCall(0).args[0].child).to.equal(widget);
          expect(listener.getCall(0).args[0].index).to.equal(0);
        });

        it('triggers `addChild` event with index', function() {
          parent2.onAddChild(listener);

          widget.insertAfter(other);

          expect(listener.getCall(0).args[0].target).to.equal(parent2);
          expect(listener.getCall(0).args[0].child).to.equal(widget);
          expect(listener.getCall(0).args[0].index).to.equal(1);
        });

      });

      describe('when called with a sibling widget', function() {

        let next;

        beforeEach(function() {
          widget.appendTo(parent1);
          other = new TestWidget().appendTo(parent1);
          next = new TestWidget().appendTo(parent1);
          tabris.flush();
          client.resetCalls();
          widget.insertAfter(other);
          tabris.flush();
        });

        it('re-orders widgets', function() {
          expect(parent1.children().length).to.equal(3);
          expect(parent1.children()[0] === other).to.be.true;
          expect(parent1.children()[1] === widget).to.be.true;
          expect(parent1.children()[2] === next).to.be.true;
        });

        it('SETs children', function() {
          const calls = client.calls({op: 'set', id: parent1.cid});
          expect(calls.length).to.equal(1);
          expect(calls[0].properties).to.eql({children: [other.cid, widget.cid, next.cid]});
        });

      });

      describe('when called with a widget collection', function() {

        beforeEach(function() {
          new TestWidget({class: 'child'}).appendTo(parent1);
          new TestWidget({class: 'child'}).appendTo(parent2);
          const grandparent = new TestWidget().append(parent1, parent2);
          tabris.flush();
          client.resetCalls();
          widget.insertAfter(grandparent.find('.child'));
          tabris.flush();
        });

        it('inserts only before the first the widget of the collection', function() {
          expect(parent1.children().toArray()).to.contain(widget);
          expect(parent2.children().toArray()).not.to.contain(widget);
        });

        it('SETs children only once', function() {
          const calls = client.calls({op: 'set'});
          expect(calls.length).to.equal(1);
          expect(calls[0].id).to.eql(parent1.cid);
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
        const parent = new TestWidget();
        widget.appendTo(parent);

        widget.detach();

        expect(parent.children().toArray()).to.eql([]);
        expect(widget.parent()).to.be.null;
      });

      it('SETs children of parent', function() {
        const parent = new TestWidget();
        widget.appendTo(parent);
        tabris.flush();
        client.resetCalls();

        widget.detach();
        tabris.flush();

        const calls = client.calls({op: 'set'});
        expect(calls.length).to.equal(1);
        expect(calls[0]).to.eql({op: 'set', id: parent.cid, properties: {children: []}});
      });

    });

    describe('parent', function() {

      /** @type {TestWidget} */
      let parent;
      /** @type {Composite} */
      let grandParent;
      /** @type {Composite} */
      let lastParent;

      beforeEach(function() {
        parent = new TestWidget();
        grandParent = new Composite({id: 'foo'});
        lastParent = new Composite({id: 'foo'});
        widget.appendTo(parent);
        parent.appendTo(grandParent);
        grandParent.appendTo(lastParent);
      });

      it('returns null by default', function() {
        expect(new TestWidget().parent()).to.be.null;
      });

      it('returns the parent when appended', function() {
        expect(widget.parent()).to.equal(parent);
      });

      it('with selector returns first matching parent', function() {
        expect(widget.parent('#foo')).to.equal(grandParent);
      });

      it('with selector returns null without matching parent', function() {
        expect(widget.parent('#bar')).to.equal(null);
      });

    });

    describe('siblings', function() {

      let child1, child2, child3;

      beforeEach(function() {
        child1 = new TestWidget();
        child2 = new TestWidget();
        child3 = new TestWidget();
      });

      it('returns empty collection without host when called without a parent', function() {
        expect(widget.siblings().toArray()).to.eql([]);
        expect(widget.siblings().host).to.be.null;
      });

      it('returns empty collection with host when there are no siblings', function() {
        widget.append(child1);

        expect(child1.siblings().toArray()).to.eql([]);
        expect(child1.siblings().host).to.eql(widget);
      });

      it('returns collection with all siblings and host', function() {
        widget.append(child1, child2, child3);

        expect(child2.siblings().toArray()).to.eql([child1, child3]);
        expect(child1.siblings().host).to.eql(widget);
      });

      it('does not include grand children', function() {
        widget.append(child1, child2);
        child2.append(child3);

        expect(child1.siblings().toArray()).to.eql([child2]);
      });

      it('returns filtered list when called with a selector', function() {
        const button1 = new TestWidget({class: 'child'});
        const button2 = new TestWidget({class: 'child'});
        widget.append(child1, button1, child2, button2, child3);

        expect(child1.siblings('.child').toArray()).to.eql([button1, button2]);
      });

      it('calls filter callback with correct widgetCollection', function() {
        widget.append(child1, child2, child3);
        let filterCollection = null;

        const result = child2.siblings((sibling, index, collection) => filterCollection = collection);

        expect(filterCollection).to.not.equal(result);
        expect(filterCollection.toArray()).to.eql([child1, child3]);
        expect(filterCollection.host).to.equal(widget);
      });

    });

    describe('find', function() {
      /* eslint-disable camelcase */

      let child1, child2, child1_1, child1_2, child1_2_1;

      beforeEach(function() {
        child1 = new TestWidget({id: 'foo'}).appendTo(widget);
        child2 = new TestWidget({class: 'bar'}).appendTo(widget);
        child1_1 = new TestWidget({}).appendTo(child1);
        child1_2 = new TestWidget({class: 'bar'}).appendTo(child1);
        child1_2_1 = new TextView({id: 'foo'}).appendTo(child1_2);
      });

      it('returns WidgetCollection with host', function() {
        expect(widget.find('*')).to.be.instanceOf(WidgetCollection);
        expect(widget.find('*').host).to.eql(widget);
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

      it(':host selector by itself returns nothing since host itself is not in scope', function() {
        expect(widget.find(':host').toArray()).to.eql([]);
      });

      it(':host > * returns direct children', function() {
        expect(widget.find(':host > *').toArray()).to.eql([child1, child2]);
      });

      it(':host > * > * returns grandchildren', function() {
        expect(widget.find(':host > * > *').toArray()).to.eql([child1_1, child1_2]);
      });

      it('returns no descendants when children() is overwritten to return empty collection', function() {
        widget.children = () => new WidgetCollection();
        expect(widget.find('*').toArray()).to.eql([]);
      });

      it('returns no descendants when children() is overwritten to return empty array', function() {
        widget.children = () => [];
        expect(widget.find('*').toArray()).to.eql([]);
      });

      it('returns no descendants when children() is overwritten to return empty null', function() {
        widget.children = () => null;
        expect(widget.find('*').toArray()).to.eql([]);
      });

      it(':host > *  returns nothing  when children() is overwritten to return empty null', function() {
        widget.children = () => new WidgetCollection();
        expect(widget.find(':host > *').toArray()).to.eql([]);
      });

      it('"protected" version returns descendants when children() is overwritten', function() {
        widget.children = () => new WidgetCollection();
        expect(widget._find('*').toArray()).to.eql([child1, child1_1, child1_2, child1_2_1, child2]);
      });

      it('returns partial descendants when children() is overwritten on child', function() {
        child1_2.children = () => new WidgetCollection();
        expect(widget.find('*').toArray()).to.eql([child1, child1_1, child1_2, child2]);
      });

      it('"protected" version returns partial descendants when children() is overwritten on child', function() {
        child1_2.children = () => new WidgetCollection();
        expect(widget._find('*').toArray()).to.eql([child1, child1_1, child1_2, child2]);
      });

      it(':host > * returns direct children on protected version', function() {
        widget.children = () => new WidgetCollection();
        expect(widget._find(':host > *').toArray()).to.eql([child1, child2]);
      });

      it('returns children by Type', function() {
        expect(widget.find('TestWidget').toArray()).to.eql([child1, child1_1, child1_2, child2]);
        expect(widget.find(TestWidget).toArray()).to.eql([child1, child1_1, child1_2, child2]);
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
        const props = {prop1: 'v1', prop2: 'v2'};
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

      it('applies properties to children with specific class', function() {
        widget.apply({'.myclass': {prop1: 'v1'}});

        expect(widget.set).not.to.have.been.called;
        expect(child1.set).to.have.been.calledWith({prop1: 'v1'});
        expect(child2.set).not.to.have.been.called;
        expect(child1_1.set).not.to.have.been.called;
      });

      it('applies properties to :host', function() {
        widget.apply({':host': {prop1: 'v1'}});

        expect(widget.set).to.have.been.calledWith({prop1: 'v1'});
        expect(child1.set).not.to.have.been.called;
        expect(child2.set).not.to.have.been.called;
        expect(child1_1.set).not.to.have.been.called;
      });

      it('applies properties to children with specific type', function() {
        const composite = new Composite();
        composite.set = spy();
        widget.append(composite);
        widget.apply({Composite: {prop1: 'v1'}});

        expect(composite.set).to.have.been.calledWith({prop1: 'v1'});
        expect(widget.set).not.to.have.been.called;
        expect(child1.set).not.to.have.been.called;
        expect(child2.set).not.to.have.been.called;
        expect(child1_1.set).not.to.have.been.called;
      });

      it('applies properties to children with specific depth', function() {
        widget.apply({':host': {prop1: 'v1'}});
        widget.apply({':host > *': {prop1: 'v2'}});
        widget.apply({':host > * > *': {prop1: 'v3'}});

        expect(widget.set).to.have.been.calledWith({prop1: 'v1'});
        expect(child1.set).to.have.been.calledWith({prop1: 'v2'});
        expect(child2.set).to.have.been.calledWith({prop1: 'v2'});
        expect(child1_1.set).to.have.been.calledWith({prop1: 'v3'});
      });

      it('applies properties in order *, Type, (pseudo-)class, id', function() {
        widget.apply({
          'TestWidget': {prop1: 'v2'},
          '#foo': {prop1: 'v4'},
          '.myclass': {prop1: 'v3'},
          ':host': {prop1: 'v3'},
          '*': {prop1: 'v1'}
        });

        expect(child1.set.args.map(args => args[0].prop1)).to.eql(['v1', 'v2', 'v3', 'v4']);
        expect(widget.set.args.map(args => args[0].prop1)).to.eql(['v1', 'v2', 'v3']);
      });

      it('applies properties in order of combined weight', function() {
        widget.apply({
          'TestWidget > #foo': {prop1: 'v4'},
          'TestWidget > .myclass': {prop1: 'v3'},
          ':host > TestWidget': {prop1: 'v3'},
          'TestWidget': {prop1: 'v2'},
          '* > *': {prop1: 'v1'}
        });

        expect(child1.set.args.map(args => args[0].prop1)).to.eql(['v1', 'v2', 'v3', 'v3', 'v4']);
      });

      it('does not fail on empty widget', function() {
        expect(() => {
          new TestWidget().apply({foo: {bar: 23}});
        }).not.to.throw();
      });

      it('exclude children if children() is overwritten to return empty collection', function() {
        widget.children = () => new WidgetCollection();
        const props = {prop1: 'v1', prop2: 'v2'};

        widget.apply({'*': props});

        expect(widget.set).to.have.been.calledWith(props);
        expect(child1.set).not.to.have.been.calledWith(props);
        expect(child2.set).not.to.have.been.calledWith(props);
        expect(child1_1.set).not.to.have.been.calledWith(props);
      });

      it('exclude children if children() is overwritten to return empty array', function() {
        widget.children = () => [];
        const props = {prop1: 'v1', prop2: 'v2'};

        widget.apply({'*': props});

        expect(widget.set).to.have.been.calledWith(props);
        expect(child1.set).not.to.have.been.calledWith(props);
        expect(child2.set).not.to.have.been.calledWith(props);
        expect(child1_1.set).not.to.have.been.calledWith(props);
      });

      it('exclude children if children() is overwritten to return null', function() {
        widget.children = () => null;
        const props = {prop1: 'v1', prop2: 'v2'};

        widget.apply({'*': props});

        expect(widget.set).to.have.been.calledWith(props);
        expect(child1.set).not.to.have.been.calledWith(props);
        expect(child2.set).not.to.have.been.calledWith(props);
        expect(child1_1.set).not.to.have.been.calledWith(props);
      });

      it('applies partially if children() on child is overwritten to return empty collection', function() {
        child1.children = () => new WidgetCollection();
        const props = {prop1: 'v1', prop2: 'v2'};

        widget.apply({'*': props});

        expect(widget.set).to.have.been.calledWith(props);
        expect(child1.set).to.have.been.calledWith(props);
        expect(child2.set).to.have.been.calledWith(props);
        expect(child1_1.set).not.to.have.been.calledWith(props);
      });

      it('applies partially if children() on child is overwritten to return empty array', function() {
        child1.children = () => [];
        const props = {prop1: 'v1', prop2: 'v2'};

        widget.apply({'*': props});

        expect(widget.set).to.have.been.calledWith(props);
        expect(child1.set).to.have.been.calledWith(props);
        expect(child2.set).to.have.been.calledWith(props);
        expect(child1_1.set).not.to.have.been.calledWith(props);
      });

      it('applies partially if children() on child is overwritten to return null', function() {
        child1.children = () => null;
        const props = {prop1: 'v1', prop2: 'v2'};

        widget.apply({'*': props});

        expect(widget.set).to.have.been.calledWith(props);
        expect(child1.set).to.have.been.calledWith(props);
        expect(child2.set).to.have.been.calledWith(props);
        expect(child1_1.set).not.to.have.been.calledWith(props);
      });

      it('"protected" version still works if children() is overwritten', function() {
        widget.children = () => new WidgetCollection();
        const props = {prop1: 'v1', prop2: 'v2'};

        widget._apply({'*': props});

        expect(widget.set).to.have.been.calledWith(props);
        expect(child1.set).to.have.been.calledWith(props);
        expect(child2.set).to.have.been.calledWith(props);
        expect(child1_1.set).to.have.been.calledWith(props);
      });

      it('"protected" variant applies partially if children() on child is overwritten', function() {
        child1.children = () => new WidgetCollection();
        const props = {prop1: 'v1', prop2: 'v2'};

        widget._apply({'*': props});

        expect(widget.set).to.have.been.calledWith(props);
        expect(child1.set).to.have.been.calledWith(props);
        expect(child2.set).to.have.been.calledWith(props);
        expect(child1_1.set).not.to.have.been.calledWith(props);
      });

    });

  });

  describe('get default decoding', function() {

    let widget;

    beforeEach(function() {
      widget = new TestWidget();
      client.resetCalls();
    });

    it('translates bounds to object', function() {
      stub(client, 'get').returns([1, 2, 3, 4]);

      const result = widget.bounds;

      expect(result).to.eql({left: 1, top: 2, width: 3, height: 4});
    });

    it('translates bounds to object', function() {
      stub(client, 'get').returns([1, 2, 3, 4]);

      const result = widget.bounds;

      expect(result).to.eql({left: 1, top: 2, width: 3, height: 4});
    });

  });

  describe('layout', function() {

    class TestLayout extends Layout {

      constructor() {
        super(new LayoutQueue());
      }

    }

    let parent, defaultLayout, testLayout;

    beforeEach(function() {
      defaultLayout = ConstraintLayout.default;
      testLayout = new TestLayout();
      spy(defaultLayout, 'add');
      spy(defaultLayout, 'remove');
      spy(testLayout, 'add');
      spy(testLayout, 'remove');
      parent = new Composite();
    });

    it('initial value is default', function() {
      expect(parent.layout).to.equal(defaultLayout);
    });

    it('calls only add on default layout exactly once with self', function() {
      expect(defaultLayout.add).to.have.been.calledOnce;
      expect(defaultLayout.add).to.have.been.calledWith(parent);
      expect(defaultLayout.remove).not.to.have.been.called;
    });

    it('calls remove on dispose', function() {
      parent.dispose();
      expect(defaultLayout.remove).to.have.been.calledOnce;
      expect(defaultLayout.remove).to.have.been.calledWith(parent);
    });

    it('is read-only', function() {
      spy(console, 'warn');

      parent.layout = testLayout;

      expect(parent.layout).to.equal(defaultLayout);
      expect(console.warn).to.have.been.calledWithMatch('Can not set read-only property "layout"');
    });

    it('calls add on custom initial layout only', function() {
      defaultLayout.add.resetHistory();
      parent = new TestWidget({layout: testLayout});
      expect(defaultLayout.add).not.to.have.been.called;
      expect(testLayout.add).to.have.been.calledOnce;
      expect(testLayout.add).to.have.been.calledWith(parent);
    });

    it('constructor accepts padding', function() {
      parent = new TestWidget({padding: 2});
      expect(parent.padding).to.deep.equal({left: 2, top: 2, right: 2, bottom: 2});
    });

  });

  describe('layoutData:', function() {

    let parent, widget, other;

    beforeEach(function() {
      parent = new TestWidget({layout: ConstraintLayout.default});
      widget = new TestWidget({layout: ConstraintLayout.default}).appendTo(parent);
      other = new TestWidget({id: 'other', layout: ConstraintLayout.default}).appendTo(parent);
      client.resetCalls();
    });

    it('return all-auto layoutData', function() {
      expect(widget.layoutData).to.deep.equal(new LayoutData({}));
    });

    it('normalize layoutData', function() {
      widget.layoutData = {top: 10, left: ['#other', 10]};

      expect(widget.layoutData).to.deep.equal(LayoutData.from({top: 10, left: ['#other', 10]}));
    });

    it('keep same same layoutData instance', function() {
      const layoutData = LayoutData.from({top: 10, left: ['#other', 10]});
      widget.layoutData = layoutData;

      expect(widget.layoutData).to.equal(layoutData);
    });

    it('fires layoutDataChanged', function() {
      const listener = spy();
      const layoutData = LayoutData.from({top: 10, left: ['#other', 10]});
      widget.onLayoutDataChanged(listener);

      widget.layoutData = layoutData;

      expect(listener).to.have.been.calledWithMatch({value: layoutData});
    });

    it('does not fire layoutDataChanged if new layoutData is equal', function() {
      const listener = spy();
      const layoutDataA = LayoutData.from({top: 10, left: ['#other', 10]});
      const layoutDataB = LayoutData.from({top: 10, left: ['#other', 10]});
      widget.layoutData = layoutDataA;
      widget.onLayoutDataChanged(listener);

      widget.layoutData = layoutDataB;

      expect(listener).not.to.have.been.called;
      expect(widget.layoutData).to.equal(layoutDataA);
      expect(widget.layoutData).not.to.equal(layoutDataB);
      expect(widget.layoutData.equals(layoutDataB)).to.be.true;
    });

    it('fires change event for individual constraint properties', function() {
      const listenerLeft = spy();
      const listenerTop = spy();
      const listenerRight = spy();
      const listenerBottom = spy();
      const layoutData = LayoutData.from({top: 10, left: ['#other', 10]});
      widget.onLeftChanged(listenerLeft);
      widget.onRightChanged(listenerRight);
      widget.onTopChanged(listenerTop);
      widget.onBottomChanged(listenerBottom);

      widget.layoutData = layoutData;

      expect(listenerLeft).to.have.been.calledWithMatch({value: layoutData.left});
      expect(listenerTop).to.have.been.calledWithMatch({value: layoutData.top});
      expect(listenerRight).not.to.have.been.called;
      expect(listenerBottom).not.to.have.been.called;
    });

    it('SET layoutData after widget referenced by selector is added to parent', function() {
      other.dispose();
      widget.layoutData = {left: 23, baseline: '#other', right: ['#other', 42]};
      other = new TestWidget({id: 'other'}).appendTo(parent);

      tabris.flush();

      const call = client.calls({op: 'set', id: widget.cid})[0];
      const expected = {left: 23, baseline: other.cid, right: [other.cid, 42]};
      expect(call.properties.layoutData).to.eql(expected);
    });

    it('SET layoutData after self is added to parent', function() {
      widget = new TestWidget();

      widget.layoutData = {left: 23, baseline: '#other', right: ['#other', 42]};
      widget.appendTo(parent);

      tabris.flush();
      const call = client.calls({op: 'create'})[0];
      const expected = {left: 23, baseline: other.cid, right: [other.cid, 42]};
      expect(call.properties.layoutData).to.eql(expected);
    });

    it('SET preliminary layoutData if selector does not resolve in flush', function() {
      widget.layoutData = {left: 23, baseline: '#mother', right: ['Other', 42]};

      const call = client.calls({op: 'set'})[0];
      const expected = {left: 23, baseline: 0, right: [0, 42]};
      expect(call.properties.layoutData).to.eql(expected);
    });

    it('SET layoutData again when selector resolves by adding sibling', function() {
      other.dispose();
      widget.layoutData = {right: '#other'};
      client.resetCalls();

      other = new TestWidget({id: 'other'}).appendTo(parent);

      tabris.flush();
      const setCalls = client.calls({op: 'set', id: widget.cid});
      expect(setCalls.length).to.equal(1);
      expect(setCalls[0].properties.layoutData).to.eql({right: [other.cid, 0]});
    });

    it('SET layoutData again when selector resolves by setting parent', function() {
      widget = new TestWidget();
      widget.appendTo(new TestWidget());
      widget.layoutData = {right: '#other'};
      client.resetCalls();

      widget.appendTo(parent);

      tabris.flush();
      const setCalls = client.calls({op: 'set', id: widget.cid});
      expect(setCalls.length).to.equal(1);
      expect(setCalls[0].properties.layoutData).to.eql({right: [other.cid, 0]});
    });

  });

  describe('layout attributes', function() {

    let parent, widget, other;

    beforeEach(function() {
      parent = new Composite();
      other = new TestWidget({id: 'other'}).appendTo(parent);
      widget = new TestWidget().appendTo(parent);
      client.resetCalls();
    });

    ['left', 'right', 'top', 'bottom'].forEach((attr) => {

      it('modifies layoutData', function() {
        widget[attr] = ['#other', 10];

        expect(widget.layoutData[attr]).to.deep.equal(Constraint.from(['#other', 10]));
      });

      it('fires layoutDataChanged', function() {
        const listener = spy();
        widget.onLayoutDataChanged(listener);

        widget[attr] = ['#other', 10];

        expect(listener).to.have.been.calledWithMatch({value: widget.layoutData});
      });

      it('does not fire layoutDataChanged if new constraint is equal', function() {
        widget[attr] = ['#other', 10];
        const listener = spy();
        widget.onLayoutDataChanged(listener);

        widget[attr] = ['#other', 10];

        expect(listener).not.to.have.been.called;
      });

      it('resets layoutData properties', function() {
        const layoutData = {left: 1, right: 2, top: 3, bottom: 4};
        widget.layoutData = layoutData;
        widget[attr] = null;

        expect(widget.layoutData).to.deep.equal(LayoutData.from(omit(layoutData, attr)));
      });

      it('getter does not translate selectors', function() {
        widget[attr] = ['#other', 10];

        expect(widget[attr]).to.deep.equal(Constraint.from(['#other', 10]));
      });

      it('getter does not translate widgets', function() {
        widget[attr] = [other, 42];

        expect(widget[attr]).to.deep.equal(Constraint.from([other, 42]));
      });

      it('getter normalizes constraints', function() {
        widget[attr] = ['23%', 42];

        expect(widget[attr]).to.deep.equal(Constraint.from(['23%', 42]));
      });

      it('SETs layoutData', function() {
        widget[attr] = 23;

        tabris.flush();
        const call = client.calls({op: 'set', id: widget.cid})[0];
        const expected = {[attr]: 23};
        expect(call.properties.layoutData).to.eql(expected);
      });

      it('does not SET layoutData if new Constraint is equal', function() {
        widget[attr] = 23;
        tabris.flush();
        client.resetCalls();

        widget[attr] = 23;
        tabris.flush();

        expect(client.calls({op: 'set', id: widget.cid}).length).to.equal(0);
      });

    });

    ['width', 'height', 'centerX', 'centerY'].forEach((attr) => {

      it('modifies layoutData', function() {
        widget[attr] = 23;

        expect(widget.layoutData[attr]).to.equal(23);
      });

      it('resets layoutData properties', function() {
        const layoutData = {centerX: 0, centerY: 0, width: 100, height: 200};
        widget.layoutData = layoutData;
        widget[attr] = null;

        expect(widget.layoutData).to.deep.equal(LayoutData.from(omit(layoutData, attr)));
      });

      it('SETs layoutData', function() {
        widget[attr] = 23;

        const call = client.calls({op: 'set', id: widget.cid})[0];
        const expected = {};
        expected[attr] = 23;
        expect(call.properties.layoutData).to.deep.equal(expected);
      });

    });

    it('contradicting attributes can be set temporarily without warning', function() {
      stub(console, 'warn');

      widget.left = 10;
      widget.width = 10;
      widget.right = 10;
      widget.left = null;

      const call = client.calls({op: 'set', id: widget.cid})[0];
      const expected = {right: 10, width: 10};
      expect(call.properties.layoutData).to.eql(expected);
      expect(console.warn).not.to.have.been.called;
    });

    it('contradicting attributes will be warned against on flush', function() {
      stub(console, 'warn');

      widget.left = 10;
      widget.width = 10;
      widget.right = 10;

      const call = client.calls({op: 'set', id: widget.cid})[0];
      const expected = {right: 10, left: 10};
      expect(call.properties.layoutData).to.eql(expected);
      expect(console.warn).to.have.been.called;
    });

  });

  describe('native events:', function() {

    let listener, widget;

    function checkListen(event) {
      const listen = client.calls({op: 'listen', id: widget.cid});
      expect(listen.length).to.equal(1);
      expect(listen[0].event).to.equal(event);
      expect(listen[0].listen).to.be.true;
    }

    beforeEach(function() {
      listener = spy();
    });

    describe('resize', function() {

      it('decodes bounds', function() {
        widget = new TestWidget().onResize(listener);

        tabris._notify(widget.cid, 'resize', {bounds: [1, 2, 3, 4]});

        expect(listener).to.have.been.calledOnce;
        expect(listener.getCall(0).args[0].target).to.equal(widget);
        expect(listener).to.have.been.calledWithMatch({left: 1, top: 2, width: 3, height: 4});
        checkListen('resize');
      });

      it('maps to boundsChanged', function() {
        widget = new TestWidget().onBoundsChanged(listener);

        tabris._notify(widget.cid, 'resize', {bounds: [1, 2, 3, 4]});

        expect(listener).to.have.been.calledOnce;
        expect(listener.getCall(0).args[0].target).to.equal(widget);
        expect(listener.getCall(0).args[0].value).to.deep.equal({left: 1, top: 2, width: 3, height: 4});
        checkListen('resize');
      });

      it('caches bounds', function() {
        let bounds;
        widget = new TestWidget().onBoundsChanged(() => bounds = widget.bounds);

        tabris._notify(widget.cid, 'resize', {bounds: [1, 2, 3, 4]});

        expect(bounds).to.deep.equal({left: 1, top: 2, width: 3, height: 4});
      });

    });

    ['touchStart', 'touchMove', 'touchEnd', 'touchCancel'].forEach(name => {
      it(name, function() {
        widget = new TestWidget().on(name, listener);

        widget._trigger(name, {});

        expect(listener).to.have.been.calledOnce;
        expect(listener.getCall(0).args[0].target).to.equal(widget);
        checkListen(name);
      });
    });

  });

});
