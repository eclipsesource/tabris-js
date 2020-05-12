import {expect, mockTabris} from '../test';
import Resources from '../../src/tabris/Resources';
import TextResources from '../../src/tabris/TextResources';
import ClientMock from './ClientMock';

describe('TextResources', function() {

  beforeEach(function() {
    mockTabris(new ClientMock());
    tabris.device.platform = 'Android';
  });

  describe('constructor', function() {

    it('fails with invalid parameter count', function() {
      // @ts-ignore
      expect(() => new TextResources()).to.throw(Error, 'Expected 1 parameter, got 0');
      expect(() => new TextResources({data: {}}, {})).to.throw(Error, 'Expected 1 parameter, got 2');
    });

    it('fails wrong config type', function() {
      // @ts-ignore
      expect(() => new TextResources({data: {}, config: 1})).to.throw(
        Error, 'Expected option "config" to be an object, got number'
      );
    });

    it('fails wrong data type', function() {
      expect(() => new TextResources({data: {foo: 1}}))
        .to.throw(Error, 'data entry "1" is not a valid selector or raw resource type');
    });

    it('creates Resources instance', function() {
      const result = new TextResources({data: {}});
      expect(result).to.be.instanceOf(Resources);
      expect(result).to.be.instanceOf(TextResources);
    });

    it('selects string', function() {
      expect(new TextResources({
        data: {foo: {android: 'bar', ios: 'baz'}}
        // @ts-ignore
      }).foo).to.equal('bar');
    });

  });

  describe('from()', function() {

    it('creates resources from data', function() {
      const myTexts = TextResources.from({
        foo: 'one',
        bar: {
          android: 'two',
          ios: 'three'
        }
      });

      expect(myTexts.foo).to.equal('one');
      expect(myTexts.bar).to.equal('two');
    });

    it('creates resources with inheritance', function() {
      const myTexts = TextResources.from({
        foo: 'one',
        bar: {
          android: 'two',
          ios: 'three'
        },
        baz: 'four'
      });
      const myTexts2 = TextResources.from(myTexts, {
        foo: 'five',
        bar: {android: {inherit: true}, ios: 'six'}
      });

      expect(myTexts2.foo).to.equal('five');
      expect(myTexts2.bar).to.equal('two');
      expect(myTexts2.baz).to.equal('four');
    });

    it('creates resources with in-data configuration', function() {
      tabris.device.language = 'de-DE';
      tabris.device.scaleFactor = 2.5;

      const myTexts = TextResources.from({
        $fallbackLanguage: 'fr',
        $scaleFactor: 'higher',
        foo: {en: 'one', fr: 'two'},
        bar: {'2x': 'three', '4x': 'four'}
      });

      expect(myTexts.foo).to.equal('two');
      expect(myTexts.bar).to.equal('four');
    });

  });

});
