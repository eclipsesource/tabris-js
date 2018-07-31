import {Composite} from 'tabris';

let widget: Composite = new Composite();

const bounds = widget.bounds;
widget = new Composite({bounds});
widget.set({bounds});
widget.bounds = bounds;

const cid = widget.cid;
widget = new Composite({cid});
widget.set({cid});
widget.cid = cid;
widget.onCidChanged(function() {});

widget.set({on: (ev: any) => widget});
widget.set({on: undefined});

/*Expected
(6,25): error TS2345
(7,13): error TS2345
(8,8): error TS2540: Cannot assign to 'bounds' because it is a constant or a read-only property

(11,25): error TS2345
(12,13): error TS2345
(13,8): error TS2540: Cannot assign to 'cid' because it is a constant or a read-only property.
(14,8): error TS2551

(16,
(17,
 */
