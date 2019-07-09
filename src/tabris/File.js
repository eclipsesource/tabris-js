import Blob from './Blob';

export default class File extends Blob {

  /**
   * @param {Array} chunks
   * @param {string} name
   * @param {Object=} options
   */
  constructor(chunks, name, options = {}) {
    if (arguments.length < 2) {
      throw new TypeError(`File requires at least 2 arguments, but only ${arguments.length} were passed.`);
    }
    super(chunks, options);
    Object.defineProperty(this, 'name', {value: name + ''});
    const lastModified = 'lastModified' in options ? options.lastModified : Date.now();
    if (isNaN(lastModified) || !isFinite(lastModified)) {
      Object.defineProperty(this, 'lastModified', {value: 0});
    } else {
      Object.defineProperty(this, 'lastModified', {
        value: Math.round(typeof lastModified === 'string' ? parseInt(lastModified) : 0 + lastModified)
      });
    }
  }

}

File.prototype[Symbol.toStringTag] = 'File';
Object.defineProperty(File.prototype, 'name', {value: ''});
Object.defineProperty(File.prototype, 'lastModified', {value: 0});
