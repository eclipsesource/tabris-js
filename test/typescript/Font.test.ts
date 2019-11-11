import {FontValue, Font} from 'tabris';

let fontValue: FontValue = new Font(16);
fontValue = '16px';
fontValue = {size: 16};
fontValue = {size: 16, style: 'italic'};
fontValue = {size: 16, style: 'normal'};
fontValue = {size: 16, weight: 'black'};
fontValue = {size: 16, weight: 'bold'};
fontValue = {size: 16, weight: 'light'};
fontValue = {size: 16, weight: 'medium'};
fontValue = {size: 16, weight: 'normal'};
fontValue = {size: 16, weight: 'thin'};
fontValue = {size: 16, family: []};
fontValue = {size: 16, family: ['foo']};
fontValue = {size: 16, family: ['foo', 'bar']};

let font: Font = new Font(16);
font = new Font(16, [], 'normal');
font = new Font(16, [], 'black');
font = new Font(16, [], 'bold');
font = new Font(16, [], 'light');
font = new Font(16, [], 'medium');
font = new Font(16, [], 'normal');
font = new Font(16, [], 'thin');
font = new Font(16, [], 'normal', 'normal');
font = new Font(16, [], 'normal', 'italic');
font = new Font(16, ['foo'], 'normal', 'italic');
font = new Font(16, ['foo', 'bar'], 'normal', 'italic');
font = Font.from('16px');
font = Font.from({size: 16});
font = Font.from({size: 16, style: 'italic'});
font = Font.from({size: 16, style: 'normal'});
font = Font.from({size: 16, weight: 'black'});
font = Font.from({size: 16, weight: 'bold'});
font = Font.from({size: 16, weight: 'light'});
font = Font.from({size: 16, weight: 'medium'});
font = Font.from({size: 16, weight: 'normal'});
font = Font.from({size: 16, weight: 'thin'});
font = Font.from({size: 16, family: []});
font = Font.from({size: 16, family: ['foo']});
font = Font.from({size: 16, family: ['foo', 'bar']});
const bool: boolean = font.equals(font);


let str: string;
str = font.toString();

let obj: object = {};

if (Font.isFontValue(obj)) {
  fontValue = obj;
}

if (Font.isValidFontValue(obj)) {
  fontValue = obj;
}

let fontFamily: string;
fontFamily = Font.serif;
fontFamily = Font.sansSerif;
fontFamily = Font.condensed;
fontFamily = Font.monospace;
