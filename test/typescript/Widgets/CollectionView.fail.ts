import {CollectionView} from 'tabris';

let widget = new CollectionView();

const firstVisibleIndex = widget.firstVisibleIndex;
widget = new CollectionView({firstVisibleIndex});
widget.set({firstVisibleIndex});
widget.firstVisibleIndex = firstVisibleIndex;

const lastVisibleIndex = widget.lastVisibleIndex;
widget = new CollectionView({lastVisibleIndex});
widget.set({lastVisibleIndex});
widget.lastVisibleIndex = lastVisibleIndex;

/*Expected
(6,30): error TS2345
(7,13): error TS2345
'firstVisibleIndex' does not exist
(8,8): error TS2540: Cannot assign to 'firstVisibleIndex' because it is a constant or a read-only property.

(11,30): error TS2345
(12,13): error TS2345
'lastVisibleIndex' does not exist
(13,8): error TS2540: Cannot assign to 'lastVisibleIndex' because it is a constant or a read-only property.
*/