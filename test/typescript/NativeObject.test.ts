import {NativeObject, Composite, Button, EventObject, Properties, Partial} from 'tabris';

class CustomComponent extends Composite {

  public tsProperties: Properties<Composite> & Partial<this, 'foo' | 'bar'>;

  public foo: string = '';
  public bar: number = 0;

  constructor(properties?: Properties<CustomComponent>) {
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

let foo: string | undefined = customComponent.get('foo');
let bar: number | undefined = customComponent.get('bar');
customComponent.set('foo', 'fooValue');
customComponent.set('bar', 23);
customComponent.set({foo: 'fooValue'});
customComponent.set({bar: 34});
