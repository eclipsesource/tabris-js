import {expect, mockTabris, restore, stub} from '../test';
import ClientMock from './ClientMock';
import NativeObject from '../../src/tabris/NativeObject';
import WidgetCollection from '../../src/tabris/WidgetCollection';
import {types} from '../../src/tabris/property-types';
import {omit} from '../../src/tabris/util';
import Color from '../../src/tabris/Color';
import Image from '../../src/tabris/Image';
import LinearGradient from '../../src/tabris/LinearGradient';

describe('property-types', function() {

  // Allow creating instances of NativeObject
  class CustomNativeObject extends NativeObject {
    get _nativeType() { return 'CustomNativeObject'; }
  }

  beforeEach(function() {
    const client = new ClientMock();
    mockTabris(client);
  });

  afterEach(restore);

  describe('ColorValue', function() {

    it('encode translates "initial" to `undefined`', function() {
      expect(types.ColorValue.encode('initial')).to.equal(undefined);
    });

    it('encode translates `null` to `undefined`', function() {
      expect(types.ColorValue.encode(null)).to.equal(undefined);
    });

    it('decode translates `null` to `initial`', function() {
      expect(types.ColorValue.decode(null)).to.equal('initial');
    });

  });

  describe('shader', function() {

    it('encode translates "initial" to `undefined`', function() {
      expect(types.shader.encode('initial')).to.equal(undefined);
    });

    it('encode translates `null` to `undefined`', function() {
      expect(types.shader.encode(null)).to.equal(undefined);
    });

    it('encode throws for invalid values', function() {
      expect(() => types.shader.encode(12)).to.throw('12 must be a valid LinearGradientValue or ColorValue');
      expect(() => {
        types.shader.encode('linear-gradient(to right bottom, blue, red)');
      }).to.throw('Invalid direction "right bottom". Corners are not supported.');
    });

    it('encode converts linear gradient value to a linear gradient shader', function() {
      const shader = types.shader.encode('linear-gradient(red -30%, blue)');
      expect(shader.type).to.equal('linearGradient');
      expect(shader.angle).to.equal(180);
      expect(shader.colors[0]).to.deep.equal([Color.red.toArray(), -0.3]);
      expect(shader.colors[1]).to.deep.equal([Color.blue.toArray(), null]);
    });

    it('encode converts linear gradient value to a linear gradient shader', function() {
      const shader = types.shader.encode('linear-gradient(red -30%, blue)');
      expect(shader.type).to.equal('linearGradient');
      expect(shader.angle).to.equal(180);
      expect(shader.colors[0]).to.deep.equal([Color.red.toArray(), -0.3]);
      expect(shader.colors[1]).to.deep.equal([Color.blue.toArray(), null]);
    });

    it('encode converts image object to image shader', function() {
      const shader = types.shader.encode({src: 'foo.png'});
      expect(shader.type).to.equal('image');
      expect(shader.image).to.deep.equal(['foo.png', null, null, null]);
    });

    it('encode converts image object with scale to image shader', function() {
      const shader = types.shader.encode({src: 'foo.png', scale: 2});
      expect(shader.type).to.equal('image');
      expect(shader.image).to.deep.equal(['foo.png', null, null, 2]);
    });

    it('encode converts image object with width and height to image shader', function() {
      const shader = types.shader.encode({src: 'foo.png', width: 200, height: 100});
      expect(shader.type).to.equal('image');
      expect(shader.image).to.deep.equal(['foo.png', 200, 100, null]);
    });

    it('encode converts image object with width only to image shader', function() {
      const shader = types.shader.encode({src: 'foo.png', width: 200});
      expect(shader.type).to.equal('image');
      expect(shader.image).to.deep.equal(['foo.png', 200, null, null]);
    });

    it('encode converts image string to image shader', function() {
      const shader = types.shader.encode('foo.png');
      expect(shader.type).to.equal('image');
      expect(shader.image).to.deep.equal(['foo.png', null, null, null]);
    });

    it('decode converts falsy to "initial"', function() {
      expect(types.shader.decode(null)).to.equal('initial');
    });

    it('decode converts linear gradient shader to a LinearGradient', function() {
      const shader = {
        type: 'linearGradient',
        colors: [[Color.red.toArray(), -0.3], [Color.blue.toArray(), null]],
        angle: 180
      };
      const linearGradient = types.shader.decode(shader);
      expect(linearGradient).to.be.instanceof(LinearGradient);
      expect(linearGradient.direction).to.equal(180);
      expect(linearGradient.colorStops).to.deep.equal([[Color.red, {percent: -30}], Color.blue]);
    });

    it('decode converts color shader to Color', function() {
      const color = types.shader.decode({color: [0, 0, 255, 255], type: 'color'});
      expect(color).to.be.instanceof(Color);
      expect(color.toString()).to.equal('rgb(0, 0, 255)');
    });

    it('decode converts image shader to Image', function() {
      const image = types.shader.decode({image: ['foo.png', null, null, null], type: 'image'});
      expect(image).to.be.instanceof(Image);
      expect(image.src).to.equal('foo.png');
    });

    it('decodes an encoded gradient shader', function() {
      const encodedShader = types.shader.encode('linear-gradient(red -30%, blue)');
      const decodedShader = types.shader.decode(encodedShader);
      expect(decodedShader).to.be.instanceof(LinearGradient);
      expect(decodedShader).to.deep.equal({colorStops: [[Color.red, {percent: -30}], Color.blue], direction: 180});
    });

    it('decodes an encoded color shader', function() {
      const encodedShader = types.shader.encode(new Color(0, 1, 2));
      const decodedShader = types.shader.decode(encodedShader);
      expect(decodedShader).to.be.instanceof(Color);
      expect(decodedShader.toString()).to.equal('rgb(0, 1, 2)');
    });

    it('decodes an encoded image shader', function() {
      const encodedShader = types.shader.encode(new Image({src: 'foo'}));
      const decodedShader = types.shader.decode(encodedShader);
      expect(decodedShader).to.be.instanceof(Image);
      expect(decodedShader.src).to.equal('foo');
    });

  });

  describe('font', function() {

    it('encode translates "initial" to `undefined`', function() {
      expect(types.FontValue.encode('initial')).to.equal(undefined);
    });

    it('encode translates `null` to `undefined`', function() {
      expect(types.FontValue.encode(null)).to.equal(undefined);
    });

  });

  describe('NativeObject', function() {

    const encode = types.NativeObject.encode;
    const decode = types.NativeObject.decode;

    it('translates widgets to ids in properties', function() {
      const value = new CustomNativeObject();

      expect(encode(value)).to.equal(value.cid);
    });

    it('translates widget collection to first ids in properties', function() {
      const value = new WidgetCollection([new CustomNativeObject()]);

      expect(encode(value)).to.equal(value[0].cid);
    });

    it('does not translate objects with id field to ids', function() {
      const value = {id: '23', name: 'bar'};

      expect(encode(value)).to.equal(value);
    });

    it('translates ids to widgets', function() {
      const value = new CustomNativeObject();

      expect(decode(value.cid)).to.equal(value);
    });

  });

  describe('image', function() {

    const encode = types.ImageValue.encode;
    const decode = types.ImageValue.decode;

    it('succeeds for minimal image value', function() {
      stub(console, 'warn');

      const result = encode({src: 'foo.png'});

      expect(result).to.eql(['foo.png', null, null, null]);
      expect(console.warn).not.to.have.been.called;
    });

    it('succeeds for image with width and height', function() {
      stub(console, 'warn');

      const result = encode({src: 'foo.png', width: 10, height: 10});

      expect(result).to.eql(['foo.png', 10, 10, null]);
      expect(console.warn).not.to.have.been.called;
    });

    it('succeeds for image with scale', function() {
      stub(console, 'warn');

      const result = encode({src: 'foo.png', scale: 1.4});

      expect(result).to.eql(['foo.png', null, null, 1.4]);
      expect(console.warn).not.to.have.been.called;
    });

    it('succeeds for string', function() {
      expect(encode('foo.jpg')).to.eql(['foo.jpg', null, null, null]);
    });

    it('succeeds for string with scale detection via file name', function() {
      expect(encode('foo@2x.jpg')).to.eql(['foo@2x.jpg', null, null, 2]);
      expect(encode('foo@1.4x.jpg')).to.eql(['foo@1.4x.jpg', null, null, 1.4]);
      expect(encode('foo@2.jpg')).to.eql(['foo@2.jpg', null, null, null]);
      expect(encode('foo2x.jpg')).to.eql(['foo2x.jpg', null, null, null]);
      expect(encode('foo2x.jpg')).to.eql(['foo2x.jpg', null, null, null]);
    });

    it('succeeds for object with scale detection via file name', function() {
      expect(encode({src: 'foo@2x.jpg'})).to.eql(['foo@2x.jpg', null, null, 2]);
      expect(encode({src: 'foo@1.4x.jpg'})).to.eql(['foo@1.4x.jpg', null, null, 1.4]);
      expect(encode({src: 'foo@2.jpg'})).to.eql(['foo@2.jpg', null, null, null]);
      expect(encode({src: 'foo2x.jpg'})).to.eql(['foo2x.jpg', null, null, null]);
      expect(encode({src: 'foo2x.jpg'})).to.eql(['foo2x.jpg', null, null, null]);
    });

    it('overrides scale detection with explicit scale or dimensions', function() {
      expect(encode({src: 'foo@2x.jpg', scale: 1})).to.eql(['foo@2x.jpg', null, null, 1]);
      expect(encode({src: 'foo@1.4x.jpg', width: 10})).to.eql(['foo@1.4x.jpg', 10, null, null]);
      expect(encode({src: 'foo@1.4x.jpg', height: 10})).to.eql(['foo@1.4x.jpg', null, 10, null]);
    });

    it('has no scale detection for scale pattern in path', function() {
      expect(encode('foo@2x/bar.jpg')).to.eql(['foo@2x/bar.jpg', null, null, null]);
      expect(encode('foo@3x/bar@2x.jpg')).to.eql(['foo@3x/bar@2x.jpg', null, null, 2]);
    });

    it('succeeds for null', function() {
      expect(encode(null)).to.be.null;
    });

    it('decodes array with scale to Image', function() {
      const image = decode(['foo', null, null, 2]);
      expect(image).to.be.instanceof(Image);
      expect(image.src).to.equal('foo');
      expect(image.scale).to.equal(2);
    });

    it('decodes array with dimensions to Image', function() {
      const image = decode(['foo', 100, 200, null]);
      expect(image).to.be.instanceof(Image);
      expect(image.src).to.equal('foo');
      expect(image.width).to.equal(100);
      expect(image.height).to.equal(200);
    });

    it('fails if image value is not an object', function() {
      expect(() => {
        encode(23);
      }).to.throw(Error, 'Not a valid ImageValue: 23');
    });

    it('fails if src is undefined', function() {
      expect(() => {
        encode({});
      }).to.throw(Error, '"src" missing');
    });

    it('fails if src is empty string', function() {
      expect(() => {
        encode({src: ''});
      }).to.throw(Error, '"src" must not be empty');
    });

    it('fails if src contains invalid ../ segments', function() {
      expect(() => {
        encode({src: '../test.png'});
      }).to.throw(Error, 'Invalid image "src": Path must not start with \'..\'');
    });

    it('fails if width/height/scale values are invalid number', function() {
      const goodValues = [0, 1, 1 / 3, 0.5, Math.PI];
      const badValues = [-1, NaN, 1 / 0, -1 / 0, '1', true, false, {}];
      const props = ['width', 'height', 'scale'];
      const checkWith = function(prop, value) {
        const image = {src: 'foo'};
        image[prop] = value;
        encode(image);
      };

      props.forEach((prop) => {
        goodValues.forEach((value) => {
          expect(() => checkWith(prop, value)).not.to.throw();
        });
        badValues.forEach((value) => {
          expect(() => checkWith(prop, value)).to.throw(Error, `"${prop}" is not a dimension`);
        });
      });
    });

    it('warns if scale and width are given', function() {
      stub(console, 'warn');

      encode.call(class Foo {}, {src: 'foo.png', width: 23, scale: 2});

      expect(console.warn).to.have.been.calledWithMatch(
        'Foo: image "scale" is ignored when "width" and/or "height" are set to a number'
      );
    });

    it('warns if scale and height are given', function() {
      stub(console, 'warn');

      encode.call(class Foo {}, {src: 'foo.png', height: 23, scale: 2});

      expect(console.warn).to.have.been.calledWithMatch(
        'Foo: image "scale" is ignored when "width" and/or "height" are set to a number'
      );
    });

  });

  describe('boolean', function() {

    const encode = types.boolean.encode;

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

    const encode = types.string.encode;

    it('translates null to empty string', function() {
      expect(encode(null)).to.equal('');
      expect(encode(undefined)).to.equal('');
    });

    it('translates other types to string', function() {
      expect(encode('str')).to.equal('str');
      expect(encode(23)).to.equal('23');
      expect(encode(false)).to.equal('false');
      expect(encode({})).to.equal('[object Object]');
      expect(encode([1, 2, 3])).to.equal('1,2,3');
      expect(encode({toString() {return 'foo';}})).to.equal('foo');
    });

  });

  describe('number', function() {

    const encode = types.number.encode;

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
      const values = [NaN, 1 / 0, -1 / 0];
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

    const encode = types.natural.encode;

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
      const values = [NaN, 1 / 0, -1 / 0];
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

    const encode = types.integer.encode;

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
      const values = [NaN, 1 / 0, -1 / 0];
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

    const encode = types.function.encode;

    it('accepts functions', function() {
      const fn = function() {};
      expect(encode(fn)).to.equal(fn);
    });

    it('fails for non-functions', function() {
      const values = ['', 'foo', 23, null, undefined, true, false, {}, []];
      values.forEach((value) => {
        expect(() => {
          encode(value);
        }).to.throw(Error, typeof value + ' is not a function: ' + value);
      });
    });

  });

  describe('choice', function() {

    const encode = types.choice.encode;

    it('allows string values given in array', function() {
      const accepted = ['1', 'foo', 'bar'];

      expect(encode('1', accepted)).to.equal('1');
      expect(encode('foo', accepted)).to.equal('foo');
      expect(encode('bar', accepted)).to.equal('bar');
    });

    it('rejects string values not given in array', function() {
      const accepted = ['x', 'y', 'z'];

      ['1', 'foo', 'bar'].forEach((value) => {
        expect(() => {
          encode(value, accepted);
        }).to.throw(Error, 'Accepting "x", "y", "z", given was: "' + value + '"');
      });
    });

  });

  describe('nullable', function() {

    const encode = types.nullable.encode;

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

    const encode = types.opacity.encode;

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
      const values = [NaN, 1 / 0, -1 / 0];
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

    const encode = types.transform.encode;
    const defaultValue = {
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      translationX: 0,
      translationY: 0,
      translationZ: 0
    };
    const customValue = {
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
      const value = omit(customValue, ['scaleX', 'translationY']);
      const expected = {
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

    const encode = types.array.encode;

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
      const input = [1, 2, 3];
      expect(encode(input)).to.equal(input);
    });

    it('fails for non-arrays', function() {
      const values = [0, 1, '', 'foo', false, true, {}, {length: 0}];
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

  describe('boxDimensions encode', function() {

    const encode = types.boxDimensions.encode;

    it('passes complete number objects', function() {
      expect(encode({left: 1, right: 2, top: 3, bottom: 4})).to.deep.equal({left: 1, right: 2, top: 3, bottom: 4});
    });

    it('normalizes object', function() {
      expect(encode({left: 1, right: '2px', top: '3'})).to.deep.equal({left: 1, right: 2, top: 3, bottom: 0});
    });

    it('converts numbers to objects', function() {
      expect(encode(4)).to.deep.equal({left: 4, right: 4, top: 4, bottom: 4});
    });

    it('converts array of number to objects', function() {
      expect(encode([1, 2, 3, 4])).to.deep.equal({left: 4, right: 2, top: 1, bottom: 3});
      expect(encode([1, 2, 3])).to.deep.equal({left: 2, right: 2, top: 1, bottom: 3});
      expect(encode([1, 2])).to.deep.equal({left: 2, right: 2, top: 1, bottom: 1});
      expect(encode([1])).to.deep.equal({left: 1, right: 1, top: 1, bottom: 1});
      expect(encode([null])).to.deep.equal({left: 0, right: 0, top: 0, bottom: 0});
    });

    it('converts array of string to objects', function() {
      expect(encode(['1', '2px', 3, 4])).to.deep.equal({left: 4, right: 2, top: 1, bottom: 3});
    });

    it('converts space separated strings to objects', function() {
      expect(encode('1 2  3 4')).to.deep.equal({left: 4, right: 2, top: 1, bottom: 3});
      expect(encode('1 2 3 ')).to.deep.equal({left: 2, right: 2, top: 1, bottom: 3});
      expect(encode(' 1 2')).to.deep.equal({left: 2, right: 2, top: 1, bottom: 1});
      expect(encode(' 1 ')).to.deep.equal({left: 1, right: 1, top: 1, bottom: 1});
    });

    it('converts space separated strings with unit to objects', function() {
      expect(encode('1px 2px 3px 4px')).to.deep.equal({left: 4, right: 2, top: 1, bottom: 3});
      expect(encode('1px')).to.deep.equal({left: 1, right: 1, top: 1, bottom: 1});
    });

    it('converts null to 0', function() {
      expect(encode(null)).to.deep.equal({left: 0, right: 0, top: 0, bottom: 0});
    });

    it('fails for invalid types', function() {
      expect(() => encode('foo')).to.throw(Error, 'Invalid type: foo');
      expect(() => encode(false)).to.throw(Error, 'Invalid type: false');
      expect(() => encode(true)).to.throw(Error, 'Invalid type: true');
      expect(() => encode([])).to.throw(Error, 'Invalid type: []');
      expect(() => encode([1, 2, 3, 4, 5])).to.throw(Error, 'Invalid type: [ 1, 2, 3, 4, 5 ]');
      expect(() => encode(['foo'])).to.throw(Error, 'Invalid type: [ \'foo\' ]');
    });

  });

});
