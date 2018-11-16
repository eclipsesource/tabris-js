import ImageData from '../../src/tabris/ImageData';
import {expect} from '../test';

describe('ImageData', function() {

  let data;
  const array = new Uint8ClampedArray(60);

  describe('constructor', function() {

    it('fails with less than 2 parameters', function() {
      expect(function() {
        data = new ImageData(1);
      }).to.throw();
    });

  });

  describe('constructor without array', function() {

    [0, -1, NaN, 'foo', {}].forEach(function(value) {

      it('rejects illegal width (' + value + ')', function() {
        expect(function() {
          data = new ImageData(value, 1);
        }).to.throw();
      });

      it('rejects illegal height (' + value + ')', function() {
        expect(function() {
          data = new ImageData(1, value);
        }).to.throw();
      });

    });

    it('converts width to integer', function() {
      data = new ImageData(3.7, 5);

      expect(data.width).to.equal(3);
    });

    it('converts height to integer', function() {
      data = new ImageData(3, 5.7);

      expect(data.height).to.equal(5);
    });

    it('sets width and height properties', function() {
      data = new ImageData(3, 5);

      expect(data.width).to.equal(3);
      expect(data.height).to.equal(5);
    });

    it('creates data array', function() {
      data = new ImageData(3, 5);

      expect(data.data).to.be.an.instanceof(Uint8ClampedArray);
      expect(data.data.byteLength).to.equal(60);
      for (let i = 0; i < data.data.byteLength; i++) {
        expect(data.data[i]).to.equal(0);
      }
    });

  });

  describe('constructor with array', function() {

    [0, -1, NaN, 'foo', {}].forEach(function(value) {

      it('rejects illegal width (' + value + ')', function() {
        expect(function() {
          data = new ImageData(array, value, 5);
        }).to.throw();
      });

      it('rejects illegal height (' + value + ')', function() {
        expect(function() {
          data = new ImageData(array, 3, value);
        }).to.throw();
      });

    });

    it('converts width to integer', function() {
      data = new ImageData(array, 3.7, 5);

      expect(data.width).to.equal(3);
    });

    it('converts height to integer', function() {
      data = new ImageData(array, 3, 5.7);

      expect(data.height).to.equal(5);
    });

    it('rejects array of wrong size', function() {
      expect(function() {
        data = new ImageData(new Uint8ClampedArray(64), 3, 5);
      }).to.throw();
    });

    it('rejects array of illegal size', function() {
      expect(function() {
        data = new ImageData(new Uint8ClampedArray(33), 3);
      }).to.throw();
    });

    it('sets width, height, and data properties', function() {
      data = new ImageData(array, 3, 5);

      expect(data.width).to.equal(3);
      expect(data.height).to.equal(5);
      expect(data.data).to.equal(array);
    });

    it('calculates missing height property', function() {
      data = new ImageData(array, 3);

      expect(data.width).to.equal(3);
      expect(data.height).to.equal(5);
    });

  });

  describe('properties', function() {

    it('are read-only', function() {
      data = new ImageData(array, 3, 5);

      data.width = 7;
      data.height = 9;
      data.data = null;

      expect(data.width).to.equal(3);
      expect(data.height).to.equal(5);
      expect(data.data).to.equal(array);
    });

  });

});
