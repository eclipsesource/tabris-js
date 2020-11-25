import {expect, mockTabris} from '../test';
import ClientMock from './ClientMock';
import Setter, {Apply} from '../../src/tabris/Setter';
import Composite from '../../src/tabris/widgets/Composite';
import TextView from '../../src/tabris/widgets/TextView';
import {setterTargetType} from '../../src/tabris/symbols';

describe('Setter', function() {

  /** @type {ClientMock} */
  let client;

  beforeEach(() => {
    client = new ClientMock();
    mockTabris(client);
  });

  describe('as function', function() {

    it('throws for invalid parameters', function() {
      // @ts-ignore
      expect(() => Setter(Composite)).to.throw(TypeError);
      // @ts-ignore
      expect(() => Setter('foo', {})).to.throw(TypeError);
      // @ts-ignore
      expect(() => Setter({}, {})).to.throw(TypeError);
      expect(() => Setter(() => null, {})).to.throw(TypeError);
      // @ts-ignore
      expect(() => Setter(Composite, 'foo')).to.throw(TypeError);
      // @ts-ignore
      expect(() => Setter(Composite, {}, {})).to.throw(TypeError);
      expect(() => Setter(Date, {})).to.throw(TypeError);
      expect(() => Setter(Composite, null, {})).to.throw(TypeError);
      expect(() => Setter(Composite, 'foo', null)).to.throw(TypeError);
    });

    it('copies plain object', function() {
      const original = {foo: 'bar'};
      expect(Setter(Composite, original)).to.deep.equal(original);
      expect(Setter(Composite, original)).not.to.equal(original);
    });

    it('sets target type', function() {
      expect(Setter(Composite, {foo: 'bar'})[setterTargetType]).to.equal(Composite);
    });

    it('target type entry is not enumerable', function() {
      const props = Setter(Composite, {foo: 'bar'});
      const copy = Object.assign({}, props);

      expect(copy[setterTargetType]).to.be.undefined;
      expect(Object.keys(props)).to.deep.equal(['foo']);
    });

    it('accepted by target via "apply"', function() {
      const props = Setter(TextView, {text: 'foo'});
      const parent = new Composite();
      const child = new TextView({id: 'bar'}).appendTo(parent);

      parent.apply({'#bar': props});

      // @ts-ignore
      expect(child.text).to.equal('foo');
      expect(child[setterTargetType]).to.be.undefined;
    });

    it('rejected by other types via "apply"', function() {
      const props = Setter(Composite, {text: 'foo'});
      const parent = new Composite();
      new TextView({id: 'bar'}).appendTo(parent);

      expect(() => parent.apply({'#bar': props})).to.throw(
        TypeError,
        /Can not set properties of Composite on TextView.*#bar/
      );
    });

    it('creates ruleset if selector is given', function() {
      expect(Setter(Composite, '#foo', {test: 'bar'})).to.deep.equal({
        '#foo': {
          [setterTargetType]: Composite,
          test: 'bar'
        }
      });
    });

  });

  describe('as JSX Element', function() {

    it('throws for invalid parameters', function() {
      // @ts-ignore
      expect(() => Setter({target: Composite, children: ['foo']})).to.throw(TypeError);
      // @ts-ignore
      expect(() => Setter({target: Composite, attribute: null, children: ['foo']})).to.throw(TypeError);
      // @ts-ignore
      expect(() => Setter({target: () => null, attribute: 'foo', children: ['foo']}, {})).to.throw(TypeError);
      // @ts-ignore
      expect(() => Setter({target: Composite, attribute: 'foo'})).to.throw(TypeError);
      expect(() => Setter({target: Date, attribute: 'foo', children: ['foo']})).to.throw(TypeError);
      expect(() => Setter({target: Composite, attribute: 'foo', children: ['foo', 'bar']})).to.throw(TypeError);
      expect(() => Setter({target: Composite, attribute: 'foo', children: []})).to.throw(TypeError);
    });

    it('creates attributes object with target type', function() {
      expect(Setter({target: Composite, attribute: 'foo', children: ['bar']})).to.deep.equal({
        [setterTargetType]: Composite,
        foo: 'bar'
      });
    });

  });

  describe('alias "Apply"', function() {

    it('creates apply array from object', function() {
      expect(Apply({children: [{'*': {background: 'blue'}}]})).to.deep.equal({
        [setterTargetType]: Composite,
        apply: [{'*': {background: 'blue'}}]
      });
    });

    it('creates apply array from apply array', function() {
      expect(Apply({children: [[{'*': {background: 'blue'}}]]})).to.deep.equal({
        [setterTargetType]: Composite,
        apply: [{'*': {background: 'blue'}}]
      });
    });

    it('creates apply array with target attribute', function() {
      expect(Apply({target: TextView, children: [{text: 'bar'}]})).to.deep.equal({
        [setterTargetType]: Composite,
        apply: [{
          [setterTargetType]: TextView,
          text: 'bar'
        }]
      });
    });

    it('creates apply array with target and selector attributes', function() {
      expect(
        Apply({
          target: TextView,
          selector: '#foo',
          children: [{text: 'bar'}]
        })
      ).to.deep.equal({
        [setterTargetType]: Composite,
        apply: [{
          '#foo': {
            [setterTargetType]: TextView,
            text: 'bar'
          }
        }]
      });
    });

    it('creates apply array with selector attribute', function() {
      expect(
        Apply({
          target: TextView,
          selector: '#foo',
          children: [{text: 'bar'}]
        })
      ).to.deep.equal({
        [setterTargetType]: Composite,
        apply: [{
          '#foo': {
            text: 'bar'
          }
        }]
      });
    });

    it('creates apply array with selector and attr attributes', function() {
      expect(
        Apply({
          target: TextView,
          selector: '#foo',
          attr: {text: 'bar'}
        })
      ).to.deep.equal({
        [setterTargetType]: Composite,
        apply: [{
          '#foo': {
            text: 'bar'
          }
        }]
      });
    });

    it('throw for missing rules', function() {
      expect(() => Apply({})).to.throw(TypeError);
      expect(() => Apply({attr: null})).to.throw(TypeError);
      expect(() => Apply({children: []})).to.throw(TypeError);
      expect(() => Apply({children: [null]})).to.throw(TypeError);
    });

    it('throw for rules given twice', function() {
      expect(() => Apply({attr: {}, children: [{}]})).to.throw(Error);
    });

  });

});
