import NativeObject from './NativeObject';

const CONFIG = {
  _type: 'rwt.widgets.GC',
  _properties: {parent: 'proxy'}
};

export default class GC extends NativeObject.extend(CONFIG) {}
