import {NativeObject, Button, EventObject} from 'tabris';

let nativeObject: NativeObject = new Button();

// Properties
let cid: string;

cid = nativeObject.cid;

// Methods
let type: string = '';
let listener: (event: object) => void = () => {};
let context: NativeObject = nativeObject;
let property: string = '';
let properties: object = {};
let thisReturnValue: NativeObject;
let value: any;
let timeStamp: number;
let eventObject: EventObject<NativeObject> = new EventObject<NativeObject>();

thisReturnValue = nativeObject.on(type, listener, context);
thisReturnValue = nativeObject.once(type, listener, context);
thisReturnValue = nativeObject.off(type, listener, context);
thisReturnValue = nativeObject.trigger(type, eventObject);
thisReturnValue = nativeObject.get(property);
thisReturnValue = nativeObject.set(property, value);
thisReturnValue = nativeObject.set(properties);
