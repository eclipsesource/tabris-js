import Widget from '../Widget';

export default class ActivityIndicator extends Widget {

  constructor(properties) {
    super();
    this._create('tabris.ActivityIndicator', properties);
  }

}
