import {expect, stub, restore} from '../test';
import {imageToArray, imageFromArray} from '../../src/tabris/util-images';

describe('util-images', function() {

  afterEach(restore);

  describe('imageToArray', function() {

    it('translates object to array', function() {
      const result = imageToArray({src: 'foo', width: 23, height: 42, scale: 3.14});
      expect(result).to.eql(['foo', 23, 42, 3.14]);
    });

    it('replaces missing width, height, and scale values with null', function() {
      const result = imageToArray({src: 'foo'});
      expect(result).to.eql(['foo', null, null, null]);
    });

  });

  describe('imageFromArray', function() {

    it('translates array to object', function() {
      const result = imageFromArray(['foo', 23, 42]);
      expect(result).to.eql({src: 'foo', width: 23, height: 42, scale: 'auto'});
    });

    it('prints a warning for inconsistent configuration', function() {
      stub(console, 'warn');

      imageFromArray(['foo', 23, 42, 3.14]);

      expect(console.warn).to.have.been.calledWithMatch(
        'Image.from: image "scale" is ignored when "width" and/or "height" are set to a number'
      );
    });

    it('skips missing width, height, and scale values', function() {
      const result = imageFromArray(['foo']);
      expect(result).to.eql({src: 'foo', height: 'auto', scale: 'auto', width: 'auto'});
    });

  });

});
