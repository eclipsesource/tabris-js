import 'tabris';

let isNumber: number;
let isAny: any;
let isString: string;
let isStringOrNull: string | null;
let isBoolean: boolean;
let isVoid: void;

isNumber = XMLHttpRequest.DONE;
isNumber = XMLHttpRequest.HEADERS_RECEIVED;
isNumber = XMLHttpRequest.LOADING;
isNumber = XMLHttpRequest.OPENED;
isNumber = XMLHttpRequest.UNSENT;

let xhr: XMLHttpRequest = new XMLHttpRequest();

isNumber = xhr.DONE;
isNumber = xhr.HEADERS_RECEIVED;
isNumber = xhr.LOADING;
isNumber = xhr.OPENED;
isNumber = xhr.UNSENT;

let onreadystatechangeCallback: (this: XMLHttpRequest, ev: Event) => any;
let isXMLHttpRequestUpload: XMLHttpRequestUpload;
let responseType: 'text' | 'arraybuffer' | '' = xhr.responseType;
onreadystatechangeCallback = xhr.onreadystatechange;

xhr.onreadystatechange = onreadystatechangeCallback;
xhr.timeout = isNumber;
xhr.responseType = responseType;

isXMLHttpRequestUpload = xhr.upload;
isNumber = xhr.readyState;
isAny = xhr.response;
isString = xhr.responseText;
isNumber = xhr.status;
isString = xhr.statusText;
isNumber = xhr.timeout;
isBoolean = xhr.withCredentials;
xhr.withCredentials = isBoolean;

let header: string = '';
let method: string = '';
let url: string = '';
let async: boolean = true;
let user: string = '';
let password: string = '';
let data: string | ArrayBuffer | Blob = 'foo';
let value: string = '';
let type: string = '';
let listener: EventListener = () => {};
let useCapture: boolean = true;

isVoid = xhr.abort();
isString = xhr.getAllResponseHeaders();
isStringOrNull = xhr.getResponseHeader(header);
isVoid = xhr.open(method, url);
isVoid = xhr.open(method, url, async, user, password);
isVoid = xhr.send(data);
isVoid = xhr.setRequestHeader(header, value);
isVoid = xhr.addEventListener(type, listener);
isVoid = xhr.addEventListener(type, listener, useCapture);
