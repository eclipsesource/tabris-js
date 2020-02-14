import {devTools} from 'tabris';

let none: void;
let bool: boolean;

bool = devTools.showUi();
none = devTools.hideUi();
bool = devTools.isUiVisible();
