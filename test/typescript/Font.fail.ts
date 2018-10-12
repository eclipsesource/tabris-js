import {FontValue, Font} from 'tabris';

let fontValue: FontValue = {};
fontValue = {};
fontValue = {style: 'bar'};
fontValue = new Font();
fontValue = new Font('foo');
fontValue = new Font(16, [], 'black', 'italic', 'foo');
fontValue = new Font(16, [], 'black', 'foo');
fontValue = new Font(16, [], 'foo', 'italic');
fontValue = new Font(16, 'foo', 'black', 'italic');
fontValue = Font.from({});
fontValue = Font.from(5);
fontValue = Font.from({size: 5, foo: 'bar'});

/*Expected
(3,
not assignable
(4,
not assignable
(5,
not assignable
(6,
Expected 1-4 arguments
(7,
not assignable
(8,
Expected 1-4 arguments
(9,
not assignable
(10,
not assignable
(11,
not assignable
(12,
not assignable
(13,
not assignable
(14,
not assignable
*/