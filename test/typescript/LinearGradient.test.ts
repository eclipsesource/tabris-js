import {LinearGradient, Color, LinearGradientValue, Percent} from 'tabris';

let value: LinearGradientValue = new LinearGradient([Color.red]);
value = 'foo';
value = {colorStops: [Color.red]};
value = {colorStops: [Color.red], direction: 'left'};
value = {colorStops: [Color.red], direction: 'top'};
value = {colorStops: [Color.red], direction: 'right'};
value = {colorStops: [Color.red], direction: 'bottom'};
value = {colorStops: [Color.red], direction: 5};
value = {colorStops: [Color.red, [Color.red, new Percent(5)]], direction: 5};

let gradient: LinearGradient = new LinearGradient([Color.red]);
gradient = new LinearGradient([Color.red, Color.blue], 5);
gradient = new LinearGradient([Color.red, [Color.blue, new Percent(5)]]);
gradient = LinearGradient.from({colorStops: [Color.red, Color.blue], direction: 5});
gradient = LinearGradient.from({colorStops: [Color.red, Color.blue], direction: 'left'});
gradient = LinearGradient.from({colorStops: [Color.red, Color.blue], direction: 'top'});
gradient = LinearGradient.from({colorStops: [Color.red, Color.blue], direction: 'right'});
gradient = LinearGradient.from({colorStops: [Color.red, Color.blue], direction: 'bottom'});
gradient = LinearGradient.from({colorStops: [Color.red, [Color.blue, new Percent(5)]]});
gradient = LinearGradient.from({colorStops: ['red', 'blue']});
gradient = LinearGradient.from({colorStops: ['red', ['blue', '5%']]});

let colorStops: (Color | [Color, Percent])[] = gradient.colorStops;
let direction: number = gradient.direction;
let bool: boolean = gradient.equals(gradient);

let str: string;
str = gradient.toString();

let obj: object = {};

if (LinearGradient.isLinearGradientValue(obj)) {
  value = obj;
}

if (LinearGradient.isValidLinearGradientValue(obj)) {
  value = obj;
}
