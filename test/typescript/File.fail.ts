import 'tabris';

let file: File = new File([]);
file = new File();
file = new File([], '', {lastModified: '13'});
file.lastModified = 0;

/*Expected
(3,
Expected 2-3 arguments
(4,
Expected 2-3 arguments
(5,
not assignable
(6,
read-only property
*/