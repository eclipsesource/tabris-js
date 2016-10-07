import {expect} from '../test';
import {fontStringToObject, fontObjectToString} from '../../src/tabris/util-fonts';

describe('util-fonts', function() {

  describe('fontStringToObject', function() {

    let parse = function(str) {
      return fontStringToObject(str);
    };

    let parsing = function(str) {
      return function() {
        return fontStringToObject(str);
      };
    };

    it('parses valid sizes', function() {
      expect(parse('12px').size).to.equal(12);
      expect(parse('12px 20px').size).to.equal(12);
      expect(parse('8px ').size).to.equal(8);
      expect(parse(' 18px').size).to.equal(18);
      expect(parse('  50px  ').size).to.equal(50);
      expect(parse('12px').size).to.equal(12);
      expect(parse('italic 12px').size).to.equal(12);
      expect(parse('bold italic 12px').size).to.equal(12);
      expect(parse('12px Arial, Fantasy').size).to.equal(12);
      expect(parse("12px 'Times New Roman', Arial").size).to.equal(12);
      expect(parse('12px "Times New Roman", Arial').size).to.equal(12);
    });

    it('throws error for strings without valid size', function() {
      expect(parsing('12pxf')).to.throw();
      expect(parsing('12p x')).to.throw();
      expect(parsing('-1px')).to.throw();
      expect(parsing('foo13px')).to.throw();
      expect(parsing('8 px ')).to.throw();
      expect(parsing(' 18pt')).to.throw();
      expect(parsing('  px  ')).to.throw();
      expect(parsing('23')).to.throw();
    });

    it('parses valid styles', function() {
      expect(parse('italic 12px').style).to.equal('italic');
      expect(parse('bold italic 12px').style).to.equal('italic');
      expect(parse('italic bold 12px').style).to.equal('italic');
      expect(parse('italic bold 12px Arial, Times').style).to.equal('italic');
      expect(parse('normal normal 12px').style).to.equal('normal');
      expect(parse('bold normal 12px').style).to.equal('normal');
      expect(parse('normal 12px').style).to.equal('normal');
      expect(parse('12px').style).to.equal('normal');
      expect(parse('12px italic').style).to.equal('normal');
    });

    it('parses valid weight', function() {
      expect(parse('bold 12px').weight).to.equal('bold');
      expect(parse('black 12px').weight).to.equal('black');
      expect(parse('light   italic 12px').weight).to.equal('light');
      expect(parse('  italic thin 12px').weight).to.equal('thin');
      expect(parse(' italic  medium 12px Arial, Times').weight).to.equal('medium');
      expect(parse('normal normal 12px').weight).to.equal('normal');
      expect(parse('italic normal 12px').weight).to.equal('normal');
      expect(parse('normal 12px').weight).to.equal('normal');
      expect(parse('12px').weight).to.equal('normal');
      expect(parse('12px bold').weight).to.equal('normal');
    });

    it('throws error for strings with invalid styles', function() {
      expect(parsing('bold-italic 12px')).to.throw();
      expect(parsing('bold.italic 12px')).to.throw();
      expect(parsing('bold bold 12px')).to.throw();
      expect(parsing('italic italic 12px')).to.throw();
      expect(parsing('bold italic normal 12px')).to.throw();
      expect(parsing('normal normal  normal 12px')).to.throw();
      expect(parsing('bold0italic 12px')).to.throw();
      expect(parsing('foobar 12px')).to.throw();
      expect(parsing('12px foobar')).not.to.throw();
    });

    it('parses valid font families', function() {
      expect(parse('12px  ').family).to.eql(['']);
      expect(parse('12px Arial').family).to.eql(['Arial']);
      expect(parse('bold italic 12px Arial').family).to.eql(['Arial']);
      expect(parse('12px Arial, Fantasy').family).to.eql(['Arial', 'Fantasy']);
      expect(parse('12px Times New Roman,Fantasy').family).to.eql(['Times New Roman', 'Fantasy']);
      expect(parse('12px   Arial ,   Fantasy').family).to.eql(['Arial', 'Fantasy']);
      expect(parse('12px bold italic').family).to.eql(['bold italic']);
      expect(parse('12px Arial, Times New Roman ,Fantasy').family)
          .to.eql(['Arial', 'Times New Roman', 'Fantasy']);
      expect(parse('12px \' Arial \', "Times New Roman",Fantasy').family)
          .to.eql(['Arial', 'Times New Roman', 'Fantasy']);
    });

    it('throws error for strings with invalid family syntax', function() {
      expect(parsing('12px Arial "Times New Roman", Fantasy')).to.throw();
      expect(parsing('12px Arial "Times New Roman", Fantasy,')).to.throw();
      expect(parsing('12px\'Arial\', "Times New Roman", Fantasy')).to.throw();
      expect(parsing('12px Arial, "Times New Roman\', Fantasy')).to.throw();
      expect(parsing('12px Arial, foo "Times New Roman", Fantasy')).to.throw();
      expect(parsing('12px Arial, "Times New Roman" bar, Fantasy')).to.throw();
      expect(parsing('12px Ar\'ial, "Times New Roman", Fantasy')).to.throw();
      expect(parsing('12px Arial, Times New Roman", Fantasy')).to.throw();
      expect(parsing('12px Arial, "Times New Roman, Fantasy')).to.throw();
      expect(parsing('12px Arial,, Fantasy')).to.throw();
    });

  });

  describe('fontObjectToString', function() {

    let decode = function(arr) {
      return fontObjectToString(arr);
    };

    it('creates string from object', function() {
      expect(decode({family: ['Arial'], size: 12, weight: 'normal', style: 'normal'}))
        .to.equal('normal normal 12px Arial');
      expect(decode({
        family: ['Arial', 'Times New Roman'],
        size: 12,
        weight: 'normal',
        style: 'normal'
      })).to.equal('normal normal 12px Arial, Times New Roman');
      expect(decode({family: [''], size: 12, weight: 'normal', style: 'normal'}))
        .to.equal('normal normal 12px');
      expect(decode({family: [''], size: 12, weight: 'bold', style: 'normal'}))
        .to.equal('normal bold 12px');
      expect(decode({family: [''], size: 12, weight: 'normal', style: 'italic'}))
        .to.equal('italic normal 12px');
      expect(decode({family: [''], size: 12, weight: 'thin', style: 'italic'}))
        .to.equal('italic thin 12px');
      expect(decode({family: ['Arial'], size: 12, weight: 'medium', style: 'italic'}))
        .to.equal('italic medium 12px Arial');
    });

  });

});
