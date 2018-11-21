import {Color, LinearGradient, LinearGradientValue} from 'tabris';

let linearGradientValue: LinearGradientValue = {};
linearGradientValue = {colorStops: [5]};
linearGradientValue = {colorStops: ['red'], direction: 'foo'};
linearGradientValue = {colorStops: [['red', 5]]};
linearGradientValue = new LinearGradient();
linearGradientValue = new LinearGradient([], 'left');
linearGradientValue = new LinearGradient(['red']);
linearGradientValue = new LinearGradient([[Color.red, '5%']]);
linearGradientValue = new LinearGradient([], 'left', 'foo');
LinearGradient.from({});
LinearGradient.from({colorStops: [], direction: 'foo'});
LinearGradient.from({colorStops: [], bar: 'foo'});
LinearGradient.from({colorStops: [5]});

/*Expected
(3,
not assignable
(4,
not assignable
(5,
not assignable
(6,
not assignable
(7,
Expected 1-2 arguments
(8,
not assignable
(9,
not assignable
(10,
not assignable
(11,
Expected 1-2 arguments
(12,
not assignable
(13,
not assignable
(14,
not assignable
(15,
not assignable
*/