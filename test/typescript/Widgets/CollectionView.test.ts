import { CollectionView, Widget, PropertyChangedEvent, Properties, Button, Composite } from 'tabris';

// Properties
let cellHeight: number|'auto'|((index: number, cellType: string) => number|'auto');
let cellType: string|((index: number) => string);
let columnCount: number;
let createCell: (cellType: string) => Widget;
let updateCell: (cell: Widget, index: number) => void;
let firstVisibleIndex: number;
let lastVisibleIndex: number;
let refreshEnabled: boolean;
let refreshIndicator: boolean;
let refreshMessage: string;
let nullValue: null;
let scrollbarVisible: boolean;

let widget: CollectionView<Widget> = new CollectionView();
const composite: Composite = widget;

cellHeight = widget.cellHeight;
cellType = widget.cellType as string|((index: number) => string);
nullValue = widget.cellType as null;
columnCount = widget.columnCount;
createCell = widget.createCell;
updateCell = widget.updateCell;
firstVisibleIndex = widget.firstVisibleIndex;
lastVisibleIndex = widget.lastVisibleIndex;
refreshEnabled = widget.refreshEnabled;
refreshIndicator = widget.refreshIndicator;
refreshMessage = widget.refreshMessage;
scrollbarVisible = widget.scrollbarVisible;

widget.cellHeight = cellHeight;
widget.cellType = cellType;
widget.cellType = nullValue;
widget.columnCount = columnCount;
widget.createCell = createCell;
widget.updateCell = updateCell;
widget.refreshEnabled = refreshEnabled;
widget.refreshIndicator = refreshIndicator;
widget.refreshMessage = refreshMessage;

const properties = {
  cellHeight, cellType, columnCount, createCell, updateCell, refreshEnabled, refreshIndicator, refreshMessage
};
widget = new CollectionView(properties);
widget.set(properties);
widget.createCell = createCell;
widget.updateCell = updateCell;

// Methods
let index: number = 42;
const count: number = 42;
let noReturnValue: void;

noReturnValue = widget.insert(index);
noReturnValue = widget.insert(index, count);
noReturnValue = widget.refresh();
noReturnValue = widget.refresh(index);
noReturnValue = widget.remove(index);
noReturnValue = widget.remove(index, count);
noReturnValue = widget.reveal(index);
index = widget.itemIndex(new Composite());

widget
  .onFirstVisibleIndexChanged((ev: PropertyChangedEvent<CollectionView<Widget>, number>) => {})
  .onLastVisibleIndexChanged((ev: PropertyChangedEvent<CollectionView<Widget>, number>) => {})
  .onCreateCellChanged((ev: PropertyChangedEvent<CollectionView<Widget>, typeof widget.createCell>) => {})
  .onUpdateCellChanged((ev: PropertyChangedEvent<CollectionView<Widget>, typeof widget.updateCell>) => {});

const buttonCV: CollectionView<Button> = new CollectionView<Button>({
  createCell: () => new Button(),
  updateCell: cell => cell.text = 'foo'
});

let button: Button|undefined|null = buttonCV.children().first();
button = buttonCV.cellByItemIndex(0);

class CustomComponent extends CollectionView<Widget> {
  public foo: string;
  constructor(props: Properties<CustomComponent>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});
