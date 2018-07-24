import {Canvas, CanvasContext, Properties} from 'tabris';

let canvas: Canvas = new Canvas();

// Methods
let contextType: string = '2d';
let width: number = 42;
let height: number = 42;

let context: CanvasContext = canvas.getContext(contextType, width, height);

class CustomComponent extends Canvas {
  public foo: string;
  constructor(props: Properties<CustomComponent>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});
