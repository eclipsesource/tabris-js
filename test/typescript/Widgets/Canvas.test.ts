import {Canvas, CanvasContext} from 'tabris';

let canvas: Canvas = new Canvas();

// Methods
let contextType: string = '2d';
let width: number = 42;
let height: number = 42;

let context: CanvasContext = canvas.getContext(contextType, width, height);
