import {CollectionView, Widget} from 'tabris';

// Properties
let cellHeight: number|'auto'|((index: number, cellType: string) => number);
let cellType: string|((index: number) => string);
let columnCount: number;
let createCell:  (cellType: string) => Widget;
let updateCell:  (cell: Widget, index: number) => void;
let firstVisibleIndex: number;
let lastVisibleIndex: number;
let refreshEnabled: boolean;
let refreshIndicator: boolean;
let refreshMessage: string;

let widget: CollectionView = new CollectionView();

cellHeight = widget.cellHeight;
cellType = widget.cellType;
columnCount = widget.columnCount;
createCell = widget.createCell;
updateCell = widget.updateCell;
firstVisibleIndex = widget.firstVisibleIndex;
lastVisibleIndex = widget.lastVisibleIndex;
refreshEnabled = widget.refreshEnabled;
refreshIndicator = widget.refreshIndicator;
refreshMessage = widget.refreshMessage;

widget.cellHeight = cellHeight;
widget.cellType = cellType;
widget.columnCount = columnCount;
widget.createCell = createCell;
widget.updateCell = updateCell;
widget.refreshEnabled = refreshEnabled;
widget.refreshIndicator = refreshIndicator;
widget.refreshMessage = refreshMessage;

// Methods
let index: number = 42;
let count: number = 42;
let noReturnValue: void;

noReturnValue = widget.insert(index);
noReturnValue = widget.insert(index, count);
noReturnValue = widget.refresh();
noReturnValue = widget.refresh(index);
noReturnValue = widget.remove(index);
noReturnValue = widget.remove(index, count);
noReturnValue = widget.reveal(index);
