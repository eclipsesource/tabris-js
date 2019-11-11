import {Color, ColorValue} from 'tabris';

let colorValue: ColorValue = new Color(0, 0, 0);
colorValue = 'blue';
colorValue = [0, 0, 0];
colorValue = [0, 0, 0, 0];
colorValue = {red: 0, green: 0, blue: 0, alpha: 0};
colorValue = {red: 0, green: 0, blue: 0};

let color: Color = new Color(0, 0, 0);
color = new Color(0, 0, 0, 255);
color = Color.from('blue');
color = Color.from([0, 0, 0]);
color = Color.from([0, 0, 0, 0]);
color = Color.from({red: 0, green: 0, blue: 0, alpha: 0});
color = Color.from({red: 0, green: 0, blue: 0});
color = Color.from(color);
color = Color.from(colorValue);
color = Color.black;
color = Color.silver;
color = Color.gray;
color = Color.white;
color = Color.maroon;
color = Color.red;
color = Color.purple;
color = Color.fuchsia;
color = Color.green;
color = Color.lime;
color = Color.olive;
color = Color.yellow;
color = Color.navy;
color = Color.blue;
color = Color.teal;
color = Color.aqua;
let bool: boolean = color.equals(color);

let num: number;
num = color.red;
num = color.green;
num = color.blue;
num = color.alpha;

let str: string;
str = color.toString();

let array: [number, number, number, number] = color.toArray();

let obj: object = {};

if (Color.isColorValue(obj)) {
  colorValue = obj;
}

if (Color.isValidColorValue(obj)) {
  colorValue = obj;
}
