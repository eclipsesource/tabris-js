import {CollectionView, Widget} from 'tabris';

// Properties
let cellType: string|((item: any) => string);
let columnCount: number;
let firstVisibleIndex: number;
let createCell:  (cellType: string) => Widget;
let updateCell:  (cell: Widget, index: number) => void;
let cellHeight: number|'auto'|((item: any, cellType: string) => number);
let lastVisibleIndex: number;
let refreshEnabled: boolean;
let refreshIndicator: boolean;
let refreshMessage: string;

let widget: CollectionView = new CollectionView();

cellType = widget.cellType;
columnCount = widget.columnCount;
firstVisibleIndex = widget.firstVisibleIndex;
createCell = widget.createCell;
updateCell = widget.updateCell;
cellHeight = widget.cellHeight;
lastVisibleIndex = widget.lastVisibleIndex;
refreshEnabled = widget.refreshEnabled;
refreshIndicator = widget.refreshIndicator;
refreshMessage = widget.refreshMessage;

widget.cellType = cellType;
widget.columnCount = columnCount;
widget.createCell = createCell;
widget.updateCell = updateCell;
widget.cellHeight = cellHeight;
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
