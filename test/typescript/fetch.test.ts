import 'tabris';

(async () => {
  let response: Response = await fetch('URL');
  response = await fetch('URL', {});
  response = await fetch('URL', {method: 'foo'});
  response = await fetch('URL', {headers: new Headers()});
  response = await fetch('URL', {headers: {foo: 'bar'}});
  response = await fetch('URL', {headers: [['foo', 'bar'], ['foo2', 'bar2']]});
})();
