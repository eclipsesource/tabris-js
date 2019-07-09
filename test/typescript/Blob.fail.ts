import 'tabris';

let blob: Blob = new Blob('');
blob = new Blob({});
blob.size = 0;
blob.type = '';

/*Expected
(3,
not assignable to parameter
(4,
not assignable to parameter
(5,
is a read-only property
(6,
is a read-only property
*/
