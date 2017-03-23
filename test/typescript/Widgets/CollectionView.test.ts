import {CollectionView, Cell} from 'tabris';

// Properties
let cellType: string|((item: any) => string);
let columnCount: number;
let firstVisibleIndex: number;
let initializeCell:  (cell: Cell, cellType: string) => void;
let createCell:  (cellType: string) => Cell;
let itemHeight: number|((item: any, cellType: string) => number);
let lastVisibleIndex: number;
let refreshEnabled: boolean;
let refreshIndicator: boolean;
let refreshMessage: string;

let widget: CollectionView;

widget.cellType = cellType;
widget.columnCount = columnCount;
widget.initializeCell = initializeCell;
widget.itemHeight = itemHeight;
widget.refreshEnabled = refreshEnabled;
widget.refreshIndicator = refreshIndicator;
widget.refreshMessage = refreshMessage;

cellType = widget.cellType;
columnCount = widget.columnCount;
firstVisibleIndex = widget.firstVisibleIndex;
createCell = widget.createCell;
initializeCell = widget.initializeCell;
itemHeight = widget.itemHeight;
lastVisibleIndex = widget.lastVisibleIndex;
refreshEnabled = widget.refreshEnabled;
refreshIndicator = widget.refreshIndicator;
refreshMessage = widget.refreshMessage;

// Methods
let items: any[];
let index: number;
let count: number;
let noReturnValue: void;

noReturnValue = widget.insert(items);
noReturnValue = widget.insert(items, index);
noReturnValue = widget.refresh();
noReturnValue = widget.refresh(index);
noReturnValue = widget.remove(index);
noReturnValue = widget.remove(index, count);
noReturnValue = widget.reveal(index);
