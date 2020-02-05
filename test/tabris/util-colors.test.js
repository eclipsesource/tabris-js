import {expect} from '../test';
import {colorArrayToString, colorStringToArray} from '../../src/tabris/util-colors';

describe('util-colors', function() {

  describe('colorArrayToString', function() {

    it('returns color string in rgba format', function() {
      expect(colorArrayToString([170, 255, 0, 128])).to.eql('rgba(170, 255, 0, 0.5)');
    });

    it('accepts arrays with 3 elements', function() {
      expect(colorArrayToString([170, 255, 0])).to.eql('rgba(170, 255, 0, 1)');
    });

  });

  describe('colorStringToArray', function() {

    it('accepts color string of form #xxxxxx', function() {
      expect(colorStringToArray('#aaff00')).to.eql([170, 255, 0, 255]);
    });

    it('accepts color string of form #xxxxxx with mixed upper/lower case', function() {
      expect(colorStringToArray('#aaFF00')).to.eql([170, 255, 0, 255]);
    });

    it('accepts color string of form #xxx', function() {
      expect(colorStringToArray('#af0')).to.eql([170, 255, 0, 255]);
    });

    it('accepts color string of form #xxx with mixed upper/lower case', function() {
      expect(colorStringToArray('#aF0')).to.eql([170, 255, 0, 255]);
    });

    it('accepts color string of form #xxxxxxxx', function() {
      expect(colorStringToArray('#aaff00cc')).to.eql([170, 255, 0, 204]);
    });

    it('accepts color string of form #xxxxxxxx with mixed upper/lower case', function() {
      expect(colorStringToArray('#aaFF00CC')).to.eql([170, 255, 0, 204]);
    });

    it('accepts color string of form #xxxx', function() {
      expect(colorStringToArray('#ff06')).to.eql([255, 255, 0, 102]);
    });

    it('accepts color string of form #xxxx with mixed upper/lower case', function() {
      expect(colorStringToArray('#aBcD')).to.eql([170, 187, 204, 221]);
    });

    it('accepts rgb function strings', function() {
      expect(colorStringToArray('rgb(12, 34, 56)')).to.eql([12, 34, 56, 255]);
    });

    it('clips out-of-range values in rgb', function() {
      expect(colorStringToArray('rgb(-12, 34, 560)')).to.eql([0, 34, 255, 255]);
    });

    it('rejects rgb function strings with wrong argument count', function() {
      expect(() => {
        colorStringToArray('rgb(23, 42)');
      }).to.throw();
    });

    it('rejects rgb function strings with illegal format in argument', function() {
      expect(() => {
        colorStringToArray('rgb(xxx, 23, 42)');
      }).to.throw();
    });

    it('accepts rgba function strings', function() {
      expect(colorStringToArray('rgba(12, 34, 56, 0.5)')).to.eql([12, 34, 56, 128]);
    });

    it('clips out-of-range values in rgba', function() {
      expect(colorStringToArray('rgba(-12, 34, 560, 2.5)')).to.eql([0, 34, 255, 255]);
    });

    it('rejects rgba function strings with wrong argument count', function() {
      expect(() => {
        colorStringToArray('rgba(23, 42, 47)');
      }).to.throw();
    });

    it('rejects rgba function strings with illegal format in color value', function() {
      expect(() => {
        colorStringToArray('rgba(xxx, 23, 42)');
      }).to.throw();
    });

    it('rejects rgba function strings with illegal format in alpha value', function() {
      expect(() => {
        colorStringToArray('rgba(0, 23, 42, 2..0)');
      }).to.throw();
    });

    it('accepts color names', function() {
      expect(colorStringToArray('navy')).to.eql([0, 0, 128, 255]);
    });

    it('accepts \'transparent\'', function() {
      expect(colorStringToArray('transparent')).to.eql([0, 0, 0, 0]);
    });

    it('rejects unknown strings', function() {
      expect(() => {
        colorStringToArray('unknown');
      }).to.throw();
    });

  });

});
