import {expect} from '../test';
import {imageToArray, imageFromArray} from '../../src/tabris/util-images';

describe('util-images', function() {

  describe('imageToArray', function() {

    it('translates object to array', function() {
      let result = imageToArray({src: 'foo', width: 23, height: 42, scale: 3.14});
      expect(result).to.eql(['foo', 23, 42, 3.14]);
    });

    it('replaces missing width, height, and scale values with null', function() {
      let result = imageToArray({src: 'foo'});
      expect(result).to.eql(['foo', null, null, null]);
    });

  });

  describe('imageFromArray', function() {

    it('translates array to object', function() {
      let result = imageFromArray(['foo', 23, 42, 3.14]);
      expect(result).to.eql({src: 'foo', width: 23, height: 42, scale: 3.14});
    });

    it('skips missing width, height, and scale values', function() {
      let result = imageFromArray(['foo']);
      expect(result).to.eql({src: 'foo'});
    });

  });

});
