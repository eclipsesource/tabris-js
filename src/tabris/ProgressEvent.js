import Event from './Event';

export default class ProgressEvent extends Event {

  constructor(type, config) {
    if (arguments.length < 1) {
      throw new Error('Not enough arguments to ProgressEvent');
    }
    super(type, config);
    Object.defineProperties(this, {
      $lengthComputable: {enumerable: false, writable: true, value: config && config.lengthComputable || false},
      $loaded: {enumerable: false, writable: true, value: config && config.loaded || 0},
      $total: {enumerable: false, writable: true, value: config && config.total || 0}
    });
  }

  get lengthComputable() {
    return this.$lengthComputable;
  }

  get loaded() {
    return this.$loaded;
  }

  get total() {
    return this.$total;
  }

}
