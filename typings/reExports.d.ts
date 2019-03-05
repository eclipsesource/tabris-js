
declare var ImageDataConstructor: typeof ImageData;
declare var StorageConstructor: typeof Storage;
declare var WebSocketConstructor: typeof WebSocket;
declare var XMLHttpRequestConstructor: typeof XMLHttpRequest;
declare var CryptoConstructor: typeof Crypto;
declare var cryptoObject: Crypto;
declare var workerConstructor: typeof Worker;
declare var RequestConstructor: typeof Request;
declare var ResponseConstructor: typeof Response;
declare var HeadersConstructor: typeof Headers;
declare var fetchFunction: typeof fetch;

export {
  ImageDataConstructor as ImageData,
  StorageConstructor as Storage,
  WebSocketConstructor as WebSocket,
  XMLHttpRequestConstructor as XMLHttpRequest,
  CryptoConstructor as Crypto,
  cryptoObject as crypto,
  RequestConstructor as Request,
  ResponseConstructor as Response,
  HeadersConstructor as Headers,
  fetchFunction as fetch
};
