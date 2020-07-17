import {expect, mockTabris} from '../test';
import ClientMock from './ClientMock';
import Set from '../../src/tabris/Set';
import Composite from '../../src/tabris/widgets/Composite';
import TextView from '../../src/tabris/widgets/TextView';
import {setterTargetType} from '../../src/tabris/symbols';

describe('Set', function() {

  /** @type {ClientMock} */
  let client;

  beforeEach(() => {
    client = new ClientMock();
    mockTabris(client);
  });

  describe('as function', function() {

    it('throws for invalid parameters', function() {
      // @ts-ignore
      expect(() => Set(Composite)).to.throw(TypeError);
      expect(() => Set('foo', {})).to.throw(TypeError);
      expect(() => Set({}, {})).to.throw(TypeError);
      expect(() => Set(() => null, {})).to.throw(TypeError);
      expect(() => Set(Composite, 'foo')).to.throw(TypeError);
      expect(() => Set(Composite, {}, {})).to.throw(TypeError);
      expect(() => Set(Date, {})).to.throw(TypeError);
    });

    it('copies plain object', function() {
      const original = {foo: 'bar'};
      expect(Set(Composite, original)).to.deep.equal(original);
      expect(Set(Composite, original)).not.to.equal(original);
    });

    it('sets target type', function() {
      expect(Set(Composite, {foo: 'bar'})[setterTargetType]).to.equal(Composite);
    });

    it('target type entry is not enumerable', function() {
      const props = Set(Composite, {foo: 'bar'});
      const copy = Object.assign({}, props);

      expect(copy[setterTargetType]).to.be.undefined;
      expect(Object.keys(props)).to.deep.equal(['foo']);
    });

    it('accepted by target via "apply"', function() {
      const props = Set(TextView, {text: 'foo'});
      const parent = new Composite();
      const child = new TextView({id: 'bar'}).appendTo(parent);

      parent.apply({'#bar': props});

      expect(child.text).to.equal('foo');
      // @ts-ignore
      expect(child[setterTargetType]).to.be.undefined;
    });

    it('rejected by other types via "apply"', function() {
      const props = Set(Composite, {text: 'foo'});
      const parent = new Composite();
      new TextView({id: 'bar'}).appendTo(parent);

      expect(() => parent.apply({'#bar': props})).to.throw(
        TypeError,
        /Can not set properties of Composite on TextView.*#bar/
      );
    });

  });

});
