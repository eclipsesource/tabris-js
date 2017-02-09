import {NativeObject} from 'tabris';

let nativeObject: NativeObject;

// Properties
let cid: string;

nativeObject.cid = cid;

cid = nativeObject.cid;

// Methods
let event: string;
let property: string;
let properties: Object;
let listener: Function;
let context: NativeObject;
let thisReturnValue: NativeObject;
let anyReturnValue: any;
let paramA: any;
let paramB: any;
let value: any;

thisReturnValue = nativeObject.on(event, listener, context);
thisReturnValue = nativeObject.once(event, listener, context);
thisReturnValue = nativeObject.off(event, listener, context);
thisReturnValue = nativeObject.trigger(event, paramA, paramB);
thisReturnValue = nativeObject.get(property);
thisReturnValue = nativeObject.set(property, value);
thisReturnValue = nativeObject.set(properties);
