import {ImageValue, Image} from 'tabris';

let imageValue: ImageValue = {};
imageValue = {};
imageValue = {width: 5};
imageValue = new Image();
imageValue = new Image({});
imageValue = new Image(5);
imageValue = new Image({width: 5, height: 5});
imageValue = Image.from();
imageValue = Image.from({});
imageValue = Image.from(5);
imageValue = Image.from({width: 5, height: 5});
imageValue.src = 'foo';
imageValue.width = 5;
imageValue.height = 5;
imageValue.scale = 5;

/*Expected
(3,
not assignable
(4,
not assignable
(5,
not assignable
(6,
Expected 1 arguments, but got 0
(7,
not assignable
(8,
not assignable
(9,
not assignable
(10,
Expected 1 arguments, but got 0
(11,
not assignable
(12,
not assignable
(13,
not assignable
(14,
read-only
(15,
read-only
(16,
read-only
(17,
read-only
*/