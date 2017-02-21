import NativeObject from './NativeObject';

export default class GC extends NativeObject {

  constructor(properties) {
    super();
    this._create('rwt.widgets.GC', properties);
  }

}

NativeObject.defineProperties(GC.prototype, {parent: 'proxy'});
