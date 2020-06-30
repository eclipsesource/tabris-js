import {checkType} from 'tabris';

let value: unknown = {};

checkType();
checkType({});
checkType({}, 'foo');
const blob: Blob = checkType(value, Date);
const string: string = checkType(value, Number);
checkType(value, Date, {foo: 'bar'});
checkType(value, Date, (a: unknown, b: unknown) => console.log(b));
checkType(value, String, boolean => { const date: boolean = boolean; });
checkType(value, Date, date => { const number: number = date; });

/*Expected
(5,
(6,
(7,
(8,
(9,
(10,
(11,
(12,
(13,
*/
