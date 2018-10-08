import {Canvas, CanvasContext, ImageData, ColorValue, Font} from 'tabris';

let ctx: CanvasContext = new Canvas().getContext('2d', 100, 100);

// Properties
let fillStyle: ColorValue;
let font: Font;
let lineCap: 'butt' | 'round' | 'square';
let lineJoin: 'bevel' | 'miter' | 'round';
let lineWidth: number;
let strokeStyle: ColorValue;
let textAlign: 'center' | 'end' | 'left' | 'right' | 'start';
let textBaseline: 'alphabetic' | 'bottom' | 'hanging' | 'ideographic' | 'middle' | 'top';

fillStyle = ctx.fillStyle;
font = ctx.font;
lineCap = ctx.lineCap;
lineJoin = ctx.lineJoin;
lineWidth = ctx.lineWidth;
strokeStyle = ctx.strokeStyle;
textAlign = ctx.textAlign;
textBaseline = ctx.textBaseline;

ctx.fillStyle = fillStyle;
ctx.font = font;
ctx.lineCap = lineCap;
ctx.lineJoin = lineJoin;
ctx.lineWidth = lineWidth;
ctx.strokeStyle = strokeStyle;
ctx.textAlign = textAlign;
ctx.textBaseline = textBaseline;

// Methods
let num: number = 42;
let bool: boolean = false;
let voidReturnValue: void;
let imageData: ImageData;
let text: string = '';

voidReturnValue = ctx.arc(num, num, num, num, num, bool);
voidReturnValue = ctx.beginPath();
voidReturnValue = ctx.bezierCurveTo(num, num, num, num, num, num);
voidReturnValue = ctx.clearRect(num, num, num, num);
voidReturnValue = ctx.closePath();
imageData = ctx.createImageData(num, num);
imageData = ctx.createImageData(imageData);
voidReturnValue = ctx.fill();
voidReturnValue = ctx.fillRect(num, num, num, num);
voidReturnValue = ctx.fillText(text, num, num);
imageData = ctx.getImageData(num, num, num, num);
voidReturnValue = ctx.lineTo(num, num);
voidReturnValue = ctx.moveTo(num, num);
voidReturnValue = ctx.putImageData(imageData, num, num);
voidReturnValue = ctx.quadraticCurveTo(num, num, num, num);
voidReturnValue = ctx.rect(num, num, num, num);
voidReturnValue = ctx.restore();
voidReturnValue = ctx.rotate(num);
voidReturnValue = ctx.save();
voidReturnValue = ctx.scale(num, num);
voidReturnValue = ctx.setTransform(num, num, num, num, num, num);
voidReturnValue = ctx.stroke();
voidReturnValue = ctx.strokeRect(num, num, num, num);
voidReturnValue = ctx.strokeText(text, num, num);
voidReturnValue = ctx.transform(num, num, num, num, num, num);
voidReturnValue = ctx.translate(num, num);
