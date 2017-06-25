import Composite from './widgets/Composite';
import Widget from './Widget';
import VChange from './VChange';


export default class Component extends Widget {
  constructor (props = {}) {
    super();
    this.props = props;
    this.state = {};
	
	if (this.rendered !== undefined && this.componentWillMount) {
		this.componentWillMount();
	}
	if (this.componentWillUnmount) {
	this.on('dispose', this.componentWillUnmount.bind(this));
	}
  }
  _acceptChild() {
    return true;
  }
  get _nativeType() {
    return 'tabris.Composite';
  }
  setState (state) {
    this.state = Object.assign(this.state, state);
	if (this.componentWillUpdate) {
		this.componentWillUpdate();
	}
	this.rendered = VChange(this.rendered, this.rendered, this.render(this.props, this.state));
	if (this.componentDidUpdate) {
		this.componentDidUpdate();
	}

    return this;
  }
  render () {}
}
