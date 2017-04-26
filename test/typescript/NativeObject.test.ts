import {NativeObject, Button} from 'tabris';

let nativeObject: NativeObject = new Button();

// Properties
let cid: string;

cid = nativeObject.cid;

// Methods
let type: string = '';
let listener: (event: Object) => void = () => {};
let context: NativeObject = nativeObject;
let property: string = '';
let properties: Object = {};
let thisReturnValue: NativeObject;
let value: any;
let timeStamp: number;

thisReturnValue = nativeObject.on(type, listener, context);
thisReturnValue = nativeObject.once(type, listener, context);
thisReturnValue = nativeObject.off(type, listener, context);
thisReturnValue = nativeObject.trigger(type, type);
thisReturnValue = nativeObject.get(property);
thisReturnValue = nativeObject.set(property, value);
thisReturnValue = nativeObject.set(properties);

// Events

nativeObject.on({
  someEvent: event => {
    nativeObject = event.target;
    type = event.type;
    timeStamp = event.timeStamp;
  }
});

nativeObject.once({
  someEvent: event => {
    nativeObject = event.target;
    type = event.type;
    timeStamp = event.timeStamp;
  }
});

nativeObject.off({
  someEvent: event => {
    nativeObject = event.target;
    type = event.type;
    timeStamp = event.timeStamp;
  }
});
