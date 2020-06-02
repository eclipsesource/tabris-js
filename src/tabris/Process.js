export default class Process {

  constructor() {
    if (arguments[0] !== true || arguments.length !== 2) {
      throw new Error('Process can not be created');
    }
    /** @type {import('./App').default} */
    const app = arguments[1].app;
    /** @type {import('./Device').default} */
    const device = arguments[1].device;
    this.env = {
      NODE_ENV: app.debugBuild ? 'development' : 'production'
    };
    this.platform = (device.platform || '').toLowerCase();
    this.argv = ['tabris', './'];
  }

}

export function create(tabris) {
  return new Process(true, tabris);
}
