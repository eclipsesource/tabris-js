import {NativeObject, Composite, Button, EventObject, Properties} from 'tabris';

class CustomComponent extends Composite {

  public foo: string = '';
  public bar: number = 0;

  constructor(properties?: Properties<Composite> & Partial<CustomComponent>) {
    super(properties);
  }

}

let nativeObject: NativeObject = new Button();
let customComponent: CustomComponent = new CustomComponent({foo: 'bar'});

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
thisReturnValue = nativeObject.trigger(type, {});
thisReturnValue = nativeObject.trigger(type);

// Custom properties

customComponent.set({foo: 'fooValue'});
customComponent.set({bar: 34});
