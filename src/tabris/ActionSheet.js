import Popup from './Popup';
import NativeObject from './NativeObject';
import {types} from './property-types';

export default class ActionSheet extends Popup {

  constructor(properties) {
    super();
    this._autoDispose = true;
    this._create('tabris.ActionSheet', properties);
  }

  get _nativeType() {
    return 'tabris.ActionSheet';
  }

  _trigger(name, event) {
    if (name === 'close') {
      super._trigger('close', event);
      this.dispose();
    } else {
      return super._trigger(name, event);
    }
  }

}

NativeObject.defineProperties(ActionSheet.prototype, {
  title: {type: 'string', default: ''},
  message: {type: 'string', default: ''},
  actions: {
    type: {
      encode(value) {
        if (!Array.isArray(value)) {
          throw new Error('value is not an array');
        }
        return value.map(action => {
          let result = {title: '' + action.title};
          if ('image' in action) {
            result.image = types.image.encode(action.image);
          }
          if ('style' in action) {
            if (!['default', 'cancel', 'destructive'].includes(action.style)) {
              throw new Error('Invalid action style');
            }
            result.style = action.style;
          }
          return result;
        });
      }
    },
    default: () => []
  }
});

NativeObject.defineEvents(ActionSheet.prototype, {
  close: {native: true},
  select: {native: true}
});
