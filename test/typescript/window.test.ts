let id: any;
let callback: () => void;
let delay: number;
let voidReturnValue: void;
let timerID: number;
let paramA: any;
let paramB: any;

voidReturnValue = clearInterval(id);
voidReturnValue = clearTimeout(id);
setInterval(callback, delay);
setInterval(callback, delay, paramA, paramB);
setTimeout(callback);
setTimeout(callback, delay);
setTimeout(callback, delay, paramA, paramB);
