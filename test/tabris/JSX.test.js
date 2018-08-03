import {expect, mockTabris, spy} from '../test';
import ClientStub from './ClientStub';
import {createElement} from '../../src/tabris/JSX';
import WidgetCollection from '../../src/tabris/WidgetCollection';
import Composite from '../../src/tabris/widgets/Composite';
import Button from '../../src/tabris/widgets/Button';
import CheckBox from '../../src/tabris/widgets/CheckBox';
import Switch from '../../src/tabris/widgets/Switch';
import AlertDialog from '../../src/tabris/AlertDialog';

describe('JSX', function() {

  beforeEach(function() {
    mockTabris(new ClientStub());
    // main.js does this usually, but is not executed in tests:
    global.tabris.CheckBox = CheckBox;
    global.tabris.WidgetCollection = WidgetCollection;
  });

  describe('createElement', function() {

    it('creates widget by Constructor', function() {
      expect(createElement(CheckBox, null)).to.be.an.instanceof(CheckBox);
    });

    it('sets properties', function() {
      expect(createElement(CheckBox, {text: 'foo'}).text).to.equal('foo');
    });

    it('attaches camelCase listeners', function() {
      let selectSpy = spy();
      let fooSpyA = spy();
      let fooSpyZ = spy();

      let widget = createElement(CheckBox, {onSelect: selectSpy, onAFoo: fooSpyA, onZFoo: fooSpyZ});
      widget.trigger('select', {data: 1});
      widget.trigger('aFoo', {data: 2});
      widget.trigger('zFoo', {data: 3});

      expect(selectSpy).to.have.been.calledOnce;
      expect(selectSpy).to.have.been.calledWithMatch({data: 1});
      expect(fooSpyA).to.have.been.calledOnce;
      expect(fooSpyA).to.have.been.calledWithMatch({data: 2});
      expect(fooSpyZ).to.have.been.calledOnce;
      expect(fooSpyZ).to.have.been.calledWithMatch({data: 3});
    });

    it('does not attach non-camelCase listeners', function() {
      let selectSpy = spy();
      let fooSpyA = spy();
      let fooSpyZ = spy();

      let widget = createElement(CheckBox, {onselect: selectSpy, onafoo: fooSpyA, onzfoo: fooSpyZ});
      widget.trigger('select', {data: 1});
      widget.trigger('foo', {data: 2});

      expect(selectSpy).not.to.have.been.called;
      expect(fooSpyA).not.to.have.been.called;
      expect(fooSpyZ).not.to.have.been.called;
    });

    it('appends children', function() {
      let children = createElement(
        Composite,
        {},
        createElement(Button),
        createElement(CheckBox),
        createElement(Switch)
      ).children();

      expect(children[0]).to.be.instanceof(Button);
      expect(children[1]).to.be.instanceof(CheckBox);
      expect(children[2]).to.be.instanceof(Switch);
    });

    it('appends children', function() {
      let children = createElement(
        Composite,
        null,
        createElement(Button),
        createElement(CheckBox),
        createElement(Switch)
      ).children();

      expect(children[0]).to.be.instanceof(Button);
      expect(children[1]).to.be.instanceof(CheckBox);
      expect(children[2]).to.be.instanceof(Switch);
    });

    it('appends children given as array', function() {
      let children = createElement(
        Composite,
        null,
        [createElement(Button), createElement(CheckBox)],
        createElement(Switch)
      ).children();

      expect(children[0]).to.be.instanceof(Button);
      expect(children[1]).to.be.instanceof(CheckBox);
      expect(children[2]).to.be.instanceof(Switch);
    });

    it('appends widgetCollection', function() {
      let children = createElement(
        Composite,
        null,
        new WidgetCollection([
          createElement(Button),
          createElement(CheckBox),
          createElement(Switch)
        ])
      ).children();

      expect(children[0]).to.be.instanceof(Button);
      expect(children[1]).to.be.instanceof(CheckBox);
      expect(children[2]).to.be.instanceof(Switch);
    });

    it('appends widgetCollection and children mixed', function() {
      let children = createElement(
        Composite,
        null,
        createElement(Button),
        new WidgetCollection([
          createElement(CheckBox),
          new WidgetCollection([
            createElement(Switch)
          ])
        ])
      ).children();

      expect(children[0]).to.be.instanceof(Button);
      expect(children[1]).to.be.instanceof(CheckBox);
      expect(children[2]).to.be.instanceof(Switch);
    });

    it('appends text on widget supporting text', function() {
      let button = createElement(
        Button,
        null,
        'Hello',
        'World!'
      );

      expect(button.text).to.equal('Hello World!');
    });

    it('appends no text on widget not accepting text', function() {
      let composite = createElement(
        Composite,
        null,
        'Hello',
        'World!'
      );

      expect(composite.text).to.be.undefined;
    });

    it('executes given function', function() {
      let fn = spy(() => new WidgetCollection([new Button()]));
      let collection = createElement(
        fn,
        {foo: 'bar'},
        {child: 1},
        {child: 2}
      );

      expect(collection).to.be.instanceof(WidgetCollection);
      expect(collection.length).to.equal(1);
      expect(fn).to.have.been.calledWith({foo: 'bar'}, [{child: 1}, {child: 2}]);
    });

    it('creates widgetCollection with children', function() {
      let collection = createElement(
        WidgetCollection,
        null,
        createElement(Button),
        createElement(CheckBox),
        createElement(Switch)
      );

      expect(collection).to.be.instanceOf(WidgetCollection);
      expect(collection.length).to.equal(3);
      expect(collection[0]).to.be.instanceof(Button);
      expect(collection[1]).to.be.instanceof(CheckBox);
      expect(collection[2]).to.be.instanceof(Switch);
    });

    it('creates widgetCollection from array', function() {
      let collection = createElement(
        WidgetCollection,
        null,
        [createElement(Button), createElement(CheckBox)],
        createElement(Switch)
      );

      expect(collection).to.be.instanceOf(WidgetCollection);
      expect(collection.length).to.equal(3);
      expect(collection[0]).to.be.instanceof(Button);
      expect(collection[1]).to.be.instanceof(CheckBox);
      expect(collection[2]).to.be.instanceof(Switch);
    });

    it('creates empty widgetCollection', function() {
      let collection = createElement(
        WidgetCollection,
        null
      );

      expect(collection).to.be.instanceOf(WidgetCollection);
      expect(collection.length).to.equal(0);
    });

    it('fails for widgetCollection with attributes', function() {
      expect(() => createElement('widgetCollection',{foo: 'bar'}).to.throw());
    });

    it('fails for non-widget native type', function() {
      expect(() => createElement(AlertDialog, null)).to.throw();
    });

    it('fails for non-widget named custom type', function() {
      expect(() => createElement(class Foo {
        set() {}
        append() {}
      }), null).to.throw(Error, 'JSX: Unsupported type Foo');
    });

    it('fails for non-widget named custom type', function() {
      expect(() => createElement(class {
        set() {}
        append() {}
      }, null)).to.throw(Error, 'JSX: Unsupported type');
    });

    it('fails for string pointing to non-function', function() {
      global.tabris.Foo = 'bar';
      expect(() => createElement('foo', null)).to.throw(Error, 'JSX: Unsupported type');
    });

    it('fails for unrecognized string', function() {
      expect(() => createElement('unknownWidget', null)).to.throw();
    });

  });

});
