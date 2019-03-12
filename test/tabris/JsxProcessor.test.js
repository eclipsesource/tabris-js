import {expect, mockTabris, spy, stub} from '../test';
import ClientStub from './ClientStub';
import {createJsxProcessor, jsxFactory} from '../../src/tabris/JsxProcessor';
import WidgetCollection from '../../src/tabris/WidgetCollection';
import Composite from '../../src/tabris/widgets/Composite';
import Button from '../../src/tabris/widgets/Button';
import CheckBox from '../../src/tabris/widgets/CheckBox';
import Switch from '../../src/tabris/widgets/Switch';
import App from '../../src/tabris/App';

describe('JsxProcessor', function() {

  let jsx;

  beforeEach(function() {
    mockTabris(new ClientStub());
    // main.js does this usually, but is not executed in tests:
    global.tabris.CheckBox = CheckBox;
    global.tabris.WidgetCollection = WidgetCollection;
    jsx = createJsxProcessor();
  });

  describe('createElement', function() {

    it('creates widget by Constructor', function() {
      expect(jsx.createElement(CheckBox, null)).to.be.an.instanceof(CheckBox);
    });

    it('sets properties', function() {
      expect(jsx.createElement(CheckBox, {text: 'foo'}).text).to.equal('foo');
    });

    it('attaches camelCase listeners', function() {
      const selectSpy = spy();
      const fooSpyA = spy();
      const fooSpyZ = spy();

      const widget = jsx.createElement(CheckBox, {onSelect: selectSpy, onAFoo: fooSpyA, onZFoo: fooSpyZ});
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
      const selectSpy = spy();
      const fooSpyA = spy();
      const fooSpyZ = spy();

      const widget = jsx.createElement(CheckBox, {onselect: selectSpy, onafoo: fooSpyA, onzfoo: fooSpyZ});
      widget.trigger('select', {data: 1});
      widget.trigger('foo', {data: 2});

      expect(selectSpy).not.to.have.been.called;
      expect(fooSpyA).not.to.have.been.called;
      expect(fooSpyZ).not.to.have.been.called;
    });

    it('appends children', function() {
      const children = jsx.createElement(
        Composite,
        null,
        jsx.createElement(Button),
        jsx.createElement(CheckBox),
        jsx.createElement(Switch)
      ).children();

      expect(children[0]).to.be.instanceof(Button);
      expect(children[1]).to.be.instanceof(CheckBox);
      expect(children[2]).to.be.instanceof(Switch);
    });

    it('appends children given as array', function() {
      const children = jsx.createElement(
        Composite,
        null,
        [jsx.createElement(Button), jsx.createElement(CheckBox)],
        jsx.createElement(Switch)
      ).children();

      expect(children[0]).to.be.instanceof(Button);
      expect(children[1]).to.be.instanceof(CheckBox);
      expect(children[2]).to.be.instanceof(Switch);
    });

    it('appends widgetCollection', function() {
      const children = jsx.createElement(
        Composite,
        null,
        new WidgetCollection([
          jsx.createElement(Button),
          jsx.createElement(CheckBox),
          jsx.createElement(Switch)
        ])
      ).children();

      expect(children[0]).to.be.instanceof(Button);
      expect(children[1]).to.be.instanceof(CheckBox);
      expect(children[2]).to.be.instanceof(Switch);
    });

    it('appends widgetCollection and children mixed', function() {
      const children = jsx.createElement(
        Composite,
        null,
        jsx.createElement(Button),
        new WidgetCollection([
          jsx.createElement(CheckBox),
          new WidgetCollection([
            jsx.createElement(Switch)
          ])
        ])
      ).children();

      expect(children[0]).to.be.instanceof(Button);
      expect(children[1]).to.be.instanceof(CheckBox);
      expect(children[2]).to.be.instanceof(Switch);
    });

    it('appends children via properties', function() {
      const children = jsx.createElement(
        Composite,
        {
          children: [
            jsx.createElement(Button),
            jsx.createElement(CheckBox),
            jsx.createElement(Switch)
          ]
        }
      ).children();

      expect(children[0]).to.be.instanceof(Button);
      expect(children[1]).to.be.instanceof(CheckBox);
      expect(children[2]).to.be.instanceof(Switch);
    });

    it('throws if children are given via properties and body', function() {
      expect(() => jsx.createElement(
        Composite,
        {
          children: [
            jsx.createElement(Button),
            jsx.createElement(CheckBox),
            jsx.createElement(Switch)
          ]
        },
        jsx.createElement(Button),
        jsx.createElement(CheckBox),
        jsx.createElement(Switch)
      )).to.throw(/children/);
    });

    it('executes given function', function() {
      const fn = spy(() => new WidgetCollection([new Button()]));
      const collection = jsx.createElement(
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
      const collection = jsx.createElement(
        WidgetCollection,
        null,
        jsx.createElement(Button),
        jsx.createElement(CheckBox),
        jsx.createElement(Switch)
      );

      expect(collection).to.be.instanceOf(WidgetCollection);
      expect(collection.length).to.equal(3);
      expect(collection[0]).to.be.instanceof(Button);
      expect(collection[1]).to.be.instanceof(CheckBox);
      expect(collection[2]).to.be.instanceof(Switch);
    });

    it('creates widgetCollection from array', function() {
      const collection = jsx.createElement(
        WidgetCollection,
        null,
        [jsx.createElement(Button), jsx.createElement(CheckBox)],
        jsx.createElement(Switch)
      );

      expect(collection).to.be.instanceOf(WidgetCollection);
      expect(collection.length).to.equal(3);
      expect(collection[0]).to.be.instanceof(Button);
      expect(collection[1]).to.be.instanceof(CheckBox);
      expect(collection[2]).to.be.instanceof(Switch);
    });

    it('creates empty widgetCollection', function() {
      const collection = jsx.createElement(
        WidgetCollection,
        null
      );

      expect(collection).to.be.instanceOf(WidgetCollection);
      expect(collection.length).to.equal(0);
    });

    it('fails for widgetCollection with attributes', function() {
      expect(() => jsx.createElement('widgetCollection',{foo: 'bar'}).to.throw());
    });

    it('fails for non-widget native type', function() {
      expect(() => jsx.createElement(App, null)).to.throw();
    });

    it('fails for non-widget named custom type', function() {
      expect(() => jsx.createElement(class Foo {
        set() {}
        append() {}
      }), null).to.throw(Error, 'JSX: Unsupported type Foo');
    });

    it('fails for non-widget named custom type', function() {
      expect(() => jsx.createElement(class {
        set() {}
        append() {}
      }, null)).to.throw(Error, 'JSX: Unsupported type');
    });

    it('fails for string pointing to non-function', function() {
      global.tabris.Foo = 'bar';
      expect(() => jsx.createElement('foo', null)).to.throw(Error, 'JSX: Unsupported type');
    });

    it('fails for unrecognized string', function() {
      expect(() => jsx.createElement('unknownWidget', null)).to.throw();
    });

    describe('with custom type', function() {

      let Foo;

      beforeEach(function() {
        Foo = class {
          constructor(args) { this.args = args; }
          [jsxFactory](type, props, children) { return new Foo([type, props, children]); }
        };
      });

      it('calls factory of custom type', function() {
        const props = {foo: 'bar'};
        Foo.prototype[jsxFactory] = stub();

        jsx.createElement(Foo, props, 'a', 'b');

        expect(Foo.prototype[jsxFactory]).to.have.been.calledWith(Foo, props, ['a', 'b']);
      });

      it('calls factory with children from properties', function() {
        const props = {foo: 'bar', children: ['a', 'b']};
        Foo.prototype[jsxFactory] = stub();

        jsx.createElement(Foo, props);

        expect(Foo.prototype[jsxFactory]).to.have.been.calledWith(Foo, {foo: 'bar'}, ['a', 'b']);
      });

      it('calls factory with processor context', function() {
        const props = {foo: 'bar'};
        Foo.prototype[jsxFactory] = stub();

        jsx.createElement(Foo, props, 'a', 'b');

        expect(Foo.prototype[jsxFactory]).to.have.been.calledOn(jsx);
      });

      it('returns factory return value', function() {
        expect(jsx.createElement(Foo)).to.be.instanceOf(Foo);
      });

      it('factory supports super call', function() {
        class Bar extends Foo {
          [jsxFactory]() {
            return super[jsxFactory](Bar, {a: 'b'}, ['a', 'b']);
          }
        }

        const bar = jsx.createElement(Bar, {a: 'b'}, 'a', 'b');

        expect(bar.args).to.deep.equal([Bar, {a: 'b'}, ['a', 'b']]);
      });

    });

    describe('with intrinsic elements', function() {

      it('renders a markup string', function() {
        expect(jsx.createElement('b', {}, 'hello', 'world')).to.equal('<b>hello world</b>');
        expect(jsx.createElement('span', {}, 'hello', 'world')).to.equal('<span>hello world</span>');
        expect(jsx.createElement('big', {}, 'hello', 'world')).to.equal('<big>hello world</big>');
        expect(jsx.createElement('i', {}, 'hello', 'world')).to.equal('<i>hello world</i>');
        expect(jsx.createElement('small', {}, 'hello', 'world')).to.equal('<small>hello world</small>');
        expect(jsx.createElement('strong', {}, 'hello', 'world')).to.equal('<strong>hello world</strong>');
        expect(jsx.createElement('ins', {}, 'hello', 'world')).to.equal('<ins>hello world</ins>');
        expect(jsx.createElement('del', {}, 'hello', 'world')).to.equal('<del>hello world</del>');
        expect(jsx.createElement('a', {}, 'hello', 'world')).to.equal('<a>hello world</a>');
      });

      it('renders a with href string', function() {
        expect(jsx.createElement('a', {href: 'foo'}, 'bar')).to.equal('<a href=\'foo\'>bar</a>');
      });

      it('throws for a with unsupported href type', function() {
        expect(() => jsx.createElement('a', {href: true})).to.throw();
      });

      it('renders br as <br/>', function() {
        expect(jsx.createElement('br')).to.equal('<br/>');
      });

      it('strips spaces around <br/>', function() {
        expect(jsx.createElement('span', {},
          ' foo  <br/> bar <br  />   baz '
        )).to.equal('<span>foo<br/>bar<br/>baz</span>');
      });

      it('throws for br with content', function() {
        expect(() => jsx.createElement('br', {}, 'foo')).to.throw();
      });

      it('throws for unsupported attributes', function() {
        expect(() => jsx.createElement('br', {foo: 'bar'})).to.throw();
        expect(() => jsx.createElement('b', {foo: 'bar'})).to.throw();
        expect(() => jsx.createElement('span', {foo: 'bar'})).to.throw();
        expect(() => jsx.createElement('big', {foo: 'bar'})).to.throw();
        expect(() => jsx.createElement('i', {foo: 'bar'})).to.throw();
        expect(() => jsx.createElement('small', {foo: 'bar'})).to.throw();
        expect(() => jsx.createElement('strong', {foo: 'bar'})).to.throw();
        expect(() => jsx.createElement('ins', {foo: 'bar'})).to.throw();
        expect(() => jsx.createElement('del', {foo: 'bar'})).to.throw();
        expect(() => jsx.createElement('a', {foo: 'bar'})).to.throw();
      });

    });

  });

});
