import Composite from './widgets/Composite';
import Widget from './Widget';
import VChange from './VChange';
import Data from './Data';

export default class Component extends Widget {
  constructor(props = {}) {
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
  setState(state, val) {
    if (this.componentWillUpdate) {
      this.componentWillUpdate();
    }
    this.state.set(state, val);
    let children = this.render.call(this, this.props, this.state);
    this.rendered = VChange(this.rendered, children, this.children);
    if (this.componentDidUpdate) {
      this.componentDidUpdate();
    }

    return this;
  }
  render() {}
}