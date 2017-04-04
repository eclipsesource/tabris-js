import { Widget } from 'tabris';

let isBoolean: boolean;
let isEventTarget: EventTarget;
let isNumber: number;
let isString: string;
let isVoid: void;
let isAny: any;

// Event
let eventInit: EventInit;
let typeArg: string = '';
let event: Event;

eventInit = {};
eventInit = { bubbles: true, cancelable: false };
event = new Event(typeArg);
event = new Event(typeArg, eventInit);
isNumber = Event.AT_TARGET;
isNumber = Event.BUBBLING_PHASE;
isNumber = Event.CAPTURING_PHASE;
isNumber = event.AT_TARGET;
isNumber = event.BUBBLING_PHASE;
isNumber = event.CAPTURING_PHASE;
isBoolean = event.bubbles;
isBoolean = event.cancelable;
isEventTarget = event.currentTarget;
isNumber = event.eventPhase;
isBoolean = event.isTrusted;
isEventTarget = event.target;
isNumber = event.timeStamp;
isString = event.type;

let eventTypeArg: string = '';
let canBubbleArg: boolean = true;
let cancelableArg: boolean = false;
isVoid = event.initEvent(eventTypeArg, canBubbleArg, cancelableArg);
isVoid = event.preventDefault();
isVoid = event.stopImmediatePropagation();
isVoid = event.stopPropagation();

// EventListener
let eventListener: EventListener = (evt: Event) => { };

// EventTarget
let type: string = '';
let listener: EventListener = eventListener;
let useCapture: boolean = false;
let eventTarget: EventTarget = new EventTarget();
isVoid = eventTarget.addEventListener(type);
isVoid = eventTarget.addEventListener(type, listener);
isVoid = eventTarget.addEventListener(type, listener, useCapture);
isBoolean = eventTarget.dispatchEvent(event);
isVoid = eventTarget.removeEventListener(type);
isVoid = eventTarget.removeEventListener(type, listener);
isVoid = eventTarget.removeEventListener(type, listener, useCapture);

// ProgressEvent
let progressEventInit: ProgressEventInit;
let progressEvent: ProgressEvent;
let cancelable: boolean = true;
let bubbles: boolean = true;
let lengthComputable: boolean = true;
let loaded: number = 42;
let total: number = 42;
progressEventInit = {};
progressEventInit = { cancelable, bubbles, lengthComputable, loaded, total };
progressEvent = new ProgressEvent(typeArg);
progressEvent = new ProgressEvent(typeArg, progressEventInit);
isBoolean = progressEvent.lengthComputable;
isNumber = progressEvent.loaded;
isNumber = progressEvent.total;

let lengthComputableArg: boolean = true;
let loadedArg: number = 42;
let totalArg: number = 42;
isVoid = progressEvent.initProgressEvent(
  typeArg, canBubbleArg, cancelableArg, lengthComputableArg, loadedArg, totalArg
);

// ErrorEvent
let errorEventInit: ErrorEventInit;
let message: string = '';
let filename: string = '';
let lineno: number = 42;
let colno: number = 42;
let error: any;
let errorEvent: ErrorEvent;

errorEventInit = {};
errorEventInit = { cancelable, bubbles, message, filename, lineno, colno, error };
errorEvent = new ErrorEvent(typeArg);
errorEvent = new ErrorEvent(typeArg, errorEventInit);
isNumber = errorEvent.colno;
isAny = errorEvent.error;
isString = errorEvent.filename;
isNumber = errorEvent.lineno;
isString = errorEvent.message;

let messageArg: string = '';
let filenameArg: string = '';
let linenoArg: number = 42;
isVoid = errorEvent.initErrorEvent(
  typeArg, canBubbleArg, cancelableArg, messageArg, filenameArg, linenoArg
);
