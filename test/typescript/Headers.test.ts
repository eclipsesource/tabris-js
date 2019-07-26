import 'tabris';

export default async function() {
  let str: string | null = '';
  const headers: Headers = new Headers();
  headers.append('foo', 'bar');
  headers.set('foo', 'bar');
  headers.delete('foo');
  str = headers.get('foo');
  const values: string[] = headers.getAll('foo');
  const bool: boolean = headers.has('foo');
  for (const entry of headers) {
    str = entry[0];
    str = entry[1];
  }
  for (const entry of headers.entries()) {
    str = entry[0];
    str = entry[1];
  }
  for (const value of headers.values()) {
    str = value;
  }
  for (const key of headers.keys()) {
    str = key;
  }
}
