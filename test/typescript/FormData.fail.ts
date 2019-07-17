import 'tabris';

export default async function() {
  const formData: FormData = new FormData();
  formData.append('foo', 'bar', 'baz');
  formData.set('foo', 'bar', 'baz');
}

/*Expected
(5,
not assignable to parameter
(6,
not assignable to parameter
*/
