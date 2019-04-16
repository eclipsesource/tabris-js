import { tabris } from 'tabris';
import ClientMock from 'tabris/ClientMock';

let mock = new ClientMock();
mock = new ClientMock({'tabris.Foo': {bar: 'baz', otherBar: 23}});
tabris._init(mock, {headless: false});

const anything: 1 | 'foo' | boolean = mock.properties('cid').prop;
mock.resetCalls();
let op: 'set' | 'get' | 'create' | 'call' | 'destroy' | 'listen'  = mock.calls()[0].op;
let str: string = mock.calls()[0].type;
str = mock.calls()[0].event;
str = mock.calls()[0].method;
str = mock.calls()[0].property;
str = mock.calls()[0].type;
str = mock.calls()[0].properties.foo;
let bool: boolean = mock.calls()[0].listen;
let num: number = mock.calls()[0].properties.foo;
str = mock.calls()[0].properties.foo;
num = mock.calls()[0].parameters.foo;
str = mock.calls()[0].parameters.foo;

op = mock.calls({op: 'set', properties: {foo: 'bar'}, id: '$12'})[0].op;
str = mock.calls({op: 'set'})[0].properties.foo;
num = mock.calls({op: 'set'})[0].properties.foo;
bool = mock.calls({op: 'listen', event: 'x'})[0].listen;
str = mock.calls({op: 'get'})[0].property;
str = mock.calls({op: 'get'})[0].id;
str = mock.calls({op: 'create'})[0].properties.foo;
num = mock.calls({op: 'create'})[0].properties.foo;
str = mock.calls({op: 'create', type: 'myType'})[0].id;
str = mock.calls({op: 'destroy', id: 'foo'})[0].id;
