import 'tabris';

declare type T = object;

let response: Response = Response.error();
response = Response.redirect('url', 0);
response = response.clone();

(async () => {
  const arrayBuffer: ArrayBuffer = await response.arrayBuffer();
  const json: unknown = await response.json();
  const json2: T = await response.json<T>();
  let text: Promise<string> = response.text();
  let blob: Promise<Blob> = response.blob();
})();