import { Composite, NativeObject } from 'tabris';

const obj: NativeObject = new Composite({cid: 'o1'});

obj.set({cid: 'o1'});
obj.cid = 'o1';
obj.set({trigger: (() => {}) as any})

/*Expected
(3,
'cid'
(6,
'cid'
(7,
*/