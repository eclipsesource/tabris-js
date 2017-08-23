import {
  Color,
  TabFolder,
  Tab,
  TabFolderScrollEvent,
  TabFolderSelectEvent,
  PropertyChangedEvent
} from 'tabris';


let widget: TabFolder = new TabFolder;

// Properties
let paging: boolean;
let selection: Tab;
let tabBarLocation: 'auto' | 'bottom' | 'hidden' | 'top';
let tabMode: 'fixed' | 'scrollable';
let textColor: Color;

paging = widget.paging;
selection = widget.selection;
tabBarLocation = widget.tabBarLocation;
tabMode = widget.tabMode;
textColor = widget.textColor;

widget.paging = paging;
widget.selection = selection;
widget.tabBarLocation = tabBarLocation;
widget.tabMode = tabMode;
widget.textColor = textColor;

// Events
let target: TabFolder = widget;
let timeStamp: number = 0;
let type: string = 'foo';
let offset: number = 0;
let value: Tab = widget.selection;

let tabFolderScrollEvent: TabFolderScrollEvent = {target, timeStamp, type, offset, selection};
let tabFolderSelectEvent: TabFolderSelectEvent = {target, timeStamp, type, selection};
let tabFolderSelectionChangedEvent: PropertyChangedEvent<TabFolder, Tab> = {target, timeStamp, type, value};

widget.on({
  selectionChanged: (event: PropertyChangedEvent<TabFolder, Tab>) => {},
  select: (event: TabFolderSelectEvent) => {},
  scroll: (event: TabFolderScrollEvent) => {}
});
