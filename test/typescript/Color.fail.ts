import {ColorValue, Color} from 'tabris';

let colorValue: ColorValue = {};
colorValue = [0, 0];
colorValue = [0, 0, 0, 0, 0];
colorValue = {red: 0, green: 0};
colorValue = new Color(0, 0);
colorValue = new Color(0, 0, 0, 0, 0);
colorValue = Color.from({});
colorValue = Color.from([0, 0]);
colorValue = Color.from([0, 0, 0, 0, 0]);
colorValue = Color.from({red: 0, green: 0});

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
Expected 3-4 arguments
(8,
Expected 3-4 arguments
(9,
is not assignable
(10,
is not assignable
(11,
is not assignable
(12,
not assignable
*/