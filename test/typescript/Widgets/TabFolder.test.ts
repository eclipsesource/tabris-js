import {TabFolder, Tab} from 'tabris';

let widget: TabFolder = new TabFolder;

// Properties
let paging: boolean;
let selection: Tab;
let tabBarLocation: 'auto' | 'bottom' | 'hidden' | 'top';
let tabMode: 'fixed' | 'scrollable';

paging = widget.paging;
selection = widget.selection;
tabBarLocation = widget.tabBarLocation;
tabMode = widget.tabMode;

widget.paging = paging;
widget.selection = selection;
widget.tabBarLocation = tabBarLocation;
widget.tabMode = tabMode;

// Events
let offset: number;
widget.on({
  selectionChanged: event => selection = event.value,
  select: event => selection = event.selection,
  scroll: event => {
    offset = event.offset;
    selection = event.selection;
  }
});
