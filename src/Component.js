import Widget from './Widget';

export default class Component extends Widget {
  constructor (props = {}) {
    super();
    this.props = props;
    this.state = {};
  }
  _acceptChild() {
    return true;
  }
  get _nativeType() {
    return 'tabris.Composite';
  }
  setState (fn) {
	this.children.dispose();
    this.state = fn(this.state);
	this._addChild(this.render(this.props, this.state));
    return this;
  }
  render () {}
}
