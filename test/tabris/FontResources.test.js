import {expect, mockTabris} from '../test';
import Resources from '../../src/tabris/Resources';
import FontResources from '../../src/tabris/FontResources';
import Font from '../../src/tabris/Font';
import ClientMock from './ClientMock';

describe('FontResources', function() {

  beforeEach(function() {
    mockTabris(new ClientMock());
  });

  describe('constructor', function() {

    it('fails with invalid parameter count', function() {
      // @ts-ignore
      expect(() => new FontResources()).to.throw(Error, 'Expected 1 parameter, got 0');
      expect(() => new FontResources({data: {}}, {})).to.throw(Error, 'Expected 1 parameter, got 2');
    });

    it('fails wrong config type', function() {
      // @ts-ignore
      expect(() => new FontResources({data: {}, config: 1})).to.throw(
        Error, 'Expected option "config" to be an object, got number'
      );
    });

    it('fails wrong data type', function() {
      expect(() => new FontResources({data: {foo: 1}}))
        .to.throw(Error, 'data entry "1" is not a valid selector or raw Font type');
    });

    it('creates Resources instance', function() {
      const result = new FontResources({data: {}});
      expect(result).to.be.instanceOf(Resources);
      expect(result).to.be.instanceOf(FontResources);
    });

    it('converts data to Font instance', function() {
      // @ts-ignore
      expect(new FontResources({data: {foo: '12px'}}).foo).to.be.instanceOf(Font);
    });

  });

  describe('from()', function() {

    it('creates resources from data', function() {
      tabris.device.platform = 'Android';

      const myFonts = FontResources.from({
        foo: '12px serif',
        bar: {
          android: {size: 28, family: [Font.monospace]},
          ios: new Font(24, [Font.sansSerif])
        }
      });

      expect(myFonts.foo.equals(Font.from('12px serif'))).to.be.true;
      expect(myFonts.bar.equals(Font.from('28px monospace'))).to.be.true;
    });

    it('creates resources with inheritance', function() {
      tabris.device.platform = 'Android';

      const myFonts = FontResources.from({
        foo: '12px',
        bar: {
          android: {size: 14},
          ios: {size: 16}
        },
        baz: '18px'
      });
      const myFonts2 = FontResources.from(myFonts, {
        foo: '20px',
        bar: {android: {inherit: true}, ios: '22px'}
      });

      expect(myFonts2.foo.size).to.equal(20);
      expect(myFonts2.bar.size).to.equal(14);
      expect(myFonts2.baz.size).to.equal(18);
    });

    it('creates resources with in-data configuration', function() {
      tabris.device.language = 'de-DE';
      tabris.device.scaleFactor = 2.5;

      const myFonts = FontResources.from({
        $fallbackLanguage: 'fr',
        $scaleFactor: 'higher',
        foo: {en: '12px', fr: '14px'},
        bar: {'2x': '16px', '4x': '18px'}
      });

      expect(myFonts.foo.size).to.equal(14);
      expect(myFonts.bar.size).to.equal(18);
    });

  });

});
