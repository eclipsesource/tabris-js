import Event from './Event';

export default class ProgressEvent extends Event {

  constructor(type, config) {
    if (arguments.length < 1) {
      throw new Error('Not enough arguments to ProgressEvent');
    }
    super(type, config);
    this.$lengthComputable = config && config.lengthComputable || false;
    this.$loaded = config && config.loaded || 0;
    this.$total = config && config.total || 0;
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
