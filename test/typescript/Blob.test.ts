export default async function() {
  let blob: Blob = new Blob();
  blob = new Blob([]);
  blob = new Blob(['', {}, new Uint8Array([])]);
  blob = new Blob([], {});
  blob = new Blob([], {type: 'foo'});
  const ab: ArrayBuffer = await blob.arrayBuffer();
  let str: string = await blob.text();
  str = blob.type;
  const num: number = blob.size;
}
