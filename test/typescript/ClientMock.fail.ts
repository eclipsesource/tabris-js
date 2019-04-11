import { tabris } from 'tabris';
import ClientMock from 'tabris/ClientMock';

const mock = new ClientMock();
mock.calls({op: 'foo'});
mock.calls({op: 'set', type: 'bar'});
mock.calls({op: 'get', properties: {}});
mock.calls({op: 'listen', property: 'foo'});
mock.calls({op: 'create', event: 'foo'});
mock.calls({op: 'call', event: 'foo'});
mock.calls({op: 'destroy', parameters: {}});
mock.calls({op: 'destroy', method: 'bar'});

/*Expected
(5,
not assignable
(6,
not assignable
(7,
not assignable
(8,
not assignable
(9,
not assignable
(10,
not assignable
(11,
not assignable
(12,
not assignable
*/