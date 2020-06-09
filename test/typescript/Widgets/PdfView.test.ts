import {PdfView, ColorValue, PdfViewLoadEvent, PropertyChangedEvent, Properties, Color} from 'tabris';

let widget: PdfView = new PdfView();

// Properties
let pdf: Blob | string | null;
let bool: boolean;
let num: number;
let color: ColorValue;

pdf = widget.src;
pdf = widget.src as Blob;
pdf = widget.src as string;
bool = widget.zoomEnabled;
num = widget.elevation;
num = widget.spacing;
color = widget.pageBackground;

widget.src = pdf;
widget.zoomEnabled = bool;
widget.elevation = num;
widget.spacing = num;
widget.pageBackground = color;


let properties: Properties<PdfView> = {src: pdf, zoomEnabled: bool, spacing: num, elevation: num, pageBackground: color};
widget = new PdfView(properties);
widget.set(properties);

// Events
let target: PdfView = widget;
let timeStamp: number = 0;
let type: string = 'foo';
let error: boolean = false;
let value: number = 0;

let pdfViewLoadEvent: PdfViewLoadEvent = {target, timeStamp, type, error};


widget.onLoad((event: PdfViewLoadEvent) => {})

class CustomComponent extends PdfView {
  public foo: string;
  constructor(props: Properties<PdfView> & Partial<Pick<CustomComponent, 'foo'>>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});
