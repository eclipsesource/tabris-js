import {expect, mockTabris} from '../test';
import Resources from '../../src/tabris/Resources';
import ClientMock from './ClientMock';
import Color from '../../src/tabris/Color';
import ResourceBuilder from '../../src/tabris/ResourceBuilder';

describe('Resources', function() {

  /** @type {ClientMock} */
  let client;

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
  });

  describe('constructor', function() {

    /** @type {ResourcesConstructorOptions<any, any>} */
    let options;

    /** @type {ResourceRawData<number>} */
    let testData;

    function create(data) {
      options.data = Object.assign(options.data, data);
      return /** @type {any} */(new Resources(options));
    }

    beforeEach(function() {
      options = {data: {}};
      testData = {foo: 23, bar: 24};
    });

    describe('parameter check', function() {

      it('fails with invalid parameter count', function() {
        // @ts-ignore
        expect(() => new Resources()).to.throw(Error, 'Expected 1 parameter, got 0');
        expect(() => new Resources(options, options)).to.throw(Error, 'Expected 1 parameter, got 2');
      });

      it('fails wrong config type', function() {
        // @ts-ignore
        options.config = 1;
        expect(() => new Resources(options)).to.throw(
          Error, 'Expected option "config" to be an object, got number'
        );
      });

      it('fails with unknown option', function() {
        // @ts-ignore
        options.foo = {};
        expect(() => new Resources(options)).to.throw(Error, 'Unknown option "foo"');
      });

      it('fails with wrong base type', function() {
        // @ts-ignore
        options.base = 1;
        expect(() => new Resources(options)).to.throw(
          Error, 'Expected option "base" to be an object, got number'
        );
      });

      it('fails with unknown config parameter', function() {
        // @ts-ignore
        options.config = {foo: 1};
        expect(() => new Resources(options)).to.throw(Error, 'Unknown configuration key "foo"');
      });

      it('fails with invalid scaleFactor configuration', function() {
        // @ts-ignore
        options.config = {scaleFactor: 'bar'};
        expect(() => new Resources(options)).to.throw(Error, 'Invalid scaleFactor "bar"');
      });

      it('fails wrong data type', function() {
        // @ts-ignore
        options.data = 1;
        expect(() => new Resources(options)).to.throw(Error, 'Expected option "data" to be an object, got number');
      });

      it('fails wrong converter type', function() {
        // @ts-ignore
        options.converter = {};
        expect(() => new Resources(options)).to.throw(
          Error, 'Expected option "converter" to be a function, got object'
        );
      });

      it('fails wrong validator type', function() {
        // @ts-ignore
        options.converter = {};
        expect(() => new Resources(options)).to.throw(
          Error, 'Expected option "converter" to be a function, got object'
        );
      });

      it('fails wrong type type', function() {
        // @ts-ignore
        options.type = () => { };
        expect(() => new Resources(options)).to.throw(
          Error, 'Expected option "type" to be a constructor, got function'
        );
      });

      it('fails with data resource name containing reserved character', function() {
        for (const key of ['f$0', 'f#foo', 'f_foo', 'f!foo', 'f@foo', 'f foo', 'Ffoo', '*xxx']) {
          options.data = {[key]: 0};
          expect(() => new Resources(options)).to.throw(Error, `Invalid resource name ${key}`);
        }
      });

      it('fails with data resource too short', function() {
        for (const key of ['f', 'ff']) {
          options.data = {[key]: 0};
          expect(() => new Resources(options)).to.throw(Error, `Invalid resource name ${key}`);
        }
      });

      it('fails with base resource name containing reserved character', function() {
        for (const key of ['f$0', 'f#foo', 'f_foo', 'f!foo', 'f@foo', 'f foo', 'Ffoo']) {
          options.base = {[key]: 0};
          expect(() => new Resources(options)).to.throw(Error, `Invalid resource name ${key}`);
        }
      });

      it('fails with base resource too short', function() {
        for (const key of ['f', 'ff']) {
          options.base = {[key]: 0};
          expect(() => new Resources(options)).to.throw(Error, `Invalid resource name ${key}`);
        }
      });

      it('accepts empty data object', function() {
        expect(() => new Resources(options)).not.to.throw();
      });

      it('accepts non-empty data object', function() {
        options.data = {foo: 23, bar: 24, baZ500: 25};
        expect(() => new Resources(options)).not.to.throw();
      });

    });

    describe('without selectors', function() {

      let resources;

      beforeEach(function() {
        resources = create(testData);
      });

      it('creates instance of Resources', function() {
        expect(resources).to.be.instanceOf(Resources);
      });

      it('passes through data', function() {
        expect(resources).to.deep.equal(testData);
      });

      it('creates iterable', function() {
        const keys = Object.keys(resources);
        expect(keys).to.contain('foo');
        expect(keys).to.contain('bar');
        expect(keys.length).to.equal(2);
      });

      it('throws for plain objects containing reserved selector keys', function() {
        [
          '', ' ', 'small', 'vertiCal', 'phone', 'other', 'ldrtl', 'ldltr', 'mcc02', '120dpi', '*hello',
          '!hello', '$hello', 'hello_world', '#hello', '@hello', 'foo.bar', 'foo:23', 'hello$worlD'
        ].forEach(key => {
          expect(() => create({foo: {[key]: 'foo'}})).throw(Error, `Resource uses reserved property name "${key}".`);
        });
      });

      it('accepts plain objects containing no reserved selector keys', function() {
        [
          'hello', 'verticalBar', 'xdpix', 'foo'
        ].forEach(key => {
          expect(create({foo: {[key]: 'foo'}}).foo[key]).to.equal('foo');
        });
      });

      it('accepts non-plain objects containing reserved resource names', function() {
        class Valid { constructor() { this.small = 1; } }
        const valid = new Valid();
        expect(create({foo: valid}).foo).to.equal(valid);
      });

    });

    describe('with platform selectors', function() {

      // TODO: do not treat classes as selectors

      beforeEach(function() {
        tabris.device.platform = 'iOS';
      });

      it('selects for ios', function() {
        expect(create({foo: {android: 1, ios: 2}}).foo).to.equal(2);
      });

      it('selects for Android', function() {
        tabris.device.platform = 'Android';
        expect(create({foo: {android: 1, ios: 2}}).foo).to.equal(1);
      });

      it('selects case-insensitive', function() {
        expect(create({foo: {android: 1, iOs: 2}}).foo).to.equal(2);
      });

      it('throws for missing platform', function() {
        expect(() => create({foo: {iOs: 2}}))
          .to.throw(Error, 'Invalid platform selector {"iOs":2}');
      });

      it('throws for invalid platform', function() {
        tabris.device.platform = 'Android';
        expect(() => create({foo: {android: [1, 2, 3], io: [3, 4, 5]}}))
          .to.throw(Error, /^Invalid platform selector/);
      });

      it('throws for duplicate platform', function() {
        expect(() => create({foo: {android: 1, iOs: 2, Android: 3}}))
          .to.throw(Error, /^Invalid platform selector/);
      });

      it('throws for excess properties', function() {
        expect(() => create({foo: {android: 1, iOs: 2, bar: 3}}))
          .to.throw(Error, /^Invalid platform selector/);
      });

    });

    describe('with language selectors', function() {

      beforeEach(function() {
        tabris.device.language = 'de-DE';
      });

      it('selects for language subtag', function() {
        expect(create({foo: {de: 1, aaq: 2, en: 3}}).foo).to.equal(1);
      });

      it('selects for region subtag', function() {
        expect(create({foo: {'de-DE': 1, 'de-AT': 2, 'en': 3}}).foo).to.equal(1);
      });

      it('selects for more specific match', function() {
        expect(create({foo: {'de-DE': 2, 'de': 1, 'en': 3}}).foo).to.equal(2);
        expect(create({foo: {'de': 2, 'de-DE': 1, 'en': 3}}).foo).to.equal(1);
      });

      it('falls back to default (en)', function() {
        expect(create({foo: {es: 1, aaq: 2, en: 3}}).foo).to.equal(3);
      });

      it('falls back to configured default', function() {
        options.config = {fallbackLanguage: 'es'};
        expect(create({foo: {es: 1, aaq: 2, en: 3}}).foo).to.equal(1);
      });

      it('falls back to longer version of configured default', function() {
        options.config = {fallbackLanguage: 'en-US'};
        expect(create({foo: {'en': 1, 'en-US': 2, 'es': 3}}).foo).to.equal(2);
      });

      it('falls back to shorter version of configured default', function() {
        options.config = {fallbackLanguage: 'en-us'};
        expect(create({foo: {es: 1, en: 3}}).foo).to.equal(3);
      });

      it('selects case-insensitive', function() {
        expect(create({foo: {en: 1, DE: 2, aaq: 3}}).foo).to.equal(2);
      });

      it('throws for missing default (en)', function() {
        expect(() => create({foo: {de: 2}})).to.throw(Error,
          'Missing entry for fallback language (currently "en") in selector {"de":2}'
        );
      });

      it('throws for missing configured default', function() {
        options.config = {fallbackLanguage: 'es'};
        expect(() => create({foo: {de: 2}})).to.throw(Error,
          'Missing entry for fallback language (currently "es") in selector {"de":2}'
        );
      });

      it('throws for duplicate language', function() {
        expect(() => create({foo: {en: 1, de: 2, DE: 3}}))
          .to.throw(Error, /^Invalid language selector/);
      });

      it('throws for too long language tag', function() {
        expect(() => create({foo: {lang: 1, en: 2}}))
          .to.throw(Error, /^Invalid language selector/);
      });

      it('throws for too short language tag', function() {
        expect(() => create({foo: {d: 1, en: 2}}))
          .to.throw(Error, /^Invalid language selector/);
      });

    });

    describe('with scale selectors', function() {

      beforeEach(function() {
        tabris.device.scaleFactor = 2.5;
      });

      it('selects for lower match by default', function() {
        expect(create({foo: {'1x': 22, '2x': 23, '3x': 24}}).foo).to.equal(23);
        expect(create({foo: {'1x': 22, '2.5x': 23, '3x': 24}}).foo).to.equal(23);
        expect(create({foo: {'1x': 22, '2x': 23}}).foo).to.equal(23);
        expect(create({foo: {'2x': 23, '3x': 24}}).foo).to.equal(23);
        expect(create({foo: {'1x': 22, '2.5x': 23, '3x': 24}}).foo).to.equal(23);
        expect(create({foo: {'2.5x': 23}}).foo).to.equal(23);
        expect(create({foo: {'1x': 23}}).foo).to.equal(23);
        expect(create({foo: {'5x': 23}}).foo).to.equal(23);
      });

      it('selects for higher match', function() {
        options.config = {scaleFactor: 'higher'};
        expect(create({foo: {'1x': 22, '4x': 24, '2x': 23}}).foo).to.equal(24);
        expect(create({foo: {'1x': 22, '2.5x': 24, '2x': 23}}).foo).to.equal(24);
        expect(create({foo: {'1x': 22, '4x': 24}}).foo).to.equal(24);
        expect(create({foo: {'4x': 24, '2x': 23}}).foo).to.equal(24);
        expect(create({foo: {'2.5x': 24}}).foo).to.equal(24);
        expect(create({foo: {'1x': 24}}).foo).to.equal(24);
        expect(create({foo: {'5x': 24}}).foo).to.equal(24);
      });

      it('selects for nearest match', function() {
        options.config = {scaleFactor: 'nearest'};
        expect(create({foo: {'2.6x': 24, '1.9x': 22, '4x': 25}}).foo).to.equal(24);
        expect(create({foo: {'3x': 24, '1x': 22, '2x': 23, '4x': 25}}).foo).to.equal(24);
        expect(create({foo: {'2.5x': 24, '1x': 22}}).foo).to.equal(24);
        expect(create({foo: {'2.5x': 24, '4x': 22}}).foo).to.equal(24);
        expect(create({foo: {'3x': 24, '1x': 22}}).foo).to.equal(24);
        expect(create({foo: {'2x': 24, '4x': 22}}).foo).to.equal(24);
        expect(create({foo: {'2.5x': 24}}).foo).to.equal(24);
        expect(create({foo: {'1x': 24}}).foo).to.equal(24);
        expect(create({foo: {'5x': 24}}).foo).to.equal(24);
      });

      it('selects case-insensitive', function() {
        expect(create({foo: {'1X': 23, '2.5X': 24}}).foo).to.equal(24);
      });

      it('throws for duplicate scale', function() {
        expect(() => create({foo: {'1x': 23, '1X': 23}}))
          .to.throw(Error, /^Invalid scale selector {"/);
      });

      it('throws for excess properties', function() {
        expect(() => create({foo: {'1x': 23, 'bar': 25}}))
          .to.throw(Error, /^Invalid scale selector {"/);
      });

      it('throws for scale below 1', function() {
        expect(() => create({foo: {'0.9x': 23}}))
          .to.throw(Error, /^Invalid scale selector {"/);
      });

      it('throws for scale above 9', function() {
        expect(() => create({foo: {'10x': 23}}))
          .to.throw(Error, /^Invalid scale selector {"/);
      });

    });

    describe('with combined selectors', function() {

      beforeEach(function() {
        options.config = {scaleFactor: 'nearest'};
        tabris.device.platform = 'Android';
        tabris.device.scaleFactor = 1.5;
      });

      it('selects from platforms within scales', function() {
        options.config = {scaleFactor: 'lower'};
        expect(create({
          foo: {
            '1.6x': 22, '1.3x': {android: 23, ios: 24}, '3x': 25
          }
        }).foo).to.equal(23);
      });

      it('selects from scales within platform', function() {
        options.config = {scaleFactor: 'higher'};
        expect(create({
          foo: {
            android: {'1x': 22, '2.5x': 23, '3x': 24}, ios: 25
          }
        }).foo).to.equal(23);
      });

    });

    describe('with reference', function() {

      beforeEach(function() {
        options.config = {scaleFactor: 'nearest'};
        tabris.device.platform = 'Android';
        tabris.device.scaleFactor = 1.5;
      });

      it('throws for missing reference', function() {
        expect(() => create({bar: {ref: 'foo'}})).to.throw(
          Error, '"bar": Can not resolve reference "foo"'
        );
      });

      it('selects from plain definition', function() {
        expect(create({
          foo: 23,
          bar: {ref: 'foo'}
        }).bar).to.equal(23);
      });

      it('selects from selected definition', function() {
        options.config = {scaleFactor: 'lower'};
        expect(create({
          bar: {ref: 'foo'},
          foo: {'1.6x': 22, '1.3x': {android: 23, ios: 24}, '3x': 25}
        }).bar).to.equal(23);
      });

      it('supports type that looks like reference', function() {
        options.converter = v => ({ref: v});
        expect(create({
          bar: 23
        }).bar.ref).to.equal(23);
      });

      it('throws for nested reference', function() {
        expect(() => create({
          bar: {ref: 'foo'},
          foo: {ref: 'baz'},
          baz: 1
        })).to.throw(Error, '"bar": References can not be nested');
      });

    });

    describe('with validator', function() {

      beforeEach(function() {
        options.config = {scaleFactor: 'nearest'};
        options.data = {foo: '23.5', bar: 24.5};
        /** @type {(value) => value is number} */
        options.validator = value => typeof value === 'number' || !isNaN(parseFloat(value));
        options.converter = value => typeof value === 'number' ? value : parseFloat(value);
      });

      it('passes accepted raw value', function() {
        expect(create({foo: '23.5', bar: 24.5}).foo).to.equal(23.5);
      });

      it('passes "{inherit: true}"', function() {
        options.base = {foo: 23};
        options.data = {foo: {inherit: true}};
        expect(create().foo).to.equal(23);
      });

      it('passes reference', function() {
        options.data = {foo: 23, bar: {ref: 'foo'}};
        expect(create().bar).to.equal(23);
      });

      it('rejects incorrect raw value', function() {
        expect(() => create({foo: 'baz', bar: 24.5}).foo).to.throw(Error,
          'data entry "baz" is not a valid selector or raw resource type'
        );
      });

    });

    describe('with converter', function() {

      it('transforms value', function() {
        options.config = {scaleFactor: 'nearest'};
        tabris.device.platform = 'Android';
        tabris.device.scaleFactor = 1.5;
        options.converter = Math.round;
        expect(create({
          foo: {
            '1.6x': 2.2, '1.3x': {android: 23.2, ios: 24.2}, '3x': 25.2
          }
        }).foo).to.equal(2);
      });

      it('propagetes error', function() {
        tabris.device.platform = 'Android';
        tabris.device.scaleFactor = 1.5;
        options.converter = () => { throw new Error(); };
        expect(() => create({foo: 1})).to.throw();
      });

    });

    describe('with inheritance', function() {

      beforeEach(function() {
        options.config = {scaleFactor: 'nearest'};
        tabris.device.platform = 'Android';
        options.base = testData;
      });

      it('overrides old values', function() {
        expect(create({foo: 0, bar: 2})).to.deep.equal({foo: 0, bar: 2});
      });

      it('merges with new values', function() {
        expect(create({foo: 0, baz: 2})).to.deep.equal({foo: 0, bar: 24, baz: 2});
      });

      it('does not override with "{inherit: true}"', function() {
        expect(create({foo: {inherit: true}, bar: 2})).to.deep.equal({foo: 23, bar: 2});
      });

      it('does not override with selected "{inherit: true}" and converter', function() {
        tabris.device.platform = 'Android';
        tabris.device.scaleFactor = 1.3;
        options.converter = Math.round;
        expect(create({
          foo: {'1.6x': 2.2, '1.3x': {android: {inherit: true}, ios: 24.2}},
          bar: {'1.6x': 2.2, '1.3x': {android: 23.2, ios: 24.2}}
        })).to.deep.equal({foo: 23, bar: 23});
      });

      it('"inherit" fails if no base value exists', function() {
        expect(() => create({baz: {inherit: true}})).to.throw(Error,
          'Resource "baz" resolved to "inherit: true", but "baz" does not exist in base object'
        );
      });

    });

    describe('with type', function() {

      beforeEach(function() {
        options.config = {scaleFactor: 'nearest'};
        options.type = Date;
        options.data = {foo: new Date()};
      });

      it('accepts selected data of correct type', function() {
        expect(create().foo).to.equal(options.data.foo);
      });

      it('accepts inherited data of correct type', function() {
        options.base = {foo: new Date()};
        options.data = {foo: {inherit: true}};
        expect(create().foo).to.equal(options.base.foo);
      });

      it('creates type-checked object', function() {
        const date = new Date();
        const dates = create();

        dates.bar = date;

        expect(dates.bar).to.equal(date);
      });

      it('reject selected data of incorrect type', function() {
        expect(() => create({bar: 23})).to.throw(Error,
          'Expected data of type "Date", got number'
        );
      });

      it('rejects inherited data of incorrect type', function() {
        options.base = {foo: 23};
        expect(() => create({foo: {inherit: true}})).to.throw(Error,
          'Expected data of type "Date", got number'
        );
      });

      it('rejects modification with incorrect type', function() {
        const dates = create();

        expect(() => dates.bar = 23).to.throw(Error,
          'Expected data of type "Date", got number'
        );
      });

    });

  });

  describe('simple subclass', function() {

    class MyStringResources extends Resources {

      constructor(data) {
        super({data});
      }

    }

    it('passes on data', function() {
      tabris.device.language = 'de-DE';

      const myStrings = new MyStringResources({foo: 'foo', bar: {en: 'bar', de: 'baz'}});

      // @ts-ignore
      expect(myStrings.foo).to.equal('foo');
      // @ts-ignore
      expect(myStrings.bar).to.equal('baz');
    });

  });

  describe('configured subclass', function() {

    class MyColorResources extends Resources {

      constructor(data, base) {
        super({
          data, base,
          converter: Color.from,
          type: Color,
          // @ts-ignore
          validator: Color.isValidColorValue
        });
      }

    }

    it('processes data', function() {
      tabris.device.platform = 'Android';

      const myColors = new MyColorResources({
        foo: 'red',
        bar: {
          android: {red: 0, green: 1, blue: 2},
          ios: new Color(3, 4, 5)
        }
      });
      const myColors2 = new MyColorResources({foo: [0, 1, 4]}, myColors);

      // @ts-ignore
      expect(myColors2.bar.toArray()).to.deep.equal([0, 1, 2, 255]);
      // @ts-ignore
      expect(myColors2.foo.toArray()).to.deep.equal([0, 1, 4, 255]);
    });

  });

  describe('build()', function() {

    /** @type {ResourceBuilder<Color, ColorValue>} */
    let colorResources;

    beforeEach(function() {
      colorResources = Resources.build(
        // @ts-ignore
        {converter: Color.from, type: Color, validator: Color.isValidColorValue}
      );
    });

    it('requires at least one parameter that can be used to infer resource type', function() {
      // @ts-ignore
      expect(() => Resources.build()).to.throw(Error, 'Expected 1 parameter, got 0');
      // @ts-ignore
      expect(() => Resources.build(12)).to.throw(Error, 'Expected object, got number');
      // @ts-ignore
      expect(() => Resources.build({})).to.throw(Error, 'At least one option required');
      expect(Resources.build({converter: Color.from})).to.be.instanceOf(ResourceBuilder);
      // @ts-ignore
      expect(Resources.build({type: Color})).to.be.instanceOf(ResourceBuilder);
      // @ts-ignore
      expect(Resources.build({validator: Color.isValidColorValue})).to.be.instanceOf(ResourceBuilder);
    });

    it('stores options as read-only', function() {
      colorResources.converter = null;
      colorResources.type = null;
      colorResources.validator = null;

      expect(colorResources.converter).to.equal(Color.from);
      expect(colorResources.type).to.equal(Color);
      expect(colorResources.validator).to.equal(Color.isValidColorValue);
    });

    it('creates resources from data', function() {
      tabris.device.platform = 'Android';

      const myColors = colorResources.from({
        // @ts-ignore
        foo: 'red',
        bar: {
          // @ts-ignore
          android: {red: 0, green: 1, blue: 2},
          ios: new Color(3, 4, 5)
        }
      });

      expect(myColors.foo.toArray()).to.deep.equal(Color.from('red').toArray());
      expect(myColors.bar.toArray()).to.deep.equal([0, 1, 2, 255]);
    });

    it('creates resources with inheritance', function() {
      tabris.device.platform = 'Android';

      const myColors = colorResources.from({
        // @ts-ignore
        foo: 'red',
        bar: {
          // @ts-ignore
          android: {red: 0, green: 1, blue: 2},
          ios: new Color(3, 4, 5)
        },
        // @ts-ignore
        baz: [6, 7, 8]
      });
      const myColors2 = colorResources.from(myColors, {
        foo: [0, 1, 4],
        bar: {android: {inherit: true}, ios: 'red'}
      });

      // @ts-ignore
      expect(myColors2.foo.toArray()).to.deep.equal([0, 1, 4, 255]);
      // @ts-ignore
      expect(myColors2.bar.toArray()).to.deep.equal([0, 1, 2, 255]);
      // @ts-ignore
      expect(myColors2.baz.toArray()).to.deep.equal([6, 7, 8, 255]);
    });

    it('creates resources with in-data configuration', function() {
      tabris.device.language = 'de-DE';
      tabris.device.scaleFactor = 2.5;

      const myColors = colorResources.from({
        // @ts-ignore
        $schema: 'ignoreThis',
        // @ts-ignore
        $fallbackLanguage: 'fr',
        // @ts-ignore
        $scaleFactor: 'higher',
        // @ts-ignore
        foo: {en: [0, 1, 2], fr: [3, 4, 5]},
        // @ts-ignore
        bar: {'2x': [6, 7, 8], '4x': [9, 10, 11]}
      });

      expect(myColors.bar.toArray()).to.deep.equal([9, 10, 11, 255]);
      expect(myColors.foo.toArray()).to.deep.equal([3, 4, 5, 255]);
    });

  });

});
