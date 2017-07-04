import { app, Component } from 'tabris';

<hotReload app={app}/>; // The Hot-Reloading module

class Hello extends Component {
	constructor (props) {
		super(props);
		this.state = {clicked:0, time: performance.now()};
		this._onClick = this._onClick.bind(this);
	}
	componentDidMount() {
        /*this.timer = setInterval(() => {
            this.setState('time', performance.now());
        }, 100);*/
    }
	componentWillUnmount() {
        clearInterval(this.timer);
    }
	_onClick ({target}) {
		this.setState('clicked', (clicked) => clicked + 1);
	}
	render({name}, {clicked, time}) {
		return clicked > 10 && clicked < 20 ? <composite left="0" top="0" right="0"><button id="btnId" left={20} top={20} right={20} text={`${name} saved me ${clicked} times`} on-select={this._onClick}/></composite> : <composite left="0" top="0" right="0">
			<button id="btnId" left={20} top={20} right={20} text={`${name} saved me ${clicked} times`} on-select={this._onClick}/>
			<textView left={20} top={120} right={20} text={`You just clicked me, while time is ${time}`} />
			</composite>
	}
}

class Clock extends Component {
    constructor(props) {
        super();
        this.state.time = new Date().toLocaleTimeString();
    }

    componentDidMount() {
        this.timer = setInterval(() => {
            this.setState({ time: new Date().toLocaleTimeString() });
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    render(props, {time}) {
        return <composite><textView text={time}></textView></composite>;
    }
}

<contentView append={<Hello name="World"><textView text="Okay"></textView></Hello>}/>