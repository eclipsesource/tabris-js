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

(async () => {
  thisReturnValue = await nativeObject.triggerAsync(type, eventObject);
  thisReturnValue = await nativeObject.triggerAsync(type, {});
  thisReturnValue = await nativeObject.triggerAsync(type);
})();

// Custom properties

customComponent.set({foo: 'fooValue'});
customComponent.set({bar: 34});

// protected

class Test extends NativeObject {

  constructor() {
    super({foo: 'bar'});
    this._storeProperty('foo', 'bar');
    let some: unknown = this._getStoredProperty('foo');
    let bool: boolean = this._wasSet('foo');
    bool = this._isListening('ev');
    this._nativeCreate();
    this._nativeCreate({foo: 'bar'});
    this._onoff('event', true, (ev: unknown) => undefined);
    this._checkDisposed();
    this._nativeSet('foo', 'bar');
    some = this._nativeGet('foo');
    some = this._nativeCall('method', {param: 'bar'});
  }

  protected get _nativeType(): string {
    return super._nativeType;
  }

  protected _reorderProperties(properties: string[]) {
    return [];
  }

  protected _listen(ev: string, listening: boolean) {
    super._listen(ev, listening);
  }

  protected _dispose() {
    super._dispose();
  }

  protected _release() {
    super._release();
  }

  protected _getXMLHeader(hasChild: boolean): string {
    if (hasChild) {
      return this._getXMLHeader(hasChild);
    }
    return '<Foo/>';
  }

  protected _getXMLFooter(hasChild: boolean): string {
    if (hasChild) {
      return this._getXMLHeader(hasChild);
    }
    return '<Foo/>';
  }

  protected _getXMLElementName() {
    return 'Foo';
  }

  protected _getXMLAttributes() {
    const result: Array<[string, unknown]> = super._getXMLAttributes();
    return result;
  }

  protected _getXMLContent() {
    const result: Array<string> = super._getXMLContent();
    return result;
  }

}
