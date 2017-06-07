import {expect, mockTabris, stub, restore} from '../test';
import ClientStub from './ClientStub';
import NativeObject from '../../src/tabris/NativeObject';
import WidgetCollection from '../../src/tabris/WidgetCollection';
import {types} from '../../src/tabris/property-types';
import {omit} from '../../src/tabris/util';

describe('property-types', function() {

  // Allow creating instances of NativeObject
  class CustomNativeObject extends NativeObject {
    constructor(cid) {
      super(cid);
    }
  }

  let widget;

  beforeEach(function() {
    let client = new ClientStub();
    mockTabris(client);
    widget = new CustomNativeObject();
  });

  afterEach(restore);

  describe('sibling encode', function() {

    let encode = types.sibling.encode;

    it('accepts widgets', function() {
      expect(encode(widget)).to.equal(widget);
    });

    it('accepts selector strings', function() {
      expect(encode('prev()')).to.equal('prev()');
      expect(encode('#foo')).to.equal('#foo');
    });

    it('rejects other strings', function() {
      expect(() => encode('23')).to.throw(Error, "Not a widget reference: '23'");
      expect(() => encode('23%')).to.throw(Error, "Not a widget reference: '23%'");
    });

    it('passes null though', function() {
      expect(encode(null)).to.equal(null);
      expect(encode()).to.equal(null);
    });

    it('rejects other types', function() {
      expect(() => encode(23)).to.throw(Error, 'Not a widget reference: 23');
      expect(() => encode([])).to.throw(Error, 'Not a widget reference: []');
      expect(() => encode({})).to.throw(Error, 'Not a widget reference: {}');
    });

  });

  describe('sibling decode', function() {

    let decode = types.sibling.decode;

    it('passes values through', function() {
      expect(decode('prev()')).to.equal('prev()');
      expect(decode('#foo')).to.equal('#foo');
      expect(decode(widget)).to.equal(widget);
    });

  });

  describe('dimension encode', function() {

    let encode = types.dimension.encode;

    it('accepts numeric strings', function() {
      expect(encode('23')).to.equal(23);
      expect(encode('-23')).to.equal(-23);
      expect(encode('+23')).to.equal(23);
      expect(encode('3.5')).to.equal(3.5);
    });

    it('rejects non-numeric strings', function() {
      expect(() => encode('*')).to.throw(Error, "Not a number: '*'");
      expect(() => encode('prev()')).to.throw(Error, "Not a number: 'prev()'");
      expect(() => encode('23px')).to.throw(Error, "Not a number: '23px'");
      expect(() => encode('')).to.throw(Error, "Not a number: ''");
    });

    it('accepts numbers', function() {
      expect(encode(23)).to.equal(23);
      expect(encode(-23)).to.equal(-23);
      expect(encode(3.5)).to.equal(3.5);
    });

    it('rejects infinte numbers', function() {
      expect(() => encode(NaN)).to.throw(Error, 'Invalid number: NaN');
      expect(() => encode(Infinity)).to.throw(Error, 'Invalid number: Infinity');
      expect(() => encode(-Infinity)).to.throw(Error, 'Invalid number: -Infinity');
    });

    it('passes null though', function() {
      expect(encode(null)).to.equal(null);
      expect(encode()).to.equal(null);
    });

    it('rejects other types', function() {
      expect(() => encode([])).to.throw(Error, 'Not a number: []');
      expect(() => encode({})).to.throw(Error, 'Not a number: {}');
    });

  });

  describe('dimension decode', function() {

    let decode = types.dimension.decode;

    it('passes values through', function() {
      expect(decode(10)).to.equal(10);
      expect(decode(-0.5)).to.equal(-0.5);
    });

  });

  describe('edge encode', function() {

    let encode = types.edge.encode;

    it('accepts numeric strings', function() {
      expect(encode('23')).to.eql([0, 23]);
      expect(encode('-23')).to.eql([0, -23]);
      expect(encode('+23')).to.eql([0, 23]);
      expect(encode('3.5')).to.eql([0, 3.5]);
    });

    it('accepts selector strings', function() {
      expect(encode('*')).to.eql(['*', 0]);
      expect(encode('prev()')).to.eql(['prev()', 0]);
      expect(encode('.foo')).to.eql(['.foo', 0]);
      expect(encode('#foo')).to.eql(['#foo', 0]);
      expect(encode('Type')).to.eql(['Type', 0]);
    });

    it('accepts percentage strings', function() {
      expect(encode('-30%')).to.eql([-30, 0]);
      expect(encode('120%')).to.eql([120, 0]);
      expect(encode('30% +10')).to.eql([30, 10]);
      expect(encode('30% -10')).to.eql([30, -10]);
    });

    it('rejects other strings', function() {
      expect(() => encode('23px')).to.throw(Error, "Invalid dimension: '23px'");
      expect(() => encode('')).to.throw(Error, "Invalid dimension: ''");
    });

    it('accepts numbers', function() {
      expect(encode(23)).to.equal(23);
      expect(encode(-23)).to.equal(-23);
      expect(encode(3.5)).to.equal(3.5);
    });

    it('rejects infinte numbers', function() {
      expect(() => encode(NaN)).to.throw(Error, 'Invalid number: NaN');
      expect(() => encode(Infinity)).to.throw(Error, 'Invalid number: Infinity');
      expect(() => encode(-Infinity)).to.throw(Error, 'Invalid number: -Infinity');
    });

    it('accepts arrays', function() {
      expect(encode([30, 10])).to.eql([30, 10]);
      expect(encode([30, '10'])).to.eql([30, 10]);
      expect(encode(['30%', '10'])).to.eql([30, 10]);
      expect(encode(['prev()', 10])).to.eql(['prev()', 10]);
      expect(encode(['prev()', 10])).to.eql(['prev()', 10]);
      expect(encode([widget, 10])).to.eql([widget, 10]);
    });

    it('rejects invalid arrays', function() {
      expect(() => encode(['30', '10']))
        .to.throw(Error, "Not a percentage or widget reference: '30'");
      expect(() => encode(['10', '30%']))
        .to.throw(Error, "Not a percentage or widget reference: '10'");
      expect(() => encode([23]))
        .to.throw(Error, 'Wrong number of elements (must be 2): [23]');
      expect(() => encode([1, 2, 3]))
        .to.throw(Error, 'Wrong number of elements (must be 2): [1, 2, 3]');
    });

    it('translates zero percentage to offset', function() {
      expect(encode('0%')).to.equal(0);
      expect(encode('0% 23')).to.equal(23);
      expect(encode(['0%', 23])).to.equal(23);
    });

    it('translates percentage strings to arrays', function() {
      expect(encode('30%')).to.eql([30, 0]);
    });

    it('translates selector-offset strings to arrays', function() {
      expect(encode('#foo 5')).to.eql(['#foo', 5]);
      expect(encode('#foo -7')).to.eql(['#foo', -7]);
      expect(encode('#foo +9')).to.eql(['#foo', 9]);
      expect(encode('#foo -10.4')).to.eql(['#foo', -10.4]);
    });

    it('translates percentage-offset strings to arrays', function() {
      expect(encode('30% 5')).to.eql([30, 5]);
      expect(encode('1% -7')).to.eql([1, -7]);
      expect(encode('-5% +9')).to.eql([-5, 9]);
      expect(encode('100% -10.4')).to.eql([100, -10.4]);
    });

    it('translates selector to array', function() {
      expect(encode('#other')).to.eql(['#other', 0]);
    });

    it('does not encode widget refs', function() {
      expect(encode(['#other', 0])).to.eql(['#other', 0]);
    });

    it('passes null though', function() {
      expect(encode(null)).to.equal(null);
      expect(encode()).to.equal(null);
    });

  });

  describe('edge decode', function() {

    let decode = types.edge.decode;

    it('passes scalar values through', function() {
      expect(decode('prev()')).to.equal('prev()');
      expect(decode('30%')).to.equal('30%');
      expect(decode(10)).to.equal(10);
    });

    it('translates percentage in arrays to string', function() {
      expect(decode(['30%', 10])).to.eql(['30%', 10]);
      expect(decode([30, 10])).to.eql(['30%', 10]);
    });

    it('removes zero offset from arrays', function() {
      expect(decode([30, 0])).to.equal('30%');
      expect(decode(['30%', 0])).to.equal('30%');
    });

  });

  describe('layoutData encode', function() {

    let encode = types.layoutData.encode;

    it('creates a safe copy', function() {
      let input = {top: 0, left: 0};
      let output = encode(input);

      expect(output).to.eql(input);
      expect(output).not.to.equal(input);
    });

    it('skips null entries', function() {
      let input = {top: 0, bottom: null, width: 0, height: null, centerX: 0, centerY: null};
      let output = encode(input);

      expect(output).to.eql({top: 0, width: 0, centerX: 0});
    });

    it('skips undefined entries', function() {
      let input = {
        top: 0,
        bottom: undefined,
        width: 0,
        height: undefined,
        centerX: 0,
        centerY: undefined
      };
      let output = encode(input);

      expect(output).to.eql({top: 0, width: 0, centerX: 0});
    });

    it('creates a safe copy of arrays', function() {
      let input = {left: [30, 10], top: [70, 20]};
      let output = encode(input);

      expect(output.left).to.eql(input.left);
      expect(output.left).not.to.equal(input.left);
    });

    ['width', 'height', 'centerX', 'centerY'].forEach((attr) => {

      it("accepts a numeric string for '" + attr + "'", function() {
        expect(encode({[attr]: '23'})).to.eql({[attr]: 23});
      });

      it("accepts a number for '" + attr + "'", function() {
        expect(encode({[attr]: 23})).to.eql({[attr]: 23});
      });

      it("rejects non-numeric string for '" + attr + "'", function() {
        expect(() => encode({[attr]: '23px'}))
          .to.throw(Error, "Invalid value for '" + attr + "': Not a number: '23px'");
      });

    });

    ['left', 'right', 'top', 'bottom'].forEach((attr) => {

      it("accepts a numeric string for '" + attr + "'", function() {
        expect(encode({[attr]: '23'})).to.eql({[attr]: [0, 23]});
      });

      it("accepts percentage+offset string for '" + attr + "'", function() {
        expect(encode({[attr]: '30% +10'})).to.eql({[attr]: [30, 10]});
      });

      it("rejects object for '" + attr + "'", function() {
        expect(() => encode({[attr]: {}}))
          .to.throw(Error, "Invalid value for '" + attr + "': Invalid dimension: {}");
      });

      it("rejects invalid array for '" + attr + "'", function() {
        expect(() => encode({[attr]: [23]}))
          .to.throw(Error, "Invalid value for '" + attr + "': Wrong number of elements (must be 2): [23]");
      });

    });

    it("accepts widget for 'baseline'", function() {
      expect(encode({left: 0, baseline: widget})).to.eql({left: 0, baseline: widget});
    });

    it("accepts selector for 'baseline'", function() {
      expect(encode({left: 0, baseline: 'prev()'})).to.eql({left: 0, baseline: 'prev()'});
    });

    it("rejects number for 'baseline'", function() {
      expect(() => encode({left: 0, baseline: 23}))
        .to.throw(Error, "Invalid value for 'baseline': Not a widget reference: 23");
    });

    it("rejects percentage for 'baseline'", function() {
      expect(() => encode({left: 0, baseline: '23%'}))
        .to.throw(Error, "Invalid value for 'baseline': Not a widget reference: '23%'");
    });

    it('rejects unknown attribute', function() {
      expect(() => encode({left: 0, foo: '23'}))
        .to.throw(Error, "Invalid key 'foo' in layoutData");
    });

  });

  describe('layoutData decode', function() {

    let decode = types.layoutData.decode;

    it('creates a safe copy', function() {
      let input = {top: 0, left: 0};
      let output = decode(input);

      expect(output).to.eql(input);
      expect(output).not.to.equal(input);
    });

    it('creates a safe copy of arrays', function() {
      let input = {left: ['30%', 10]};
      let output = decode(input);

      expect(output.left).to.eql(input.left);
      expect(output.left).not.to.equal(input.left);
    });

    it('translates to percentage strings', function() {
      expect(decode({left: [30, 10]})).to.eql({left: ['30%', 10]});
    });

    it('translates arrays with zero percentage to offset', function() {
      expect(decode({left: [0, 23]})).to.eql({left: 23});
    });

    it('translates arrays with zero offset to scalars', function() {
      expect(decode({left: [23, 0], top: ['#other', 0]})).to.eql({left: '23%', top: '#other'});
    });

  });

  describe('color', function() {

    it('encode translates initial to undefined', function() {
      let inValue = 'initial';

      let result = types.color.encode(inValue);

      expect(result).to.equal(undefined);
    });

  });

  describe('font', function() {

    it('encode translates initial to undefined', function() {
      let inValue = 'initial';

      let result = types.font.encode(inValue);

      expect(result).to.equal(undefined);
    });

  });

  describe('proxy', function() {

    let encode = types.proxy.encode;
    let decode = types.proxy.decode;

    it('translates widgets to ids in properties', function() {
      let value = new CustomNativeObject();

      expect(encode(value)).to.equal(value.cid);
    });

    it('translates widget collection to first ids in properties', function() {
      let value = new WidgetCollection([new CustomNativeObject()]);

      expect(encode(value)).to.equal(value[0].cid);
    });

    it('does not translate objects with id field to ids', function() {
      let value = {id: '23', name: 'bar'};

      expect(encode(value)).to.equal(value);
    });

    it('translates ids to widgets', function() {
      let value = new CustomNativeObject();

      expect(decode(value.cid)).to.equal(value);
    });

  });

  describe('image', function() {

    let encode = types.image.encode;

    it('succeeds for minimal image value', function() {
      stub(console, 'warn');

      let result = encode({src: 'foo.png'});

      expect(result).to.eql(['foo.png', null, null, null]);
      expect(console.warn).not.to.have.been.called;
    });

    it('succeeds for image with width and height', function() {
      stub(console, 'warn');

      let result = encode({src: 'foo.png', width: 10, height: 10});

      expect(result).to.eql(['foo.png', 10, 10, null]);
      expect(console.warn).not.to.have.been.called;
    });

    it('succeeds for string', function() {
      expect(encode('foo.jpg')).to.eql(['foo.jpg', null, null, null]);
    });

    it('succeeds for null', function() {
      expect(encode(null)).to.be.null;
    });

    it('fails if image value is not an object', function() {
      expect(() => {
        encode(23);
      }).to.throw(Error, 'Not an image: 23');
    });

    it('fails if src is undefined', function() {
      expect(() => {
        encode({});
      }).to.throw(Error, 'image.src is not a string');
    });

    it('fails if src is empty string', function() {
      expect(() => {
        encode({src: ''});
      }).to.throw(Error, 'image.src is an empty string');
    });

    it('fails if width/height/scale values are invalid number', function() {
      let goodValues = [0, 1, 1 / 3, 0.5, Math.PI];
      let badValues = [-1, NaN, 1 / 0, -1 / 0, '1', true, false, {}];
      let props = ['width', 'height', 'scale'];
      let checkWith = function(prop, value) {
        let image = {src: 'foo'};
        image[prop] = value;
        encode(image);
      };

      props.forEach((prop) => {
        goodValues.forEach((value) => {
          expect(() => checkWith(prop, value)).not.to.throw();
        });
        badValues.forEach((value) => {
          expect(() => checkWith(prop, value)).to.throw(Error, 'image.' + prop + ' is not a dimension: ' + value);
        });
      });
    });

    it('warns if scale and width are given', function() {
      stub(console, 'warn');

      encode({src: 'foo.png', width: 23, scale: 2});

      let warning = 'Image scale is ignored if width or height are given';
      expect(console.warn).to.have.been.calledWith(warning);
    });

    it('warns if scale and height are given', function() {
      stub(console, 'warn');

      encode({src: 'foo.png', height: 23, scale: 2});

      let warning = 'Image scale is ignored if width or height are given';
      expect(console.warn).to.have.been.calledWith(warning);
    });

  });

  describe('boolean', function() {

    let encode = types.boolean.encode;

    it('passes through true', function() {
      expect(encode(true)).to.equal(true);
    });

    it('passes through false', function() {
      expect(encode(false)).to.equal(false);
    });

    it('translates falsy values', function() {
      expect(encode(null)).to.equal(false);
      expect(encode('')).to.equal(false);
      expect(encode(undefined)).to.equal(false);
      expect(encode(0)).to.equal(false);
    });

    it('translates truthy values', function() {
      expect(encode(1)).to.equal(true);
      expect(encode({})).to.equal(true);
      expect(encode('true')).to.equal(true);
      expect(encode('false')).to.equal(true);
    });

  });

  describe('string', function() {

    let encode = types.string.encode;

    it('translates any value to string', function() {
      expect(encode('str')).to.equal('str');
      expect(encode(23)).to.equal('23');
      expect(encode(false)).to.equal('false');
      expect(encode(null)).to.equal('null');
      expect(encode(undefined)).to.equal('undefined');
      expect(encode({})).to.equal('[object Object]');
      expect(encode([1, 2, 3])).to.equal('1,2,3');
      expect(encode({toString() {return 'foo';}})).to.equal('foo');
    });

  });

  describe('number', function() {

    let encode = types.number.encode;

    it('fails for non-numbers', function() {
      expect(() => encode()).to.throw(Error, 'Not a number: undefined');
      expect(() => encode(null)).to.throw(Error, 'Not a number: null');
      expect(() => encode(true)).to.throw(Error, 'Not a number: true');
      expect(() => encode('')).to.throw(Error, "Not a number: ''");
      expect(() => encode('23x')).to.throw(Error, "Not a number: '23x'");
      expect(() => encode({})).to.throw(Error, 'Not a number: {}');
      expect(() => encode([])).to.throw(Error, 'Not a number: []');
    });

    it('fails for invalid numbers', function() {
      let values = [NaN, 1 / 0, -1 / 0];
      values.forEach((value) => {
        expect(() => {
          encode(value);
        }).to.throw(Error, 'Invalid number: ' + value);
      });
    });

    it('accepts all valid kinds of numbers', function() {
      expect(encode(0)).to.equal(0);
      expect(encode(1)).to.equal(1);
      expect(encode(-1)).to.equal(-1);
      expect(encode(10e10)).to.equal(10e10);
      expect(encode(10e-10)).to.equal(10e-10);
    });

    it('accepts strings', function() {
      expect(encode('0')).to.equal(0);
      expect(encode('1')).to.equal(1);
      expect(encode('-1')).to.equal(-1);
      expect(encode('3.14')).to.equal(3.14);
      expect(encode('-3.14')).to.equal(-3.14);
      expect(encode('.01')).to.equal(0.01);
    });

  });

  describe('natural', function() {

    let encode = types.natural.encode;

    it('fails for non-numbers', function() {
      expect(() => encode()).to.throw(Error, 'Not a number: undefined');
      expect(() => encode(null)).to.throw(Error, 'Not a number: null');
      expect(() => encode(true)).to.throw(Error, 'Not a number: true');
      expect(() => encode('')).to.throw(Error, "Not a number: ''");
      expect(() => encode('23x')).to.throw(Error, "Not a number: '23x'");
      expect(() => encode({})).to.throw(Error, 'Not a number: {}');
      expect(() => encode([])).to.throw(Error, 'Not a number: []');
    });

    it('fails for invalid numbers', function() {
      let values = [NaN, 1 / 0, -1 / 0];
      values.forEach((value) => {
        expect(() => {
          encode(value);
        }).to.throw(Error, 'Invalid number: ' + value);
      });
    });

    it('accepts natural number including zero', function() {
      expect(encode(0)).to.equal(0);
      expect(encode(1)).to.equal(1);
      expect(encode(10e10)).to.equal(10e10);
    });

    it('normalizes negative values', function() {
      expect(encode(-1)).to.equal(0);
      expect(encode(-1.5)).to.equal(0);
    });

    it('rounds given value', function() {
      expect(encode(0.4)).to.equal(0);
      expect(encode(1.1)).to.equal(1);
      expect(encode(1.9)).to.equal(2);
    });

    it('accepts strings', function() {
      expect(encode('0')).to.equal(0);
      expect(encode('1')).to.equal(1);
      expect(encode('-1')).to.equal(0);
      expect(encode('0.7')).to.equal(1);
    });

  });

  describe('integer', function() {

    let encode = types.integer.encode;

    it('fails for non-numbers', function() {
      expect(() => encode()).to.throw(Error, 'Not a number: undefined');
      expect(() => encode(null)).to.throw(Error, 'Not a number: null');
      expect(() => encode(true)).to.throw(Error, 'Not a number: true');
      expect(() => encode('')).to.throw(Error, "Not a number: ''");
      expect(() => encode('23x')).to.throw(Error, "Not a number: '23x'");
      expect(() => encode({})).to.throw(Error, 'Not a number: {}');
      expect(() => encode([])).to.throw(Error, 'Not a number: []');
    });

    it('fails for invalid numbers', function() {
      let values = [NaN, 1 / 0, -1 / 0];
      values.forEach((value) => {
        expect(() => {
          encode(value);
        }).to.throw(Error, 'Invalid number: ' + value);
      });
    });

    it('accepts positive and negative numbers including zero', function() {
      expect(encode(-(10e10))).to.equal(-(10e10));
      expect(encode(-1)).to.equal(-1);
      expect(encode(0)).to.equal(0);
      expect(encode(1)).to.equal(1);
      expect(encode(10e10)).to.equal(10e10);
    });

    it('rounds given value', function() {
      expect(encode(-1.9)).to.equal(-2);
      expect(encode(-1.1)).to.equal(-1);
      expect(encode(-0.4)).to.equal(0);
      expect(encode(0.4)).to.equal(0);
      expect(encode(1.1)).to.equal(1);
      expect(encode(1.9)).to.equal(2);
    });

    it('accepts strings', function() {
      expect(encode('0')).to.equal(0);
      expect(encode('1')).to.equal(1);
      expect(encode('-1')).to.equal(-1);
      expect(encode('0.7')).to.equal(1);
    });

  });

  describe('function', function() {

    let encode = types.function.encode;

    it('accepts functions', function() {
      let fn = function() {};
      expect(encode(fn)).to.equal(fn);
    });

    it('fails for non-functions', function() {
      let values = ['', 'foo', 23, null, undefined, true, false, {}, []];
      values.forEach((value) => {
        expect(() => {
          encode(value);
        }).to.throw(Error, typeof value + ' is not a function: ' + value);
      });
    });

  });

  describe('choice', function() {

    let encode = types.choice.encode;

    it('allows string values given in array', function() {
      let accepted = ['1', 'foo', 'bar'];

      expect(encode('1', accepted)).to.equal('1');
      expect(encode('foo', accepted)).to.equal('foo');
      expect(encode('bar', accepted)).to.equal('bar');
    });

    it('rejects string values not given in array', function() {
      let accepted = ['x', 'y', 'z'];

      ['1', 'foo', 'bar'].forEach((value) => {
        expect(() => {
          encode(value, accepted);
        }).to.throw(Error, 'Accepting "x", "y", "z", given was: "' + value + '"');
      });
    });

  });

  describe('nullable', function() {

    let encode = types.nullable.encode;

    it('allows null', function() {
      expect(encode(null)).to.be.null;
    });

    it('allows null or alternate check', function() {
      expect(encode(null, 'natural')).to.be.null;
      expect(encode(1.1, 'natural')).to.equal(1);
    });

    it('rejects alternate check', function() {
      expect(() => {
        encode(NaN, 'natural');
      }).to.throw();
    });

  });

  describe('opacity', function() {

    let encode = types.opacity.encode;

    it('fails for non-numbers', function() {
      expect(() => encode()).to.throw(Error, 'Not a number: undefined');
      expect(() => encode(null)).to.throw(Error, 'Not a number: null');
      expect(() => encode(true)).to.throw(Error, 'Not a number: true');
      expect(() => encode('')).to.throw(Error, "Not a number: ''");
      expect(() => encode('23x')).to.throw(Error, "Not a number: '23x'");
      expect(() => encode({})).to.throw(Error, 'Not a number: {}');
      expect(() => encode([])).to.throw(Error, 'Not a number: []');
    });

    it('fails for invalid numbers', function() {
      let values = [NaN, 1 / 0, -1 / 0];
      values.forEach((value) => {
        expect(() => {
          encode(value);
        }).to.throw(Error, 'Invalid number: ' + value);
      });
    });

    it('clamps out-of-bounds numbers', function() {
      expect(encode(-1)).to.equal(0);
      expect(encode(-0.1)).to.equal(0);
      expect(encode(1.1)).to.equal(1);
      expect(encode(1e10)).to.equal(1);
    });

    it('accepts strings', function() {
      expect(encode('0')).to.equal(0);
      expect(encode('0.1')).to.equal(0.1);
      expect(encode('1')).to.equal(1);
    });

    it('accepts natural numbers between (including) zero and one', function() {
      expect(encode(0)).to.equal(0);
      expect(encode(0.5)).to.equal(0.5);
      expect(encode(1)).to.equal(1);
    });

  });

  describe('transform', function() {

    let encode = types.transform.encode;
    let defaultValue = {
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      translationX: 0,
      translationY: 0,
      translationZ: 0
    };
    let customValue = {
      rotation: 1.2,
      scaleX: 2,
      scaleY: 0.5,
      translationX: -40,
      translationY: +40,
      translationZ: +20
    };

    it('accepts complete, valid values', function() {
      expect(encode(defaultValue)).to.eql(defaultValue);
      expect(encode(customValue)).to.eql(customValue);
    });

    it('auto-completes values', function() {
      let value = omit(customValue, ['scaleX', 'translationY']);
      let expected = {
        rotation: 1.2,
        scaleX: 1,
        scaleY: 0.5,
        translationX: -40,
        translationY: 0,
        translationZ: +20
      };
      expect(encode(value)).to.eql(expected);
      expect(encode({})).to.eql(defaultValue);
    });

    it('fails for invalid numbers', function() {
      [
        {rotation: null},
        {scaleX: undefined},
        {scaleY: NaN},
        {translationX: 1 / 0},
        {translationY: -1 / 0},
        {translationZ: 1 / 0}
      ].forEach((value) => {
        expect(() => {
          encode(value);
        }).to.throw();
      });
    });

    it('fails for unknown keys', function() {
      expect(() => {
        encode({foo: 1});
      }).to.throw(Error, 'Not a valid transformation containing "foo"');
    });

  });

  describe('array', function() {

    let encode = types.array.encode;

    it('passes any array', function() {
      expect(encode([1, 'a', true])).to.eql([1, 'a', true]);
    });

    it('converts null to empty array', function() {
      expect(encode(null)).to.eql([]);
    });

    it('converts undefined to empty array', function() {
      expect(encode(undefined)).to.eql([]);
    });

    it('does not copy array', function() {
      let input = [1, 2, 3];
      expect(encode(input)).to.equal(input);
    });

    it('fails for non-arrays', function() {
      let values = [0, 1, '', 'foo', false, true, {}, {length: 0}];
      values.forEach((value) => {
        expect(() => {
          encode(value);
        }).to.throw(Error, typeof value + ' is not an array: ' + value);
      });
    });

    it('performs optional item checks', function() {
      expect(encode(['foo', 1, true], 'string')).to.eql(['foo', '1', 'true']);
      expect(() => encode(['foo'], 'integer')).to.throw(Error, "Not a number: 'foo'");
    });

  });

});
