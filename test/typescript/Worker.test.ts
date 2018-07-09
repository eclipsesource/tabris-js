let scriptPath: string = '';
let isWorkerOnerrorFn: (this: Worker, ev: Event) => any;
let isWorkerOnmessageerrorFn: (this: Worker, ev: Event) => any;
let isWorkerOnmessageFn: (this: Worker, ev: MessageEvent) => any;
let workerErrorListener: (this: Worker, ev: Event) => any = function(this, ev) {};
let workerMessageerrorListener: (this: Worker, ev: Event) => any = function(this, ev) {};
let workerMessageListener: (this: Worker, ev: MessageEvent) => any = function(this, ev) {};
let worker: Worker;


worker = new Worker(scriptPath);
worker = Worker.prototype;
isWorkerOnerrorFn = worker.onerror;
isWorkerOnmessageerrorFn = worker.onmessageerror;
isWorkerOnmessageFn = worker.onmessage;
isVoid = worker.terminate();
isVoid = worker.postMessage(data);
isVoid = worker.addEventListener('error', workerErrorListener);
isVoid = worker.addEventListener('error', workerErrorListener, useCapture);
isVoid = worker.addEventListener('messageerror', workerMessageerrorListener);
isVoid = worker.addEventListener('messageerror', workerMessageerrorListener, useCapture);
isVoid = worker.addEventListener('message', workerMessageListener);
isVoid = worker.addEventListener('message', workerMessageListener, useCapture);
