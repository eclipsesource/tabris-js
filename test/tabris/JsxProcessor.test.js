import {expect, mockTabris, spy, stub, restore} from '../test';
import ClientMock from './ClientMock';
import {createJsxProcessor, JSX} from '../../src/tabris/JsxProcessor';
import WidgetCollection from '../../src/tabris/WidgetCollection';
import $ from '../../src/tabris/$';
import Composite from '../../src/tabris/widgets/Composite';
import Widget from '../../src/tabris/Widget';
import Popover from '../../src/tabris/Popover';
import AlertDialog from '../../src/tabris/AlertDialog';
import Button from '../../src/tabris/widgets/Button';
import CheckBox from '../../src/tabris/widgets/CheckBox';
import Switch from '../../src/tabris/widgets/Switch';
import App from '../../src/tabris/App';
import TextView from '../../src/tabris/widgets/TextView';
import LayoutData from '../../src/tabris/LayoutData';
import Color from '../../src/tabris/Color';
import Font from '../../src/tabris/Font';
import {originalComponent, proxyHandler} from '../../src/tabris/symbols';
import {format} from '../../src/tabris/Formatter';
import NativeObject from '../../src/tabris/NativeObject';
import Setter from '../../src/tabris/Setter';
import ObservableData from '../../src/tabris/ObservableData';

describe('JsxProcessor', function() {

  /** @type {import('../../src/tabris/JsxProcessor').default} */
  let jsx;

  beforeEach(function() {
    mockTabris(new ClientMock());
    // main.js does this usually, but is not executed in tests:
    global.tabris.CheckBox = CheckBox;
    global.tabris.WidgetCollection = WidgetCollection;
    jsx = createJsxProcessor();
  });

  afterEach(function() {
    restore();
  });

  describe('createElement', function() {

    it('creates widget by Constructor', function() {
      expect(jsx.createElement(CheckBox, null)).to.be.an.instanceof(CheckBox);
    });

    it('sets properties', function() {
      expect(jsx.createElement(CheckBox, {text: 'foo'}).text).to.equal('foo');
    });

    it('sets properties via Attr children', function() {
      const data = new Date();
      const attrText = jsx.createElement(Setter, {target: CheckBox, attribute: 'text', children: ['foo']});
      const attrData = jsx.createElement(Setter, {target: CheckBox, attribute: 'data', children: [data]});

      const widget = jsx.createElement(CheckBox, {}, attrText, attrData);

      expect(widget.text).to.equal('foo');
      expect(widget.data).to.equal(data);
    });

    it('sets "data" after "onDataChanged"', function() {
      const widget = jsx.createElement(CheckBox, {
        data: {foo: 'bar'},
        onDataChanged: ev => ev.target.text = ev.value.foo
      });
      expect(widget.text).to.equal('bar');
    });

    it('copies "data" if it is a plain object', function() {
      const data = {foo: 'bar'};

      const widget = jsx.createElement(CheckBox, {data});

      expect(widget.data).not.to.equal(data);
      expect(widget.data).to.be.instanceOf(ObservableData);
      expect(widget.data.foo).to.equal('bar');
    });

    it('throws for Attr children with incorrect target', function() {
      const attrData = jsx.createElement(Setter, {target: TextView, attribute: 'data', children: [{}]});

      expect(() => jsx.createElement(CheckBox, {}, attrData)).to.throw(
        TypeError,
        'Attribute "data" is targeting TextView, but is set on CheckBox'
      );
    });

    it('accepts Attr children with subclass target', function() {
      const attrData = jsx.createElement(Setter, {target: Widget, attribute: 'data', children: [{}]});

      expect(() => jsx.createElement(CheckBox, {}, attrData)).not.to.throw;
    });

    it('accepts Attr children on functional element', function() {
      const attrData = jsx.createElement(Setter, {target: Widget, attribute: 'data', children: [{}]});
      const MyCheckBox = attr => jsx.createElement(CheckBox, attr);

      expect(() => jsx.createElement(MyCheckBox, {}, attrData)).not.to.throw;
    });

    it('throws for conflicting Attr children', function() {
      const attrData1 = jsx.createElement(Setter, {target: CheckBox, attribute: 'data', children: [{}]});
      const attrData2 = jsx.createElement(Setter, {target: CheckBox, attribute: 'data', children: [{}]});

      expect(() => jsx.createElement(CheckBox, {}, attrData1, attrData2)).to.throw(
        Error,
        'Attribute "data" is set multiple times'
      );
    });

    it('throws for Attr conflicting with attribute', function() {
      const attrData = jsx.createElement(Setter, {target: CheckBox, attribute: 'data', children: [{}]});

      expect(() => jsx.createElement(CheckBox, {data: {}}, attrData)).to.throw(
        Error,
        'Attribute "data" is set multiple times'
      );
    });

    it('Attr children can concatenate arrays of same property', function() {
      const attrData1 = jsx.createElement(Setter, {target: CheckBox, attribute: 'data', children: [[1]]});
      const attrData2 = jsx.createElement(Setter, {target: CheckBox, attribute: 'data', children: [[2]]});

      const widget = jsx.createElement(CheckBox, {}, attrData1, attrData2);

      expect(widget.data).to.deep.equal([1, 2]);
    });

    it('allows shorthands for layoutData pre-sets', function() {
      expect(jsx.createElement(CheckBox, {stretch: true}).layoutData).to.equal(LayoutData.stretch);
      expect(jsx.createElement(CheckBox, {center: true}).layoutData).to.equal(LayoutData.center);
      expect(jsx.createElement(CheckBox, {stretchX: true}).layoutData).to.equal(LayoutData.stretchX);
      expect(jsx.createElement(CheckBox, {stretchY: true}).layoutData).to.equal(LayoutData.stretchY);
      expect(jsx.createElement(CheckBox, {centerX: true}).layoutData.centerX).to.equal(0);
      expect(jsx.createElement(CheckBox, {centerY: true}).layoutData.centerY).to.equal(0);
      expect(jsx.createElement(CheckBox, {left: true}).layoutData.left.offset).to.equal(0);
      expect(jsx.createElement(CheckBox, {left: true}).layoutData.left.reference.percent).to.equal(0);
      expect(jsx.createElement(CheckBox, {top: true}).layoutData.top.offset).to.equal(0);
      expect(jsx.createElement(CheckBox, {top: true}).layoutData.top.reference.percent).to.equal(0);
      expect(jsx.createElement(CheckBox, {right: true}).layoutData.right.offset).to.equal(0);
      expect(jsx.createElement(CheckBox, {right: true}).layoutData.right.reference.percent).to.equal(0);
      expect(jsx.createElement(CheckBox, {bottom: true}).layoutData.bottom.offset).to.equal(0);
      expect(jsx.createElement(CheckBox, {bottom: true}).layoutData.bottom.reference.percent).to.equal(0);
    });

    it('merges shorthand with property', function() {
      const result = jsx.createElement(CheckBox, {stretchY: true, layoutData: {left: 0}}).layoutData;

      expect(result.left.offset).to.equal(0);
      expect(result.top.offset).to.equal(0);
      expect(result.right).to.equal('auto');
      expect(result.bottom.offset).to.equal(0);
    });

    it('merges shorthands with each other', function() {
      const result = jsx.createElement(CheckBox, {stretchY: true, stretchX: true}).layoutData;

      expect(result.left.offset).to.equal(0);
      expect(result.top.offset).to.equal(0);
      expect(result.right.offset).to.equal(0);
      expect(result.bottom.offset).to.equal(0);
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

    it('attaches Attr listeners', function() {
      const selectSpy = spy();

      const attr = jsx.createElement(Setter, {target: CheckBox, attribute: 'onSelect', children: [selectSpy]});
      const widget = jsx.createElement(CheckBox, {}, attr);
      widget.trigger('select', {});

      expect(selectSpy).to.have.been.calledOnce;
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
      )).to.throw('JSX: Children for type Composite given twice.');
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
      expect(fn).to.have.been.calledWith({foo: 'bar', children: [{child: 1}, {child: 2}]});
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
      }), null).to.throw(Error, /^JSX: .+/);
    });

    it('fails for non-widget anonymous custom type', function() {
      expect(() => jsx.createElement(class {
        set() {}
        append() {}
      }, null)).to.throw(Error, /^JSX: .+/);
    });

    it('fails for string pointing to non-function', function() {
      global.tabris.Foo = 'bar';
      expect(() => jsx.createElement('foo', null)).to.throw(Error, 'JSX: Unsupported type');
    });

    it('fails for unrecognized string', function() {
      expect(() => jsx.createElement('unknownWidget', null)).to.throw();
    });

    describe('with stateless functional components', function() {

      it('calls named non-constructor function', function() {
        function Foo() {return new Date();}
        expect(jsx.createElement(Foo)).to.be.instanceOf(Date);
      });

      it('calls anonymous non-constructor function', function() {
        expect(jsx.createElement(function() {
          return new Date();
        })).to.be.instanceOf(Date);
      });

      it('calls anonymous non-constructor function', function() {
        expect(jsx.createElement(function() {
          return new Date();
        })).to.be.instanceOf(Date);
      });

      it('calls arrow function', function() {
        expect(jsx.createElement(() => new Date())).to.be.instanceOf(Date);
      });

      it('passes properties', function() {
        const mySpy = spy();
        function Foo(props) { mySpy(props); }

        jsx.createElement(Foo, {foo: 'bar'});

        expect(mySpy).to.have.been.calledWith({foo: 'bar'});
      });

      it('passes children', function() {
        const mySpy = spy();
        function Foo(props) { mySpy(props.children); }

        jsx.createElement(Foo, {children: ['a', 'b', 'c']});

        expect(mySpy).to.have.been.calledWith(['a', 'b', 'c']);
      });

      it('supports function name as selector', function() {
        function Foo() { return new TextView(); }
        expect(
          new WidgetCollection([jsx.createElement(Foo)]).first('Foo')
        ).to.be.instanceOf(TextView);
      });

      it('supports function as selector', function() {
        function Foo() { return new TextView(); }
        expect(
          new WidgetCollection([jsx.createElement(Foo)]).first(Foo)
        ).to.be.instanceOf(TextView);
      });

      it('supports arrow function name as selector', function() {
        const Foo = () => new TextView();
        expect(
          new WidgetCollection([jsx.createElement(Foo)]).first('Foo')
        ).to.be.instanceOf(TextView);
      });

      it('supports arrow function as selector', function() {
        const Foo = () => new TextView();
        expect(
          new WidgetCollection([jsx.createElement(Foo)]).first(Foo)
        ).to.be.instanceOf(TextView);
      });

    });

    describe('with custom type', function() {

      let Foo;

      beforeEach(function() {
        Foo = class {
          constructor(args) { this.args = args; }
          [JSX.jsxFactory](type, props) { return new Foo([type, props]); }
        };
      });

      it('calls factory of custom type', function() {
        const props = {foo: 'bar'};
        Foo.prototype[JSX.jsxFactory] = stub();

        jsx.createElement(Foo, props, 'a', 'b');

        expect(Foo.prototype[JSX.jsxFactory]).to.have.been.calledWith(Foo, {foo: 'bar', children: ['a', 'b']});
      });

      it('calls factory with children from properties', function() {
        const props = {foo: 'bar', children: ['a', 'b']};
        Foo.prototype[JSX.jsxFactory] = stub();

        jsx.createElement(Foo, props);

        expect(Foo.prototype[JSX.jsxFactory]).to.have.been.calledWith(Foo, {foo: 'bar', children: ['a', 'b']});
      });

      it('calls factory with processor context', function() {
        const props = {foo: 'bar'};
        Foo.prototype[JSX.jsxFactory] = stub();

        jsx.createElement(Foo, props, 'a', 'b');

        expect(Foo.prototype[JSX.jsxFactory]).to.have.been.calledOn(jsx);
      });

      it('returns factory return value', function() {
        expect(jsx.createElement(Foo)).to.be.instanceOf(Foo);
      });

      it('factory supports super call', function() {
        class Bar extends Foo {
          [JSX.jsxFactory]() {
            return super[JSX.jsxFactory](Bar, {a: 'b', children: ['a', 'b']});
          }
        }

        const bar = jsx.createElement(Bar, {a: 'b'}, 'a', 'b');

        expect(bar.args).to.deep.equal([Bar, {a: 'b', children: ['a', 'b']}]);
      });

    });

    describe('with intrinsic elements', function() {

      it('renders a markup string', function() {
        expect(jsx.createElement('b', {}, 'hello', ' world')).to.equal('<b>hello world</b>');
        expect(jsx.createElement('span', {}, 'hello', ' world')).to.equal('<span>hello world</span>');
        expect(jsx.createElement('big', {}, 'hello', ' world')).to.equal('<big>hello world</big>');
        expect(jsx.createElement('i', {}, 'hello', ' world')).to.equal('<i>hello world</i>');
        expect(jsx.createElement('small', {}, 'hello', ' world')).to.equal('<small>hello world</small>');
        expect(jsx.createElement('strong', {}, 'hello', ' world')).to.equal('<strong>hello world</strong>');
        expect(jsx.createElement('ins', {}, 'hello', ' world')).to.equal('<ins>hello world</ins>');
        expect(jsx.createElement('del', {}, 'hello', ' world')).to.equal('<del>hello world</del>');
        expect(jsx.createElement('a', {}, 'hello', ' world')).to.equal('<a>hello world</a>');
      });

      it('renders a with href string', function() {
        expect(jsx.createElement('a', {href: 'foo'}, 'bar')).to.equal('<a href=\'foo\'>bar</a>');
      });

      it('render with textColor', function() {
        expect(jsx.createElement('span', {textColor: '#ff00ff'}, 'bar'))
          .to.equal('<span textColor=\'rgb(255, 0, 255)\'>bar</span>');
        expect(jsx.createElement('a', {textColor: [100, 50, 100, 0]}, 'bar'))
          .to.equal('<a textColor=\'rgba(100, 50, 100, 0)\'>bar</a>');
        expect(jsx.createElement('del', {textColor: new Color(0, 1, 0)}, 'bar'))
          .to.equal('<del textColor=\'rgb(0, 1, 0)\'>bar</del>');
      });

      it('render with font', function() {
        expect(jsx.createElement('span', {font: 'normal normal 24px serif'}, 'bar'))
          .to.equal('<span font=\'24px serif\'>bar</span>');
        expect(jsx.createElement('a', {
          font: {family: ['sans-serif'], size: 12, style: 'italic', weight: 'bold'}
        }, 'bar')).to.equal('<a font=\'italic bold 12px sans-serif\'>bar</a>');
        expect(jsx.createElement('del', {font: new Font(24, ['Arial'])}, 'bar'))
          .to.equal('<del font=\'24px Arial\'>bar</del>');
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
        )).to.equal('<span> foo<br/>bar<br/>baz </span>');
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

    describe('with $', function() {

      it('creates widgetCollection via children', function() {
        const collection = jsx.createElement(
          $,
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

      it('creates widgetCollection from empty WidgetCollection', function() {
        const collection = jsx.createElement(
          $,
          null,
          jsx.createElement(WidgetCollection)
        );

        expect(collection).to.be.instanceOf(WidgetCollection);
        expect(collection.length).to.equal(0);
      });

      it('creates widgetCollection from non-empty WidgetCollection', function() {
        const collection = jsx.createElement(
          $,
          null,
          jsx.createElement(WidgetCollection, null,
            jsx.createElement(Button)
          )
        );

        expect(collection).to.be.instanceOf(WidgetCollection);
        expect(collection.length).to.equal(1);
        expect(collection[0]).to.be.instanceof(Button);
      });

      it('creates widgetCollection from widget array', function() {
        const collection = jsx.createElement(
          $,
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

      it('creates widgetCollection with non-widget entries converted to TextView', function() {
        const collection = jsx.createElement(
          $,
          null,
          'foo',
          [false, null],
          jsx.createElement(Switch),
          jsx.createElement(Button),
          'bar'
        );

        expect(collection).to.be.instanceOf(WidgetCollection);
        expect(collection.length).to.equal(4);
        expect(collection[0]).to.be.instanceof(TextView);
        expect(collection[0].text).to.equal('foofalse');
        expect(collection[1]).to.be.instanceof(Switch);
        expect(collection[2]).to.be.instanceof(Button);
        expect(collection[3]).to.be.instanceof(TextView);
        expect(collection[3].text).to.equal('bar');
      });

      it('creates string from string', function() {
        const str = jsx.createElement(
          $,
          null,
          'foo bar'
        );

        expect(str).to.equal('foo bar');
      });

      it('creates string from string array', function() {
        const str = jsx.createElement(
          $,
          null,
          'foo',
          ['bar', '<br/>', 'baz']
        );

        expect(str).to.equal('foobar<br/>baz');
      });

      it('creates string from mixed array without widgets', function() {
        const str = jsx.createElement(
          $,
          null,
          null,
          'foo',
          1
        );

        expect(str).to.equal('foo1');
      });

    });

  });

  describe('makeFactory()', function() {

    it('throws for missing argument', function() {
      // @ts-ignore
      expect(() => jsx.makeFactory()).to.throw(Error);
    });

    it('throws for additional arguments', function() {
      // @ts-ignore
      expect(() => jsx.makeFactory(Composite, 'foo')).to.throw(Error);
    });

    it('throws for non-constructor', function() {
      // @ts-ignore
      expect(() => jsx.makeFactory(null)).to.throw(Error);
    });

    it('throws for non-constructor function', function() {
      // @ts-ignore
      expect(() => jsx.makeFactory(() => null)).to.throw(Error);
    });

    it('throws for non-jsx-supporting constructor', function() {
      // @ts-ignore
      expect(() => jsx.makeFactory(NativeObject)).to.throw(Error);
    });

    describe('returned value', function() {

      /** @type {typeof Composite & ((...any: any[]) => Composite)} */
      let CompositeFactory;

      beforeEach(function() {
        CompositeFactory = jsx.makeFactory(Composite);
        spy(jsx, 'createElement');
      });

      it('is factory for given type', function() {
        expect(CompositeFactory()).to.be.instanceOf(Composite);
      });

      it('calls createElement', function() {
        const attr = {top: 23};

        CompositeFactory(attr);

        expect(jsx.createElement).to.have.been.calledOnce;
        expect(jsx.createElement).to.have.been.calledWith(CompositeFactory, attr);
      });

      it('sets properties', function() {
        expect(CompositeFactory({top: 23}).top.offset).to.equal(23);
      });

      it('registers listeners', function() {
        const listener = spy();

        const composite = CompositeFactory({onTopChanged: listener});
        composite.top = 23;

        expect(listener).to.have.been.calledOnce;
      });

      it('appends children', function() {
        const child = new Composite();

        const composite = CompositeFactory({children: [child]});

        expect(composite.children().only()).to.equal(child);
      });

      it('is still constructable', function() {
        expect(new CompositeFactory()).to.be.instanceOf(Composite);
        expect(new CompositeFactory({top: 23}).top.offset).to.equal(23);
      });

      it('it still works as selector for result', function() {
        const parent = new Composite().append(
          new TextView(),
          CompositeFactory()
        );
        expect(parent.children(CompositeFactory).length).to.equal(1);
      });

      it('it still works as selector for original', function() {
        const parent = new Composite().append(
          new TextView(),
          new Composite()
        );
        expect(parent.children(CompositeFactory).length).to.equal(1);
      });

      it('result still can be selected by class name', function() {
        const parent = new Composite().append(
          new TextView(),
          CompositeFactory()
        );
        expect(parent.children('Composite').length).to.equal(1);
      });

      it('result still can be selected by original constructor', function() {
        const parent = new Composite().append(
          new TextView(),
          CompositeFactory()
        );
        expect(parent.children(Composite).length).to.equal(1);
      });

      it('result still can be selected as parent by original constructor', function() {
        const parent = CompositeFactory().append(
          new TextView()
        );
        expect(parent.children(TextView).only().parent(Composite)).to.equal(parent);
      });

      it('supports functional components as selector', function() {
        const StyledComposite = attr =>
          CompositeFactory(Object.assign({background: 'blue'}, attr), StyledComposite);
        const parent = new Composite().append(
          new TextView(),
          StyledComposite({left: 23})
        );
        expect(parent.children(StyledComposite).length).to.equal(1);
        expect(parent.children('StyledComposite').length).to.equal(1);
        expect(parent.children('Composite').length).to.equal(1);
        expect(parent.children('asdf').length).to.equal(0);
      });

      it('throws for widget class as selector', function() {
        expect(() => CompositeFactory({}, Composite)).to.throw(TypeError);
      });

      it('still has static members', function() {
        expect(CompositeFactory.defineChangeEvent).to.equal(Composite.defineChangeEvent);
      });

      it('can be extended', function() {
        class MyComponent extends CompositeFactory {
          constructor() {
            super({top: 23});
            this.bottom = 24;
          }
        }

        const component = new MyComponent();

        expect(component.top.offset).to.equal(23);
        expect(component.bottom.offset).to.equal(24);
        expect(component.children().length).to.equal(0);
      });

      it('can be formatted', function() {
        const str = format(CompositeFactory());
        expect(str).to.match(/^Composite\[cid=/);
      });

      it('does not double-wrap', function() {
        const jsx2 = createJsxProcessor();
        spy(jsx2, 'createElement');
        const CompositeFactory2 = jsx2.makeFactory(CompositeFactory);
        const attr = {top: 23};

        const component = CompositeFactory2(attr);

        expect(component).to.be.instanceOf(Composite);
        expect(component).to.be.instanceOf(CompositeFactory2);
        expect(component.top.offset).to.equal(23);
        expect(jsx.createElement).not.to.have.been.called;
        expect(jsx2.createElement).not.have.been.calledWith(CompositeFactory, attr);
        expect(jsx2.createElement).to.have.been.calledOnce;
        expect(jsx2.createElement).to.have.been.calledWith(CompositeFactory2, attr);
      });

      it('exposes original constructor', function() {
        expect(CompositeFactory[originalComponent]).to.equal(Composite);
        expect(CompositeFactory[originalComponent]).not.to.equal(CompositeFactory);
      });

      it('original constructor is not visible on subclass', function() {
        class Subclass extends CompositeFactory {}
        expect(Subclass[originalComponent]).to.be.undefined;
      });

      it('exposes proxy handler', function() {
        const handler = CompositeFactory[proxyHandler];
        expect(handler.get).to.be.instanceOf(Function);
        expect(handler.apply).to.be.instanceOf(Function);
      });

      it('can add traps', function() {
        const handler = CompositeFactory[proxyHandler];

        handler.construct = () => new Date();

        expect(new CompositeFactory()).to.be.instanceOf(Date);
        expect(CompositeFactory()).to.be.instanceOf(Date);
      });

      it('can modify traps', function() {
        const factoryTraps = CompositeFactory[proxyHandler];

        factoryTraps.apply = () => new Date();

        expect(CompositeFactory()).to.be.instanceOf(Date);
        expect(new CompositeFactory()).to.be.instanceOf(Composite);
      });

    });

  });

  describe('makeFactories()', function() {

    it('wraps widgets constructors on dictionary', function() {
      const result = jsx.makeFactories({Button, Composite});

      const button = result.Button({top: 23});
      const composite = result.Composite({top: 23});

      expect(composite).to.be.instanceOf(Composite);
      expect(composite.top.offset).to.equal(23);
      expect(button).to.be.instanceOf(Button);
      expect(button.top.offset).to.equal(23);
    });

    it('wraps custom component constructors on dictionary', function() {
      class MyComponent extends Composite {
        constructor(props) {
          super({top: 23});
          this.set(props);
        }
      }
      const result = jsx.makeFactories({MyComponent});

      const component = result.MyComponent({bottom: 24});

      expect(component.top.offset).to.equal(23);
      expect(component.bottom.offset).to.equal(24);
    });

    it('wraps popup constructors on dictionary', function() {
      const result = jsx.makeFactories({AlertDialog, Popover});

      const alertDialog = result.AlertDialog({message: 'foo'});
      const popover = result.Popover({width: 23});

      expect(alertDialog).to.be.instanceOf(AlertDialog);
      expect(alertDialog.message).to.equal('foo');
      expect(popover).to.be.instanceOf(Popover);
      expect(popover.width).to.equal(23);
    });

  });

});
