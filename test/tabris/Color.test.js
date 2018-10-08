import Color from '../../src/tabris/Color';
import {expect} from '../test';

describe('Color', function() {

  describe('constructor', function() {

    it('creates instance from four valid parameters', function() {
      const color = new Color(255, 0, 128, 100);

      expect(color.red).to.equal(255);
      expect(color.green).to.equal(0);
      expect(color.blue).to.equal(128);
      expect(color.alpha).to.equal(100);
    });

    it('creates instance from three valid parameters', function() {
      const color = new Color(255, 0, 128);

      expect(color.red).to.equal(255);
      expect(color.green).to.equal(0);
      expect(color.blue).to.equal(128);
      expect(color.alpha).to.equal(255);
    });

    it('rounds parameters', function() {
      const color = new Color(254.4, 0.9, 128, 0.11);

      expect(color.red).to.equal(254);
      expect(color.green).to.equal(1);
      expect(color.blue).to.equal(128);
      expect(color.alpha).to.equal(0);
    });

    it('throws for invalid parameters', function() {
      expect(() => new Color()).to.throw('Not enough arguments');
      expect(() => new Color(0, 0)).to.throw('Not enough arguments');
      expect(() => new Color(0, 0, 0, 0, 0)).to.throw('Too many arguments');
      expect(() => new Color(-1, 0, 0)).to.throw('Number -1 out of range');
      expect(() => new Color(0, 256, 0)).to.throw('Number 256 out of range');
      expect(() => new Color(0, 'foo', 0)).to.throw('Invalid number foo');
      expect(() => new Color(0, 0, 0, 'bar')).to.throw('Invalid number bar');
      expect(() => new Color(0, NaN, 0)).to.throw('Invalid number NaN');
      expect(() => new Color(0, Infinity, 0)).to.throw('Invalid number Infinity');
      expect(() => new Color(0, 0, 0, -0.1)).to.throw('Number -0.1 out of range');
      expect(() => new Color(0, 0, 0, 255.1)).to.throw('Number 255.1 out of range');
    });

  });

  describe('instance', function () {

    it('properties are read-only', function() {
      const color = new Color(255, 128, 0, 100);

      color.red = 1;
      color.green = 1;
      color.blue = 1;
      color.alpha = 200;

      expect(color.red).to.equal(255);
      expect(color.green).to.equal(128);
      expect(color.blue).to.equal(0);
      expect(color.alpha).to.equal(100);
    });

    describe('toString', function() {

      it('returns color string in rgb format', function() {
        expect(new Color(170, 255, 0).toString()).to.equal('rgb(170, 255, 0)');
      });

      it('returns color string in rgba format', function() {
        expect(new Color(170, 255, 0, 128).toString()).to.equal('rgba(170, 255, 0, 0.5)');
      });

    });

    describe('toArray', function() {

      it('returns 4 entry color array', function() {
        expect(new Color(170, 255, 0).toArray()).to.deep.equal([170, 255, 0, 255]);
      });

    });

    it('properties are enumerable', function() {
      expect(Object.assign({}, new Color(170, 255, 0))).to.deep.equal({red: 170, green: 255, blue: 0, alpha: 255});
    });

  });

  describe('from', function() {

    it('return color instances', function() {
      expect(Color.from('#00ff00')).to.be.instanceOf(Color);
      expect(Color.from([0, 255, 0])).to.be.instanceOf(Color);
      expect(Color.from(new Color(0, 255, 0))).to.be.instanceOf(Color);
      expect(Color.from({red: 0, green: 255, blue: 0})).to.be.instanceOf(Color);
    });

    it('passes through color object', function() {
      const color = new Color(1, 2, 3);
      expect(Color.from(color)).to.equal(color);
    });

    it('accepts 3 entry array', function() {
      expect(Color.from([0, 255, 0]).toArray()).to.deep.equal([0, 255, 0, 255]);
    });

    it('accepts 4 entry array', function() {
      expect(Color.from([0, 255, 0, 0]).toArray()).to.deep.equal([0, 255, 0, 0]);
    });

    it('rejects 2 entry array', function() {
      expect(() => {
        Color.from([0, 255]);
      }).to.throw('Color array too short');
    });

    it('rejects 5 entry array', function() {
      expect(() => {
        Color.from([0, 255, 0, 0, 0]);
      }).to.throw('Color array too long');
    });

    it('accepts Color-like object without alpha', function() {
      expect(Color.from({red: 1, green: 2, blue: 3}).toArray()).to.deep.equal([1, 2, 3, 255]);
    });

    it('accepts Color-like object with alpha', function() {
      expect(Color.from({red: 0, green: 255, blue: 3, alpha: 4}).toArray()).to.deep.equal([0, 255, 3, 4]);
    });

    it('rejects Color-like object with missing channel', function() {
      expect(() => {
        Color.from({red: 255, green: 255,  alpha: 0});
      }).to.throw('Color-like object missing blue value');
    });

    it('accepts Color-like object with additional properties', function() {
      expect(Color.from({red: 1, green: 2, blue: 3, alpha: 4, foo: 'bar'}).toArray()).to.deep.equal([1, 2, 3, 4]);
    });

    it('accepts color string of form #xxxxxx', function() {
      expect(Color.from('#aaff00').toArray()).to.deep.equal([170, 255, 0, 255]);
    });

    it('accepts color string of form #xxxxxx with mixed upper/lower case', function() {
      expect(Color.from('#aaFF00').toArray()).to.deep.equal([170, 255, 0, 255]);
    });

    it('accepts color string of form #xxx', function() {
      expect(Color.from('#af0').toArray()).to.deep.equal([170, 255, 0, 255]);
    });

    it('accepts color string of form #xxx with mixed upper/lower case', function() {
      expect(Color.from('#aF0').toArray()).to.deep.equal([170, 255, 0, 255]);
    });

    it('accepts color string of form #xxxxxxxx', function() {
      expect(Color.from('#aaff00cc').toArray()).to.deep.equal([170, 255, 0, 204]);
    });

    it('accepts color string of form #xxxxxxxx with mixed upper/lower case', function() {
      expect(Color.from('#aaFF00CC').toArray()).to.deep.equal([170, 255, 0, 204]);
    });

    it('accepts color string of form #xxxx', function() {
      expect(Color.from('#ff06').toArray()).to.deep.equal([255, 255, 0, 102]);
    });

    it('accepts color string of form #xxxx with mixed upper/lower case', function() {
      expect(Color.from('#aBcD').toArray()).to.deep.equal([170, 187, 204, 221]);
    });

    it('accepts rgb function strings', function() {
      expect(Color.from('rgb(12, 34, 56)').toArray()).to.deep.equal([12, 34, 56, 255]);
    });

    it('clips out-of-range values in rgb', function() {
      expect(Color.from('rgb(-12, 34, 560)').toArray()).to.deep.equal([0, 34, 255, 255]);
    });

    it('rejects rgb function strings with wrong argument count', function() {
      expect(() => {
        Color.from('rgb(23, 42)');
      }).to.throw();
    });

    it('rejects rgb function strings with illegal format in argument', function() {
      expect(() => {
        Color.from('rgb(xxx, 23, 42)');
      }).to.throw();
    });

    it('accepts rgba function strings', function() {
      expect(Color.from('rgba(12, 34, 56, 0.5)').toArray()).to.deep.equal([12, 34, 56, 128]);
    });

    it('clips out-of-range values in rgba', function() {
      expect(Color.from('rgba(-12, 34, 560, 2.5)').toArray()).to.deep.equal([0, 34, 255, 255]);
    });

    it('rejects rgba function strings with wrong argument count', function() {
      expect(() => {
        Color.from('rgba(23, 42, 47)');
      }).to.throw();
    });

    it('rejects rgba function strings with illegal format in color value', function() {
      expect(() => {
        Color.from('rgba(xxx, 23, 42)');
      }).to.throw();
    });

    it('rejects rgba function strings with illegal format in alpha value', function() {
      expect(() => {
        Color.from('rgba(0, 23, 42, 2..0)');
      }).to.throw();
    });

    it('accepts color names', function() {
      expect(Color.from('navy').toArray()).to.deep.equal([0, 0, 128, 255]);
    });

    it("accepts 'transparent'", function() {
      expect(Color.from('transparent').toArray()).to.deep.equal([0, 0, 0, 0]);
    });

    it('rejects unknown strings', function() {
      expect(() => {
        Color.from('unknown');
      }).to.throw();
    });

  });

  describe('isColorValue', function() {

    it('returns true for color values including null and "initial"', function() {
      expect(Color.isColorValue(null)).to.be.true;
      expect(Color.isColorValue('initial')).to.be.true;
      expect(Color.isColorValue(new Color(0, 0, 0))).to.be.true;
      expect(Color.isColorValue([0, 0, 0])).to.be.true;
      expect(Color.isColorValue([0, 0, 0, 0])).to.be.true;
      expect(Color.isColorValue('rgb(0, 0, 0)')).to.be.true;
      expect(Color.isColorValue('rgba(0, 0, 0, 0)')).to.be.true;
      expect(Color.isColorValue('#00000000')).to.be.true;
      expect(Color.isColorValue('#000000')).to.be.true;
      expect(Color.isColorValue('#000')).to.be.true;
      expect(Color.isColorValue({red: 0, green: 0, blue: 0})).to.be.true;
      expect(Color.isColorValue({red: 0, green: 0, blue: 0, alpha: 0})).to.be.true;
      expect(Color.isColorValue({red: 0, green: 0, blue: 0, foo: 0})).to.be.true;
    });

    it('returns false for non-color values', function() {
      expect(Color.isColorValue([0, 0])).to.be.false;
      expect(Color.isColorValue([0, 0, 0, 0, 0])).to.be.false;
      expect(Color.isColorValue('rgba(0, 0, 0')).to.be.false;
      expect(Color.isColorValue('#0000000000')).to.be.false;
      expect(Color.isColorValue({red: 0, green: 0})).to.be.false;
    });

  });

  describe('isValidColorValue', function() {

    it('returns true for color values', function() {
      expect(Color.isValidColorValue(new Color(0, 0, 0))).to.be.true;
      expect(Color.isValidColorValue([0, 0, 0])).to.be.true;
      expect(Color.isValidColorValue([0, 0, 0, 0])).to.be.true;
      expect(Color.isValidColorValue('rgb(0, 0, 0)')).to.be.true;
      expect(Color.isValidColorValue('rgba(0, 0, 0, 0)')).to.be.true;
      expect(Color.isValidColorValue('#00000000')).to.be.true;
      expect(Color.isValidColorValue('#000000')).to.be.true;
      expect(Color.isValidColorValue('#000')).to.be.true;
      expect(Color.isValidColorValue({red: 0, green: 0, blue: 0})).to.be.true;
      expect(Color.isValidColorValue({red: 0, green: 0, blue: 0, alpha: 0})).to.be.true;
      expect(Color.isValidColorValue({red: 0, green: 0, blue: 0, foo: 0})).to.be.true;
    });

    it('returns false for non-color values including null and "initial"', function() {
      expect(Color.isValidColorValue(null)).to.be.false;
      expect(Color.isValidColorValue('initial')).to.be.false;
      expect(Color.isValidColorValue([0, 0])).to.be.false;
      expect(Color.isValidColorValue([0, 0, 0, 0, 0])).to.be.false;
      expect(Color.isValidColorValue('rgba(0, 0, 0, 255')).to.be.false;
      expect(Color.isValidColorValue('#0000000000')).to.be.false;
      expect(Color.isValidColorValue({red: 0, green: 0})).to.be.false;
    });

  });

  describe('consts', function() {

    const names = [
      'black', 'silver', 'gray', 'white', 'maroon', 'red', 'purple', 'fuchsia',
      'green', 'lime', 'olive', 'yellow', 'navy', 'blue', 'teal','aqua'
    ];

    it('types', function() {
      names.forEach(name => expect(Color[name]).to.be.instanceOf(Color));
    });

    it('values', function() {
      expect(Color.black.toArray()).to.deep.equal([0, 0, 0, 255]);
      expect(Color.silver.toArray()).to.deep.equal([192, 192, 192, 255]);
      expect(Color.gray.toArray()).to.deep.equal([128, 128, 128, 255]);
      expect(Color.white.toArray()).to.deep.equal([255, 255, 255, 255]);
      expect(Color.maroon.toArray()).to.deep.equal([128, 0, 0, 255]);
      expect(Color.red.toArray()).to.deep.equal([255, 0, 0, 255]);
      expect(Color.purple.toArray()).to.deep.equal([128, 0, 128, 255]);
      expect(Color.fuchsia.toArray()).to.deep.equal([255, 0, 255, 255]);
      expect(Color.green.toArray()).to.deep.equal([0, 128, 0, 255]);
      expect(Color.lime.toArray()).to.deep.equal([0, 255, 0, 255]);
      expect(Color.olive.toArray()).to.deep.equal([128, 128, 0, 255]);
      expect(Color.yellow.toArray()).to.deep.equal([255, 255, 0, 255]);
      expect(Color.navy.toArray()).to.deep.equal([0, 0, 128, 255]);
      expect(Color.blue.toArray()).to.deep.equal([0, 0, 255, 255]);
      expect(Color.teal.toArray()).to.deep.equal([0, 128, 128, 255]);
      expect(Color.aqua.toArray()).to.deep.equal([0, 255, 255, 255]);
    });

    it('readonly', function() {
      names.forEach(name => Color[name] = null);
      names.forEach(name => expect(Color[name]).to.be.instanceOf(Color));
    });

  });

});
