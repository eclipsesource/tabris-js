import {Canvas, CanvasContext} from 'tabris';

let canvas: Canvas;

// Methods
let contextType: string;
let width: number;
let height: number;

let context: CanvasContext = canvas.getContext(contextType, width, height);
