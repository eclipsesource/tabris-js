import {expect, mockTabris, restore, createBitmap} from '../test';
import ClientMock from './ClientMock';
import WidgetCollection from '../../src/tabris/WidgetCollection';
import {types} from '../../src/tabris/property-types';
import {omit, getBytes} from '../../src/tabris/util';
import Color from '../../src/tabris/Color';
import Image from '../../src/tabris/Image';
import LinearGradient from '../../src/tabris/LinearGradient';
import Font from '../../src/tabris/Font';
import Widget from '../../src/tabris/Widget';
import Blob from '../../src/tabris/Blob';

describe('property-types', function() {

  // Allow creating instances of NativeObject
  class CustomNativeObject extends Widget {
    get _nativeType() { return 'CustomNativeObject'; }
  }

  /** @type {ClientMock} */
  let client;

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
  });

  afterEach(restore);

  describe('ColorValue', function() {

    it('convert translates falsy values to "initial"`', function() {
      expect(types.ColorValue.convert(null)).to.equal('initial');
      expect(types.ColorValue.convert(undefined)).to.equal('initial');
      expect(types.ColorValue.convert('')).to.equal('initial');
      expect(types.ColorValue.convert('initial')).to.equal('initial');
    });

    it('convert translates color values to Color instance`', function() {
      expect(types.ColorValue.convert('#ff00ff')).to.deep.equal(new Color(255, 0, 255));
      expect(types.ColorValue.convert([255, 0, 255])).to.deep.equal(new Color(255, 0, 255));
    });

    it('convert keeps same Color instance`', function() {
      const color = new Color(255, 0, 255);
      expect(types.ColorValue.convert(color)).to.equal(color);
      expect(types.ColorValue.convert(color)).not.to.equal(new Color(255, 0, 255));
    });

    it('encode translates "initial" to `undefined`', function() {
      expect(types.ColorValue.encode('initial')).to.equal(undefined);
    });

    it('encode Color instance to color array', function() {
      expect(types.ColorValue.encode(new Color(255, 0, 255))).to.deep.equal([255, 0, 255, 255]);
    });

    it('decode translates `null` to `initial`', function() {
      expect(types.ColorValue.decode(null)).to.equal('initial');
    });

  });

  describe('Shader', function() {

    describe('convert', function() {

      const convert = types.Shader.convert;

      it('throws for invalid values', function() {
        expect(() => convert(12)).to.throw('12 must be a valid ImageValue, LinearGradientValue or ColorValue');
        expect(() => convert('linear-gradient(to right bottom, blue, red)'))
          .to.throw('Invalid direction "right bottom". Corners are not supported.');
      });

      it('converts falsy values to "initial', function() {
        expect(convert(null)).to.equal('initial');
        expect(convert(undefined)).to.equal('initial');
        expect(convert('')).to.equal('initial');
        expect(convert('initial')).to.equal('initial');
      });

      it('converts linear string to a LinearGradient instance', function() {
        const instance = /** @type {LinearGradient} */(convert('linear-gradient(red -30%, blue)'));
        expect(instance).to.be.instanceOf(LinearGradient);
      });

      it('passes through LinearGradient gradient', function() {
        const gradient = new LinearGradient([new Color(0, 1, 2), new Color(0, 1, 2)], 0);
        expect(convert(gradient)).to.equal(gradient);
      });

      it('converts image uri values to Image instance', function() {
        expect(convert('foo.png')).to.be.instanceOf(Image);
        expect(convert({src: 'foo.png'})).to.be.instanceOf(Image);
      });

      it('converts bitmap to Image instance', function() {
        return createBitmap(client).then(({bitmap}) => {
          const result = convert(bitmap);
          expect(result).be.instanceOf(Image);
          expect(result.src).be.equal(bitmap);
        });
      });

      it('converts blob to Image instance', function() {
        const blob = new Blob([new Uint8Array([0, 1, 3])]);
        const result = convert(blob);
        expect(result).to.be.instanceOf(Image);
        expect(result.src).be.equal(blob);
      });

      it('passes through Image instance', function() {
        return createBitmap(client).then(({bitmap}) => {
          const image = new Image({src: bitmap});

          const result = convert(image);

          expect(result).to.equal(image);
          expect(result.src).be.equal(bitmap);
        });
      });

      it('converts color values to Color instance', function() {
        expect(convert('#ff00ff')).to.be.instanceOf(Color);
        expect(convert({red: 255, green: 0, blue: 255})).to.be.instanceOf(Color);
      });

      it('passes through Color instance', function() {
        const color = new Color(0, 1, 3);
        expect(convert(color)).to.equal(color);
      });

    });

    describe('encode', function() {

      const encode = types.Shader.encode;

      it('translates "initial" to `null`', function() {
        expect(encode('initial')).to.be.null;
      });

      it('translates Image instance to image shader', function() {
        expect(encode(new Image({src: 'foo.png', scale: 2}))).to.deep.equal({
          type: 'image',
          image: {
            type: 'uri',
            src: 'foo.png',
            width: null, height: null, scale: 2
          }
        });
      });

      it('translates LinearGradient instance to linear gradient shader', function() {
        expect(encode(LinearGradient.from('linear-gradient(red -30%, blue)'))).to.deep.equal({
          type: 'linearGradient',
          angle: 180,
          colors: [
            [[255, 0, 0, 255], -0.3],
            [[0, 0, 255, 255], null]
          ]
        });
      });

      it('translates Color instance to color shader', function() {
        expect(encode(new Color(255, 0, 255))).to.deep.equal({
          type: 'color',
          color: [255, 0, 255, 255]
        });
      });

    });

  });

  describe('FontValue', function() {

    it('convert translates falsy values to "initial"', function() {
      expect(types.FontValue.convert(null)).to.equal('initial');
      expect(types.FontValue.convert(undefined)).to.equal('initial');
      expect(types.FontValue.convert('')).to.equal('initial');
    });

    it('encode translates "initial" to `undefined`', function() {
      expect(types.FontValue.encode('initial')).to.equal(undefined);
    });

    it('encode passes through Font instance`', function() {
      const font = new Font(12);
      expect(types.FontValue.encode(font)).to.equal(font);
    });

  });

  describe('Widget', function() {

    const convert = types.Widget.convert;
    const encode = types.Widget.encode;

    it('convert translates falsy values to null', function() {
      expect(convert(null)).to.be.null;
      expect(convert(undefined)).to.be.null;
      expect(convert('')).to.be.null;
    });

    it('convert picks first entry of WidgetCollection', function() {
      const value = new WidgetCollection([new CustomNativeObject()]);

      expect(convert(value)).to.equal(value.first());
    });

    it('convert does not accept arbitrary objects with cid property', function() {
      /** @type {any} */
      const value = {cid: '23', name: 'bar'};

      expect(() => convert(value)).to.throw('Not a valid widget: ');
    });

    it('encode translates widget to cid', function() {
      const value = new CustomNativeObject();

      expect(encode(value)).to.equal(value.cid);
    });

    it('encode passes through null', function() {
      expect(encode(null)).to.be.null;
    });

  });

  describe('ImageValue', function() {

    describe('convert', function() {

      const convert = types.ImageValue.convert;

      it('translates falsy values to null', function() {
        expect(convert(null)).to.be.null;
        expect(convert(undefined)).to.be.null;
        expect(convert('')).to.be.null;
      });

      it('translates image uri values to Image instance', function() {
        expect(convert({src: 'foo.png'})).to.be.instanceOf(Image);
        expect(convert('foo.png')).to.be.instanceOf(Image);
      });

      it('fails if value is not an image value', function() {
        expect(() => convert(/** @type {any} */(23))).to.throw(Error, '23 is not a valid ImageValue');
        expect(() => convert({})).to.throw(Error, '"src" missing');
      });

      it('passes through Image instance', function() {
        const image = new Image({src: 'foo.png'});

        expect(convert(image)).to.equal(image);
      });

      it('keeps blob instance', function() {
        const blob = new Blob([new Uint8Array(12)]);
        const image = Image.from(blob);

        expect(convert(image).src).to.equal(blob);
        expect(convert(blob).src).to.equal(blob);
      });

      it('keeps ImageBitmap instance', function() {
        return createBitmap(client).then(({bitmap}) => {
          const image = Image.from(bitmap);

          expect(convert(image).src).to.equal(bitmap);
          expect(convert(bitmap).src).to.equal(bitmap);
        });
      });

      it('rejects image object with closed ImageBitmap', function() {
        return createBitmap(client).then(({bitmap}) => {
          const image = new Image({src: bitmap});
          bitmap.close();
          expect(() => convert(image)).to.throw('ImageBitmap is closed');
        });
      });

    });

    describe('encode', function() {

      const encode = types.ImageValue.encode;

      it('passes through null', function() {
        expect(encode(null)).to.be.null;
      });

      it('succeeds for image with explicit width and height', function() {
        const result = encode(Image.from({src: 'foo.png', width: 10, height: 20}));

        expect(result).to.deep.equal({
          type: 'uri',
          src: 'foo.png',
          width: 10,
          height: 20,
          scale: null
        });
      });

      it('succeeds for image with scale', function() {
        const result = encode(Image.from({src: 'foo.png', scale: 1.4}));
        expect(result).to.deep.equal({
          type: 'uri',
          src: 'foo.png',
          width: null, height: null,
          scale: 1.4
        });
      });

      it('succeeds for image without scale or dimension', function() {
        expect(encode(Image.from('foo.jpg'))).to.deep.equal({
          type: 'uri',
          src: 'foo.jpg',
          width: null, height: null, scale: null
        });
      });

      it('succeeds for uri src', function() {
        return createBitmap(client).then(({bitmap, id}) => {
          expect(encode(Image.from(bitmap))).to.deep.equal({
            type: 'imageBitmap',
            src: id,
            width: null, height: null, scale: null
          });
        });
      });

      it('succeeds for Blob src', function() {
        const blob = new Blob([new Uint8Array([0, 1, 2])]);
        expect(encode(blob)).to.deep.equal({
          type: 'encodedImage',
          src: getBytes(blob),
          width: null, height: null, scale: null
        });
      });

      it('succeeds for ImageBitmap src', function() {
        return createBitmap(client).then(({bitmap, id}) => {
          expect(encode(Image.from(bitmap))).to.deep.equal({
            type: 'imageBitmap',
            src: id,
            width: null, height: null, scale: null
          });
        });
      });

    });

  });

  describe('boolean', function() {

    const convert = types.boolean.convert;
    const decode = types.boolean.decode;

    it('convert passes through boolean', function() {
      expect(convert(true)).to.be.true;
      expect(convert(false)).to.be.false;
    });

    it('convert translates falsy values', function() {
      expect(convert(null)).to.be.false;
      expect(convert('')).to.be.false;
      expect(convert(undefined)).to.be.false;
      expect(convert(0)).to.be.false;
    });

    it('convert translates truthy values', function() {
      expect(convert(1)).to.be.true;
      expect(convert({})).to.be.true;
      expect(convert('true')).to.be.true;
    });

    // This is relevant for ClientMock support:
    it('decodes undefined to false', function() {
      expect(decode(undefined)).to.be.false;
    });

  });

  describe('string', function() {

    const convert = types.string.convert;
    const decode = types.string.decode;

    it('convert translates null/undefined to empty string', function() {
      expect(convert(null)).to.equal('');
      expect(convert(undefined)).to.equal('');
    });

    it('translates other types to string', function() {
      expect(convert('str')).to.equal('str');
      expect(convert(23)).to.equal('23');
      expect(convert(false)).to.equal('false');
      expect(convert({})).to.equal('[object Object]');
      expect(convert([1, 2, 3])).to.equal('1,2,3');
      expect(convert({toString() {return 'foo';}})).to.equal('foo');
    });

    // This is relevant for ClientMock support:
    it('decodes undefined to empty string', function() {
      expect(decode(undefined)).to.equal('');
    });

  });

  describe('number', function() {

    const convert = types.number.convert;
    const decode = types.number.decode;

    it('fails for non-numbers', function() {
      expect(() => convert(true)).to.throw(Error, 'true is not a number');
      expect(() => convert('23x')).to.throw(Error, '"23x" is not a number');
      expect(() => convert({})).to.throw(Error, '{} is not a number');
      expect(() => convert([])).to.throw(Error, '[] is not a number');
    });

    it('fails for invalid numbers', function() {
      [NaN, 1 / 0, -1 / 0].forEach((value) => {
        expect(() => convert(value)).to.throw(Error, value + ' is not a valid number');
      });
    });

    it('accepts all valid kinds of numbers', function() {
      expect(convert(0)).to.equal(0);
      expect(convert(1)).to.equal(1);
      expect(convert(-1)).to.equal(-1);
      expect(convert(10e10)).to.equal(10e10);
      expect(convert(10e-10)).to.equal(10e-10);
    });

    it('accepts strings', function() {
      expect(convert('0')).to.equal(0);
      expect(convert('1')).to.equal(1);
      expect(convert('-1')).to.equal(-1);
      expect(convert('3.14')).to.equal(3.14);
      expect(convert('-3.14')).to.equal(-3.14);
      expect(convert('.01')).to.equal(0.01);
      expect(convert('43px')).to.equal(43);
    });

    it('converts falsy values to 0', function() {
      expect(convert('')).to.equal(0);
      expect(convert(null)).to.equal(0);
      expect(convert(undefined)).to.equal(0);
      expect(convert(false)).to.equal(0);
    });

    // This is relevant for ClientMock support:
    it('decodes undefined to 0', function() {
      expect(decode(undefined)).to.equal(0);
    });

  });

  describe('natural', function() {

    const convert = types.natural.convert;
    const decode = types.natural.decode;

    it('convert fails for non-numbers', function() {
      expect(() => convert(true)).to.throw(Error, 'true is not a number');
      expect(() => convert('23x')).to.throw(Error, '"23x" is not a number');
      expect(() => convert({})).to.throw(Error, '{} is not a number');
      expect(() => convert([])).to.throw(Error, '[] is not a number');
    });

    it('convert fails for invalid numbers', function() {
      [NaN, 1 / 0, -1 / 0].forEach((value) => {
        expect(() => convert(value)).to.throw(Error, value + ' is not a valid number');
      });
    });

    it('convert accepts natural number including zero', function() {
      expect(convert(0)).to.equal(0);
      expect(convert(1)).to.equal(1);
      expect(convert(10e10)).to.equal(10e10);
    });

    it('convert normalizes negative values', function() {
      expect(convert(-1)).to.equal(0);
      expect(convert(-1.5)).to.equal(0);
    });

    it('convert rounds given value', function() {
      expect(convert(0.4)).to.equal(0);
      expect(convert(1.1)).to.equal(1);
      expect(convert(1.9)).to.equal(2);
    });

    it('convert translates strings', function() {
      expect(convert('0')).to.equal(0);
      expect(convert('1')).to.equal(1);
      expect(convert('-1')).to.equal(0);
      expect(convert('0.7')).to.equal(1);
      expect(convert('43px')).to.equal(43);
    });

    it('converts falsy values to 0', function() {
      expect(convert('')).to.equal(0);
      expect(convert(null)).to.equal(0);
      expect(convert(undefined)).to.equal(0);
      expect(convert(false)).to.equal(0);
    });

    // This is relevant for ClientMock support:
    it('decode translates undefined to 0', function() {
      expect(decode(undefined)).to.equal(0);
    });

  });

  describe('fraction', function() {

    const convert = types.fraction.convert;

    it('fails for non-numbers', function() {
      expect(() => convert(true)).to.throw(Error, 'true is not a number');
      expect(() => convert('23x')).to.throw(Error, '"23x" is not a number');
      expect(() => convert({})).to.throw(Error, '{} is not a number');
      expect(() => convert([])).to.throw(Error, '[] is not a number');
    });

    it('fails for invalid numbers', function() {
      const values = [NaN, 1 / 0, -1 / 0];
      values.forEach((value) => {
        expect(() => {
          convert(value);
        }).to.throw(Error, value + ' is not a valid number');
      });
    });

    it('clamps out-of-bounds numbers', function() {
      expect(convert(-1)).to.equal(0);
      expect(convert(-0.1)).to.equal(0);
      expect(convert(1.1)).to.equal(1);
      expect(convert(1e10)).to.equal(1);
    });

    it('accepts strings', function() {
      expect(convert('0')).to.equal(0);
      expect(convert('0.1')).to.equal(0.1);
      expect(convert('1')).to.equal(1);
    });

    it('accepts natural numbers between (including) zero and one', function() {
      expect(convert(0)).to.equal(0);
      expect(convert(0.5)).to.equal(0.5);
      expect(convert(1)).to.equal(1);
    });

    it('converts falsy values to 0', function() {
      expect(convert('')).to.equal(0);
      expect(convert(null)).to.equal(0);
      expect(convert(undefined)).to.equal(0);
      expect(convert(false)).to.equal(0);
    });

  });

  describe('Transformation', function() {

    const convert = types.Transformation.convert;
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

    it('convert accepts complete, valid values', function() {
      expect(convert(defaultValue)).to.deep.equal(defaultValue);
      expect(convert(customValue)).to.deep.equal(customValue);
    });

    it('convert returns frozen copy', function() {
      const orgValue = Object.assign({}, customValue);
      const converted = convert(orgValue);

      converted.translationX = 100;

      expect(converted).not.to.equal(orgValue);
      expect(converted).to.deep.equal(orgValue);
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
      expect(convert(value)).to.deep.equal(expected);
      expect(convert({})).to.deep.equal(defaultValue);
    });

    it('fails for invalid numbers', function() {
      [
        {scaleY: NaN},
        {translationX: 1 / 0},
        {translationY: -1 / 0},
        {translationZ: 1 / 0}
      ].forEach((value) => {
        expect(() => {
          convert(value);
        }).to.throw();
      });
    });

    it('fails for unknown keys', function() {
      expect(() => convert({foo: 1})).to.throw(Error, 'contains unexpected entry "foo"');
    });

  });

  describe('BoxDimensions', function() {

    const convert = types.BoxDimensions.convert;

    it('passes complete number objects', function() {
      expect(convert({left: 1, right: 2, top: 3, bottom: 4})).to.deep.equal({left: 1, right: 2, top: 3, bottom: 4});
    });

    it('normalizes object', function() {
      expect(convert({left: 1, right: '2px', top: '3'})).to.deep.equal({left: 1, right: 2, top: 3, bottom: 0});
    });

    it('translates numbers to objects', function() {
      expect(convert(4)).to.deep.equal({left: 4, right: 4, top: 4, bottom: 4});
      expect(convert(-1)).to.deep.equal({left: 0, right: 0, top: 0, bottom: 0});
    });

    it('translates array of number to objects', function() {
      expect(convert([1, 2, 3, 4])).to.deep.equal({left: 4, right: 2, top: 1, bottom: 3});
      expect(convert([1, 2, 3])).to.deep.equal({left: 2, right: 2, top: 1, bottom: 3});
      expect(convert([1, 2])).to.deep.equal({left: 2, right: 2, top: 1, bottom: 1});
      expect(convert([1])).to.deep.equal({left: 1, right: 1, top: 1, bottom: 1});
      expect(convert([null])).to.deep.equal({left: 0, right: 0, top: 0, bottom: 0});
    });

    it('translates array of string to objects', function() {
      expect(convert(['1', '2px', 3, 4])).to.deep.equal({left: 4, right: 2, top: 1, bottom: 3});
    });

    it('translates space separated strings to objects', function() {
      expect(convert('1 2  3 4')).to.deep.equal({left: 4, right: 2, top: 1, bottom: 3});
      expect(convert('1 2 3 ')).to.deep.equal({left: 2, right: 2, top: 1, bottom: 3});
      expect(convert(' 1 2')).to.deep.equal({left: 2, right: 2, top: 1, bottom: 1});
      expect(convert(' 1 ')).to.deep.equal({left: 1, right: 1, top: 1, bottom: 1});
    });

    it('translates space separated strings with unit to objects', function() {
      expect(convert('1px 2px 3px 4px')).to.deep.equal({left: 4, right: 2, top: 1, bottom: 3});
      expect(convert('1px')).to.deep.equal({left: 1, right: 1, top: 1, bottom: 1});
    });

    it('translates falsy values to 0', function() {
      expect(convert(null)).to.deep.equal({left: 0, right: 0, top: 0, bottom: 0});
      expect(convert(undefined)).to.deep.equal({left: 0, right: 0, top: 0, bottom: 0});
      expect(convert(false)).to.deep.equal({left: 0, right: 0, top: 0, bottom: 0});
    });

    it('fails for invalid types', function() {
      expect(() => convert('foo')).to.throw(Error, '"foo" is not a valid BoxDimensions value');
      expect(() => convert(true)).to.throw(Error, 'true is not a valid BoxDimensions value');
      expect(() => convert([])).to.throw(Error, '[] is not a valid BoxDimensions value');
      expect(() => convert([1, 2, 3, 4, 5])).to.throw(Error, '[1, 2, 3, 4, 5] is not a valid BoxDimensions value');
      expect(() => convert(['foo'])).to.throw(Error, '["foo"] is not a valid BoxDimensions value');
    });

  });

  describe('Bounds', function() {

    const decode = types.Bounds.decode;

    it('decodes array', function() {
      expect(decode([1, 2, 3, 4])).to.deep.equal({left: 1, top: 2, width: 3, height: 4});
    });

    // This is relevant for ClientMock support:
    it('decodes undefined to default values', function() {
      expect(decode(undefined)).to.deep.equal({left: 0, top: 0, width: 0, height: 0});
    });

  });

});
