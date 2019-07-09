export default async function test() {
  let file: File = new File([], '');
  file = new File(['', {}, new Uint8Array([])], '');
  file = new File([], '', {});
  file = new File([], '', {lastModified: 13});
  file = new File([], '', {type: 'foo'});
  const blob = file;
  const ab: ArrayBuffer = await file.arrayBuffer();
  let str: string = await file.text();
  str = file.type;
  let num: number = file.size;
  num = file.lastModified;
}
