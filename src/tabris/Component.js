import Widget from './Widget';

export default class Component extends Widget {
  constructor (props = {}) {
    super();
    this.props = props;
    this.state = {};
    this.setState = this.setState.bind(this);
  }
  run () {
    this.append(this.render());
    return this;
  }
  setState (fn) {
    this._release();
    this.state = fn(this.state);
    this.append(this.render());
    return this;
  }
  render () {}
}
