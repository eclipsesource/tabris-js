import {expect, mockTabris} from '../test';
import Resources from '../../src/tabris/Resources';
import ColorResources from '../../src/tabris/ColorResources';
import Color from '../../src/tabris/Color';
import ClientMock from './ClientMock';

describe('ColorResources', function() {

  beforeEach(function() {
    mockTabris(new ClientMock());
  });

  describe('constructor', function() {

    it('fails with invalid parameter count', function() {
      // @ts-ignore
      expect(() => new ColorResources()).to.throw(Error, 'Expected 1 parameter, got 0');
      expect(() => new Resources({data: {}}, {})).to.throw(Error, 'Expected 1 parameter, got 2');
    });

    it('fails wrong config type', function() {
      // @ts-ignore
      expect(() => new ColorResources({data: {}, config: 1})).to.throw(
        Error, 'Expected option "config" to be an object, got number'
      );
    });

    it('fails wrong data type', function() {
      expect(() => new ColorResources({data: {foo: 1}}))
        .to.throw(Error, 'data entry "1" is not a valid selector or raw Color type');
    });

    it('creates Resources instance', function() {
      const result = new ColorResources({data: {}});
      expect(result).to.be.instanceOf(Resources);
      expect(result).to.be.instanceOf(ColorResources);
    });

    it('converts data to Color instance', function() {
      // @ts-ignore
      expect(new ColorResources({data: {foo: [0, 1, 2]}}).foo).to.be.instanceOf(Color);
    });

  });

  describe('from()', function() {

    it('creates resources from data', function() {
      tabris.device.platform = 'Android';

      const myColors = ColorResources.from({
        foo: 'red',
        bar: {
          android: {red: 0, green: 1, blue: 2},
          ios: new Color(3, 4, 5)
        }
      });

      expect(myColors.foo.toArray()).to.deep.equal(Color.from('red').toArray());
      expect(myColors.bar.toArray()).to.deep.equal([0, 1, 2, 255]);
    });

    it('creates resources with inheritance', function() {
      tabris.device.platform = 'Android';

      const myColors = ColorResources.from({
        foo: 'red',
        bar: {
          android: {red: 0, green: 1, blue: 2},
          ios: new Color(3, 4, 5)
        },
        baz: [6, 7, 8]
      });
      const myColors2 = ColorResources.from(myColors, {
        foo: [0, 1, 4],
        bar: {android: {inherit: true}, ios: 'red'}
      });

      expect(myColors2.foo.toArray()).to.deep.equal([0, 1, 4, 255]);
      expect(myColors2.bar.toArray()).to.deep.equal([0, 1, 2, 255]);
      expect(myColors2.baz.toArray()).to.deep.equal([6, 7, 8, 255]);
    });

    it('creates resources with in-data configuration', function() {
      tabris.device.language = 'de-DE';
      tabris.device.scaleFactor = 2.5;

      const myColors = ColorResources.from({
        $fallbackLanguage: 'fr',
        $scaleFactor: 'higher',
        foo: {en: [0, 1, 2], fr: [3, 4, 5]},
        bar: {'2x': [6, 7, 8], '4x': [9, 10, 11]}
      });

      expect(myColors.bar.toArray()).to.deep.equal([9, 10, 11, 255]);
      expect(myColors.foo.toArray()).to.deep.equal([3, 4, 5, 255]);
    });

  });

});
