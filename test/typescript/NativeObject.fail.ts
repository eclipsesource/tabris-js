import { Composite, NativeObject } from 'tabris';

const obj: NativeObject = new Composite({cid: 'o1'});

obj.set({cid: 'o1'});
obj.cid = 'o1';
obj.set({trigger: (() => {}) as any})
obj._storeProperty('foo', 'bar');
let some: unknown = obj._getStoredProperty('foo');
let bool: boolean = obj._wasSet('foo');
obj._getTypeDef('foo');
obj._getTypeDef('foo');
some = obj._getDefaultPropertyValue('proo');
some = obj._encodeProperty({encode: (foo: unknown) => 23}, 'bar');
some = obj._decodeProperty({decode: (foo: unknown) => 23}, 'bar');
obj._triggerChangeEvent('foo', 'bar');
obj._nativeCreate();
obj._nativeCreate({foo: 'bar'});
obj._register();
obj._onoff('event', true, (ev: unknown) => undefined);
obj._checkDisposed();
obj._nativeSet('foo', 'bar');
some = obj._nativeGet('foo', 'bar');
some = obj._nativeCall('method', {param: 'bar'});
obj._isListening('foo');
obj._listen('foo', true);
obj.$getProperty('foo');
obj.$setProperty('foo', 'bar');
obj.$getPropertyGetter('foo');
obj.$getPropertySetter('foo');
some = obj.$props;

NativeObject.defineProperties(obj, {});
NativeObject.defineProperty(obj, 'foo', {});
NativeObject.defineEvents(obj, {});
NativeObject.defineEvent(obj, 'ev', {});
NativeObject.defineChangeEvent(obj, 'foo');
NativeObject.extend('Test', NativeObject);

/*Expected
(3,
(6,
'cid'
(7,
(8,
protected
(9,
protected
(10,
protected
(11,
private
(12,
private
(13,
private
(14,
private
(15,
private
(16,
private
(17,
protected
(18,
protected
(19,
private
(20,
protected
(21,
protected
(22,
protected
(23,
protected
(24,
protected
(25,
protected
(26,
protected
(27,
private
(28,
private
(29,
private
(30,
private
(31,
private

(33,
private
(34,
private
(35,
private
(36,
private
(37,
private
(38,
private
*/
