import { Composite, NativeObject } from 'tabris';

const obj: NativeObject = new Composite({cid: 'o1'});

obj.set({cid: 'o1'});
obj.cid = 'o1';

obj.set({foo: 'foo'});

obj.set({on: (ev: any) => obj});
obj.set({on: undefined});

/*Expected
(3,42): error TS2345
'cid' does not exist in type

(6,5): error TS2540: Cannot assign to 'cid' because it is a constant or a read-only property

(8,
(10,
(11,
*/