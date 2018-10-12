import Font from '../../src/tabris/Font';
import {expect} from '../test';

describe('Font', function() {

  describe('constructor', function() {

    it('creates instance with size', function() {
      const font = new Font(5);

      expect(font.size).to.equal(5);
      expect(font.weight).to.equal('normal');
      expect(font.style).to.equal('normal');
    });

    it('creates instance with optional parameters', function() {
      const font = new Font(5, ['foo'], 'bold', 'italic');

      expect(font.family).to.deep.equal(['foo']);
      expect(font.weight).to.equal('bold');
      expect(font.style).to.equal('italic');
    });

    it('normalizes parameters', function() {
      const font = new Font(5, ['  "foo" '], '  bold ', '  italic ');

      expect(font.family).to.deep.equal(['foo']);
      expect(font.weight).to.deep.equal('bold');
      expect(font.style).to.deep.equal('italic');
    });

    it('throws for invalid parameters', function() {
      expect(() => new Font('foo')).to.throw('Invalid number');
      expect(() => new Font(-1)).to.throw('Number -1 out of range');
      expect(() => new Font(NaN)).to.throw('Invalid number NaN');
      expect(() => new Font(Infinity)).to.throw('Invalid number Infinity');
      expect(() => new Font(5, ['"f"oo'])).to.throw('Invalid font family: "f"oo');
      expect(() => new Font(5, ["'f'oo"])).to.throw("Invalid font family: 'f'oo");
      expect(() => new Font(5, undefined, 'foo')).to.throw('Invalid font weight foo');
      expect(() => new Font(5, undefined, undefined, 'foo')).to.throw('Invalid font style foo');
      expect(() => new Font()).to.throw('Not enough arguments');
    });

  });

  describe('instance', function () {

    it('properties are read-only', function() {
      const font = new Font(5, ['foo'], 'bold', 'italic');

      font.size = 1;
      font.family = 'bar';
      font.weight = 'normal';
      font.style = 'normal';

      expect(font.size).to.equal(5);
      expect(font.family).to.deep.equal(['foo']);
      expect(font.weight).to.equal('bold');
      expect(font.style).to.equal('italic');
    });

    it('family array is immutable', function() {
      const font = new Font(5, ['foo'], 'bold', 'italic');

      expect(() => {
        font.family.push('bar');
      }).to.throw(/object is not extensible/);
      expect(font.family).to.deep.equal(['foo']);
    });

    describe('toString', function() {

      it('returns font string in CSS format', function() {
        expect(new Font(5, ['foo'], 'bold', 'italic').toString()).to.equal('italic bold 5px foo');
      });

      it('normal weight and style are skipped', function() {
        expect(new Font(5, [], 'normal', 'normal').toString()).to.equal('5px');
      });

      it('multiple families are joined by a comma', function() {
        expect(new Font(5, ['foo', 'bar'], 'normal', 'normal').toString()).to.equal('5px foo, bar');
      });

    });

    it('properties are enumerable', function() {
      expect(Object.assign({}, new Font(5, ['foo'], 'bold', 'italic'))).to.deep.equal({
        size: 5,
        family: ['foo'],
        weight: 'bold',
        style: 'italic'
      });
    });

  });

  describe('from', function() {

    it('return color instances', function() {
      expect(Font.from('bold 16px')).to.be.instanceOf(Font);
      expect(Font.from({size: 16})).to.be.instanceOf(Font);
      expect(Font.from(new Font(16))).to.be.instanceOf(Font);
    });

    it('passes through font object', function() {
      const font = new Font(16);
      expect(Font.from(font)).to.equal(font);
    });

    it('accepts font-like with size', function() {
      expect(Font.from({size: 16})).to.deep.equal({size: 16, family: [], style: 'normal', weight: 'normal'});
    });

    it('accepts font-like with size and family', function() {
      let fontLike = {size: 16, family: ['bar']};
      expect(Font.from(fontLike)).to.deep.equal({size: 16, family: ['bar'], style: 'normal', weight: 'normal'});
    });

    it('accepts font-like with size, family and weight', function() {
      let fontLike = {size: 16, family: ['bar'], weight: 'bold'};
      expect(Font.from(fontLike)).to.deep.equal({size: 16, family: ['bar'], weight: 'bold', style: 'normal'});
    });

    it('accepts font-like with size, family, weight and style', function() {
      let fontLike = {size: 16, family: ['bar'], weight: 'bold', style: 'italic'};
      expect(Font.from(fontLike)).to.deep.equal({size: 16, family: ['bar'], weight: 'bold', style: 'italic'});
    });

    it('rejects font-like without size', function() {
      expect(() => {
        Font.from({});
      }).to.throw('Font-like object missing size value');
    });

    it('accepts font string with size', function() {
      expect(Font.from('24px')).to.deep.equal({size: 24, family: [], weight: 'normal', style: 'normal'});
    });

    it('accepts font string with size and weight', function() {
      expect(Font.from('bold 24px')).to.deep.equal({size: 24, family: [], weight: 'bold', style: 'normal'});
    });

    it('accepts font string with size and style', function() {
      expect(Font.from('italic 24px')).to.deep.equal({size: 24, family: [], weight: 'normal', style: 'italic'});
    });

    it('accepts font string with size, style and weight', function() {
      expect(Font.from('italic bold 24px')).to.deep.equal({size: 24, family: [], weight: 'bold', style: 'italic'});
    });

    it('accepts font string with size and font-family', function() {
      expect(Font.from('24px foo')).to.deep.equal({size: 24, family: ['foo'], weight: 'normal', style: 'normal'});
    });

    it('accepts font string with size and multiple font-families', function() {
      expect(Font.from('24px foo,bar')).to.deep.equal({
        size: 24,
        family: ['foo', 'bar'],
        weight: 'normal',
        style: 'normal'
      });
    });

    it('accepts font string with weight, size and font-family', function() {
      expect(Font.from('bold 24px foo')).to.deep.equal({size: 24, family: ['foo'], weight: 'bold', style: 'normal'});
    });

    it('accepts font string with style, size and font-family', function() {
      expect(Font.from('italic 24px foo')).to.deep.equal({
        size: 24,
        family: ['foo'],
        weight: 'normal',
        style: 'italic'
      });
    });

    it('accepts font string with style, weight, size and font-family', function() {
      expect(Font.from('italic bold 24px foo')).to.deep.equal({
        size: 24,
        family: ['foo'],
        weight: 'bold',
        style: 'italic'
      });
    });

    it('normalizes components', function() {
      expect(Font.from('24px foo,   bar')).to.deep.equal({
        size: 24,
        family: ['foo', 'bar'],
        weight: 'normal',
        style: 'normal'
      });
      expect(Font.from('24px "foo"')).to.deep.equal({size: 24, family: ['foo'], weight: 'normal', style: 'normal'});
      expect(Font.from('24px    foo  ')).to.deep.equal({size: 24, family: ['foo'], weight: 'normal', style: 'normal'});
      expect(Font.from('24px \'foo\'')).to.deep.equal({size: 24, family: ['foo'], weight: 'normal', style: 'normal'});
      expect(Font.from('  italic  bold  24px  "foo"  ')).to.deep.equal({
        size: 24,
        family: ['foo'],
        weight: 'bold',
        style: 'italic'
      });
    });

    it('rejects empty font string', function() {
      expect(() => {
        Font.from('');
      }).to.throw('Invalid font syntax');
    });

    it('rejects font string with missing font size', function() {
      expect(() => {
        Font.from('bold');
      }).to.throw('Invalid font syntax');
    });

    it('rejects font string with incomplete font size', function() {
      expect(() => {
        Font.from('px');
      }).to.throw('Invalid font syntax');
    });

    it('rejects font string with unsupported font size prefix', function() {
      expect(() => {
        Font.from('foo 16px');
      }).to.throw('Invalid font style or weight foo');
    });

    it('rejects font string with unsupported style', function() {
      expect(() => {
        Font.from('foo bold 16px');
      }).to.throw('Invalid font style foo');
    });

    it('rejects font string with unsupported weight', function() {
      expect(() => {
        Font.from('italic foo 16px');
      }).to.throw('Invalid font weight foo');
    });

    it('rejects font string with too many size prefixes', function() {
      expect(() => {
        Font.from('foo normal normal 16px');
      }).to.throw('Too many font size prefixes');
    });

  });

  describe('isFontValue', function() {

    it('returns true for font values including null and "initial"', function() {
      expect(Font.isFontValue(null)).to.be.true;
      expect(Font.isFontValue('initial')).to.be.true;
      expect(Font.isFontValue(new Font(16))).to.be.true;
      expect(Font.isFontValue({size: 16})).to.be.true;
      expect(Font.isFontValue({size: 16, style: 'italic'})).to.be.true;
      expect(Font.isFontValue({size: 16, weight: 'bold', style: 'italic'})).to.be.true;
      expect(Font.isFontValue({size: 16, weight: 'bold', style: 'italic', family: ['foo']})).to.be.true;
      expect(Font.isFontValue('16px')).to.be.true;
      expect(Font.isFontValue('16px foo, bar')).to.be.true;
      expect(Font.isFontValue('bold 16px foo, bar')).to.be.true;
      expect(Font.isFontValue('italic 16px foo, bar')).to.be.true;
      expect(Font.isFontValue('italic bold 16px foo, bar')).to.be.true;
    });

    it('returns false for non-color values', function() {
      expect(Font.isFontValue({})).to.be.false;
      expect(Font.isFontValue('px')).to.be.false;
      expect(Font.isFontValue('')).to.be.false;
      expect(Font.isFontValue({style: 'italic'})).to.be.false;
    });

  });

  describe('isValidFontValue', function() {

    it('returns true for font values', function() {
      expect(Font.isValidFontValue(new Font(16))).to.be.true;
      expect(Font.isValidFontValue({size: 16})).to.be.true;
      expect(Font.isValidFontValue({size: 16, style: 'italic'})).to.be.true;
      expect(Font.isValidFontValue({size: 16, weight: 'bold', style: 'italic'})).to.be.true;
      expect(Font.isValidFontValue({size: 16, weight: 'bold', style: 'italic', family: ['foo']})).to.be.true;
      expect(Font.isValidFontValue('16px')).to.be.true;
      expect(Font.isValidFontValue('16px foo, bar')).to.be.true;
      expect(Font.isValidFontValue('bold 16px foo, bar')).to.be.true;
      expect(Font.isValidFontValue('italic 16px foo, bar')).to.be.true;
      expect(Font.isValidFontValue('italic bold 16px foo, bar')).to.be.true;
    });

    it('returns false for non-font values including null and "initial"', function() {
      expect(Font.isValidFontValue(null)).to.be.false;
      expect(Font.isValidFontValue('initial')).to.be.false;
      expect(Font.isValidFontValue({})).to.be.false;
      expect(Font.isValidFontValue('')).to.be.false;
      expect(Font.isValidFontValue('px')).to.be.false;
      expect(Font.isValidFontValue({style: 'italic'})).to.be.false;
    });

  });

});
