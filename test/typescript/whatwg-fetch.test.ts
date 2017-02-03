declare type T = Object;

let result: Promise<Response> = fetch('URL');
result.then((response) => {
  let errorResponse: Response = response.error();
  let clonedResponse: Response = response.clone();
  let redirectedResponse: Response = response.redirect('url', 0);
  let arrayBuffer: Promise<ArrayBuffer> = response.arrayBuffer();
  let blob: Promise<Blob> = response.blob();
  let formData: Promise<FormData> = response.formData();
  let json: Promise<any> = response.json();
  let json2: Promise<T> = response.json<T>();
  let text: Promise<string> = response.text();
});

let request: Request = new Request('input');
let fetchWithRequest: Promise<Response> = fetch(request);
