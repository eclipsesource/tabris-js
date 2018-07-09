interface WorkerEventMap {
    "message": MessageEvent;
    "error": Event;
    "messageerror": Event;
}

interface Worker extends EventTarget {
    onerror: (this: Worker, ev: Event) => any;
    onmessageerror: (this: Worker, ev: Event) => any;
    onmessage: (this: Worker, ev: MessageEvent) => any;
    onopen: (this: Worker, ev: Event) => any;
    readonly protocol: string;
    readonly readyState: number;
    readonly url: string;
    postMessage(data: any, transferList?: Array<any>): void;
    terminate(): void;
    addEventListener<K extends keyof WorkerEventMap>(type: K, listener: (this: Worker, ev: WorkerEventMap[K]) => any, useCapture?: boolean): void;
}

declare var Worker: {
    prototype: Worker;
    new(scriptPath: string): Worker;
};
