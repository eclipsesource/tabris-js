import Image from '../../src/tabris/Image';
import {expect, mockTabris, restore, spy, createBitmap} from '../test';
import ClientMock from './ClientMock';
import Blob from '../../src/tabris/Blob';

describe('Image', function() {

  /** @type {ClientMock} */
  let client;

  beforeEach(() => {
    client = new ClientMock();
    mockTabris(client);
  });

  afterEach(restore);

  describe('constructor', function() {

    it('creates instance from string', function() {
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

    it('creates instance from blob', function() {
      const src = new Blob([new Uint8Array([0, 1,2, 3])]);
      expect(new Image({src})).to.deep.equal({src, width: 'auto', height: 'auto', scale: 'auto'});
    });

    it('creates instance from bitmap', function() {
      return createBitmap(client).then(({bitmap}) => {
        expect(new Image({src: bitmap})).to.deep.equal({src: bitmap, width: 'auto', height: 'auto', scale: 'auto'});
      });
    });

    it('throws for invalid parameters', function() {
      // @ts-ignore
      expect(() => new Image()).to.throw('Not enough arguments');
      // @ts-ignore
      expect(() => new Image({})).to.throw('"src" missing');
      // @ts-ignore
      expect(() => new Image({src: 5})).to.throw('"src" 5 must be a string');
      expect(() => new Image({src: ''})).to.throw('"src" must not be empty');
      expect(() => new Image({src: new Blob([])})).to.throw('"src" must not be empty');
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

    it('throws for closed bitmap', function() {
      return createBitmap(client).then(({bitmap}) => {
        bitmap.close();
        expect(() => new Image({src: bitmap})).to.throw('ImageBitmap is closed');
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

      // @ts-ignore
      image.src = 'bar';
      // @ts-ignore
      image.width = 1;
      // @ts-ignore
      image.height = 1;
      // @ts-ignore
      image.scale = 1;

      expect(image.src).to.equal('foo');
      expect(image.width).to.equal('auto');
      expect(image.height).to.equal('auto');
      expect(image.scale).to.equal('auto');
    });

    it('properties are enumerable', function() {
      /** @type {ImageLikeObject} */
      const imageLike = {src: 'foo', width: 5, height: 6, scale: 'auto'};
      expect(Object.assign({}, new Image(imageLike))).to.deep.equal(imageLike);
    });

  });

  describe('from', function() {

    it('return image instances', function() {
      expect(Image.from('foo')).to.be.instanceOf(Image);
      expect(Image.from({src: 'foo'})).to.be.instanceOf(Image);
    });

    it('return image instances from bitmap', function() {
      return createBitmap(client).then(({bitmap}) => {
        expect(Image.from(bitmap)).to.be.instanceOf(Image);
      });
    });

    it('return image instances from blob', function() {
      const blob = new Blob([new Uint8Array([0, 1, 2])]);
      expect(Image.from(blob)).to.be.instanceOf(Image);
    });

    it('passes through image object', function() {
      const image = new Image({src: 'foo'});
      expect(Image.from(image)).to.equal(image);
    });

    it('rejects image object with closed ImageBitmap', function() {
      return createBitmap(client).then(({bitmap}) => {
        const image = new Image({src: bitmap});
        bitmap.close();
        expect(() => expect(Image.from(image))).to.throw('ImageBitmap is closed');
      });
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

  describe('equals', function() {

    it('returns false for non Image instance values', function() {
      const image = new Image({src: 'foo.png'});
      [NaN, undefined, null, Infinity, {}, {src: 'foo.png'}, 'foo.png'].forEach(value => {
        expect(image.equals(value)).to.be.false;
      });
    });

    it('returns true for equal Image instance values', function() {
      const blob = new Blob([new Uint8Array([0, 1, 2])]);
      expect(new Image({src: 'foo.png'}).equals(new Image({src: 'foo.png'}))).to.be.true;
      expect(
        new Image({src: 'foo.png', width: 100, height: 200}).equals(
          new Image({src: 'foo.png', width: 100, height: 200})
        )
      ).to.be.true;
      expect(
        new Image({src: 'foo.png', scale: 2}).equals(
          new Image({src: 'foo.png', scale: 2})
        )
      ).to.be.true;
      expect(new Image({src: blob}).equals(new Image({src: blob}))).to.be.true;
      return createBitmap(client).then(({bitmap}) => {
        expect(new Image({src: bitmap}).equals(new Image({src: bitmap}))).to.be.true;
      });
    });

    it('returns false for non-equal Image instance values', function() {
      expect(new Image({src: 'foo.png'}).equals(new Image({src: 'bar.png'}))).to.be.false;
      expect(
        new Image({src: 'foo.png', width: 100, height: 100}).equals(
          new Image({src: 'foo.png', width: 100, height: 200})
        )
      ).to.be.false;
      expect(
        new Image({src: 'foo.png', width: 100, height: 100}).equals(
          new Image({src: 'foo.png', width: 100, height: 200})
        )
      ).to.be.false;
      expect(
        new Image({src: 'foo.png', scale: 2}).equals(
          new Image({src: 'foo.png', scale: 1})
        )
      ).to.be.false;
      expect(
        new Image({src: new Blob([new Uint8Array([0, 1, 2])])}).equals(
          new Image({src: new Blob([new Uint8Array([0, 1, 2])])})
        )
      ).to.be.false;
      return createBitmap(client).then(({bitmap: bitmapA}) => {
        client.resetCalls();
        return createBitmap(client).then(({bitmap: bitmapB}) => {
          expect(new Image({src: bitmapA}).equals(new Image({src: bitmapB}))).to.be.false;
        });
      });
    });

  });

});
