interface EventInit {
    bubbles?: boolean;
    cancelable?: boolean;
}

interface Event {
    readonly bubbles: boolean;
    readonly cancelable: boolean;
    readonly currentTarget: EventTarget;
    readonly defaultPrevented: boolean;
    readonly eventPhase: number;
    readonly isTrusted: boolean;
    readonly target: EventTarget;
    readonly timeStamp: number;
    readonly type: string;
    initEvent(eventTypeArg: string, canBubbleArg: boolean, cancelableArg: boolean): void;
    preventDefault(): void;
    stopImmediatePropagation(): void;
    stopPropagation(): void;
    readonly AT_TARGET: number;
    readonly BUBBLING_PHASE: number;
    readonly CAPTURING_PHASE: number;
}

declare var Event: {
    prototype: Event;
    new(typeArg: string, eventInitDict?: EventInit): Event;
    readonly AT_TARGET: number;
    readonly BUBBLING_PHASE: number;
    readonly CAPTURING_PHASE: number;
}

interface EventListener {
    (evt: Event): void;
}

interface EventTarget {
    addEventListener(type: string, listener?: EventListener, useCapture?: boolean): void;
    dispatchEvent(evt: Event): boolean;
    removeEventListener(type: string, listener?: EventListener, useCapture?: boolean): void;
}

declare var EventTarget: {
    prototype: EventTarget;
    new(): EventTarget;
}

interface ProgressEventInit extends EventInit {
    lengthComputable?: boolean;
    loaded?: number;
    total?: number;
}

interface ProgressEvent extends Event {
    readonly lengthComputable: boolean;
    readonly loaded: number;
    readonly total: number;
    initProgressEvent(typeArg: string, canBubbleArg: boolean, cancelableArg: boolean, lengthComputableArg: boolean, loadedArg: number, totalArg: number): void;
}

declare var ProgressEvent: {
    prototype: ProgressEvent;
    new(type: string, eventInitDict?: ProgressEventInit): ProgressEvent;
}

interface ErrorEventInit extends EventInit {
    message?: string;
    filename?: string;
    lineno?: number;
    colno?: number;
    error?: any;
}

interface ErrorEvent extends Event {
    readonly colno: number;
    readonly error: any;
    readonly filename: string;
    readonly lineno: number;
    readonly message: string;
    initErrorEvent(typeArg: string, canBubbleArg: boolean, cancelableArg: boolean, messageArg: string, filenameArg: string, linenoArg: number): void;
}

declare var ErrorEvent: {
    prototype: ErrorEvent;
    new(type: string, errorEventInitDict?: ErrorEventInit): ErrorEvent;
}
