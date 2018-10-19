import {PercentValue, Percent} from 'tabris';

let percentValue: PercentValue = {};
percentValue = 5;
percentValue = new Percent(0, 0);
percentValue = new Percent();
percentValue = new Percent({});
percentValue = new Percent('5');
percentValue = Percent.from({});
percentValue = Percent.from();
percentValue = Percent.from(0, 0);
percentValue = Percent.from(5);

/*Expected
(3,
not assignable
(4,
not assignable
(5,
Expected 1 arguments
(6,
Expected 1 arguments
(7,
not assignable
(8,
not assignable
(9,
not assignable
(10,
Expected 1 arguments
(11,
Expected 1 arguments
(12,
is not assignable
*/