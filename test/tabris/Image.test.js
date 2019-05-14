import Image from '../../src/tabris/Image';
import {expect, spy, restore} from '../test';

describe('Image', function() {

  afterEach(restore);

  describe('constructor', function() {

    it('creates instance', function() {
      expect(new Image({src: 'foo'})).to.deep.equal({src: 'foo', width: 'auto', height: 'auto', scale: 'auto'});
      expect(new Image({src: 'foo', width: 5})).to.deep.equal({src: 'foo', width: 5, height: 'auto', scale: 'auto'});
      expect(new Image({src: 'foo', height: 5})).to.deep.equal({src: 'foo', width: 'auto', height: 5, scale: 'auto'});
      expect(new Image({src: 'foo', width: 5, height: 6})).to.deep.equal({
        src: 'foo',
        width: 5,
        height: 6,
        scale: 'auto'
      });
      expect(new Image({src: 'foo', scale: 5})).to.deep.equal({
        src: 'foo',
        width: 'auto',
        height: 'auto',
        scale: 5
      });
    });

    it('throws for invalid parameters', function() {
      expect(() => new Image()).to.throw('Not enough arguments');
      expect(() => new Image({})).to.throw('"src" missing');
      expect(() => new Image({src: 5})).to.throw('"src" 5 must be a string');
      expect(() => new Image({src: ''})).to.throw('"src" must not be empty');
      expect(() => new Image({src: '..'})).to.throw('Invalid image "src": Path must not start with ".."');
      ['width', 'height'].forEach(property => {
        expect(() => {
          new Image({src: 'foo', [property]: 5, scale: 5});
        }).to.throw('"scale" cannot be used with "width" and "height"');
      });
      ['width', 'height', 'scale'].forEach((property) => {
        expect(() => {
          new Image({src: 'foo', [property]: -1});
        }).to.throw(`Image "${property}" is not a dimension: Number -1 out of range`);
        expect(() => {
          new Image({src: 'foo', [property]: 'foo'});
        }).to.throw(`Image "${property}" is not a dimension: Invalid number foo`);
        expect(() => {
          new Image({src: 'foo', [property]: NaN});
        }).to.throw(`Image "${property}" is not a dimension: Invalid number NaN`);
        expect(() => {
          new Image({src: 'foo', [property]: Infinity});
        }).to.throw(`Image "${property}" is not a dimension: Invalid number Infinity`);
      });
    });

    it('normalizes path', function() {
      const image = new Image({src: './foo'});

      expect(image.src).to.equal('foo');
    });

    it('scale is inferred from URL', function() {
      expect(new Image({src: 'foo@4x.png'}).scale).to.equal(4);
    });

    it('scale is not inferred from URL when set to auto', function() {
      expect(new Image({src: 'foo@4x.png', scale: 'auto'}).scale).to.equal('auto');
    });

    it('scale is not inferred from URL when set to explicit value', function() {
      expect(new Image({src: 'foo@4x.png', scale: 5}).scale).to.equal(5);
    });

    it('scale is not inferred from URL when width set', function() {
      expect(new Image({src: 'foo@4x.png', width: 5}).scale).to.equal('auto');
    });

    it('scale is not inferred from URL when height set', function() {
      expect(new Image({src: 'foo@4x.png', height: 5}).scale).to.equal('auto');
    });

    it('scale is not inferred from URL when width and height set', function() {
      expect(new Image({src: 'foo@4x.png', width: 4, height: 5}).scale).to.equal('auto');
    });
  });

  describe('instance', function () {

    it('properties are read-only', function() {
      const image = new Image({src: 'foo'});

      image.src = 'bar';
      image.width = 1;
      image.height = 1;
      image.scale = 1;

      expect(image.src).to.equal('foo');
      expect(image.width).to.equal('auto');
      expect(image.height).to.equal('auto');
      expect(image.scale).to.equal('auto');
    });

    it('properties are enumerable', function() {
      const imageLike = {src: 'foo', width: 5, height: 6, scale: 'auto'};
      expect(Object.assign({}, new Image(imageLike))).to.deep.equal(imageLike);
    });

  });

  describe('from', function() {

    it('return image instances', function() {
      expect(Image.from('foo')).to.be.instanceOf(Image);
      expect(Image.from({src: 'foo'})).to.be.instanceOf(Image);
    });

    it('passes through image object', function() {
      const image = new Image({src: 'foo'});
      expect(Image.from(image)).to.equal(image);
    });

    it('accepts image source', function() {
      expect(Image.from('foo')).to.deep.equal({src: 'foo', width: 'auto', height: 'auto', scale: 'auto'});
    });

    it('rejects image-like without size', function() {
      expect(() => Image.from({})).to.throw('"src" missing');
      expect(() => Image.from('')).to.throw('"src" must not be empty');
    });

    it('prints a warning when inconsistent properties given', function() {
      spy(console, 'warn');

      const image = Image.from({src: 'foo', width: 5, scale: 4});

      expect(console.warn).to.have.been.calledWithMatch(
        'Image.from: image "scale" is ignored when "width" and/or "height" are set to a number'
      );
      expect(image).to.deep.equal({src: 'foo', width: 5, height: 'auto', scale: 'auto'});
    });

  });

  describe('isImageValue', function() {

    it('returns true for image values including null', function() {
      expect(Image.isImageValue(null)).to.be.true;
      expect(Image.isImageValue('foo')).to.be.true;
      expect(Image.isImageValue({src: 'foo'})).to.be.true;
      expect(Image.isImageValue(Image.from('foo'))).to.be.true;
    });

    it('returns false for non-image values', function() {
      expect(Image.isImageValue([])).to.be.false;
      expect(Image.isImageValue({})).to.be.false;
      expect(Image.isImageValue(12)).to.be.false;
      expect(Image.isImageValue({scale: 2})).to.be.false;
      expect(Image.isImageValue({width: 2, height: 2})).to.be.false;
    });

  });

  describe('isValidImageValue', function() {

    it('returns true for image values', function() {
      expect(Image.isValidImageValue('foo')).to.be.true;
      expect(Image.isValidImageValue({src: 'foo'})).to.be.true;
      expect(Image.isValidImageValue(Image.from('foo'))).to.be.true;
    });

    it('returns false for non-image values including null', function() {
      expect(Image.isValidImageValue(null)).to.be.false;
      expect(Image.isValidImageValue([])).to.be.false;
      expect(Image.isValidImageValue({})).to.be.false;
      expect(Image.isValidImageValue(12)).to.be.false;
      expect(Image.isValidImageValue({scale: 2})).to.be.false;
      expect(Image.isValidImageValue({width: 2, height: 2})).to.be.false;
    });

  });

});
