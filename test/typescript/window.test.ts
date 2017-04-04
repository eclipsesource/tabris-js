import 'tabris';

let id: any;
let callback: () => void = () => {};
let delay: number = 42;
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

let item: string | null;
let key: string = '';
let data: string = '';

voidReturnValue = localStorage.clear();
voidReturnValue = localStorage.removeItem(key);
voidReturnValue = localStorage.setItem(key, data);
item = localStorage.getItem(key);

let message: any;

console.log();
console.log(message);
console.log(message, message);
console.error();
console.error(message);
console.error(message, message);
console.warn();
console.warn(message);
console.warn(message, message);
console.info();
console.info(message);
console.info(message, message);
console.debug();
console.debug(message);
console.debug(message, message);
