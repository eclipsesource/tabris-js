import {Percent, PercentValue} from 'tabris';

let percentValue: PercentValue = new Percent(0);
percentValue = '5%';
percentValue = {percent: 5};

let percent: Percent = new Percent(5);
percent = Percent.from('foo');
percent = Percent.from({percent: 5});
percent = Percent.from(percent);
percent = Percent.from(percentValue);
percentValue = percent;

let num: number;
num = percent.percent;
num = percent.valueOf();

let str: string;
str = percent.toString();

let obj: object = {};

if (Percent.isValidPercentValue(obj)) {
  percentValue = obj;
}
