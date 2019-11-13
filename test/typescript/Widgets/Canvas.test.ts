import {Canvas, CanvasContext} from 'tabris';

let canvas: Canvas = new Canvas();

// Methods
let contextType: string = '2d';
let width: number = 42;
let height: number = 42;

let context: CanvasContext = canvas.getContext(contextType, width, height);
canvas.toBlob((value: Blob) => null, 'image/png');
canvas.toBlob((value: Blob) => null, 'image/jpeg');
canvas.toBlob((value: Blob) => null, 'image/webp');
canvas.toBlob((value: Blob) => null, 'image/webp', 0.4);
canvas.toBlob((value: Blob) => null);
