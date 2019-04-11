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
widget.set({appendTo: (() => {}) as any});
widget.set({trigger: (() => {}) as any});
widget.onAbsoluteBoundsChanged(() => {});

/*Expected
(6,
(7,
(8,
bounds

(11,
(12,
(13,
cid
(14,
(15,
(16,
(17,
 */
