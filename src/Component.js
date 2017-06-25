import Composite from './widgets/Composite';
import Widget from './Widget';
import VChange from './VChange';


export default class Component extends Widget {
  constructor (props = {}) {
    super();
    this.props = props;
    this.state = {};
	this.rendered = this.render();
  }
  _acceptChild() {
    return true;
  }
  get _nativeType() {
    return 'tabris.Composite';
  }
  setState (fn) {
	
    this.state = Object.assign(this.state, fn(this.state));
	this.rendered = VChange(this.rendered, this.rendered, this.render());

    return this;
  }
  render () {}
}
