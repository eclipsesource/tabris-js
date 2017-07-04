import Widget from './Widget';

export class XHRHotReload {
	constructor (app, adress, ms = 1000) {
		this.app = app;
		this.xhr = new XMLHttpRequest();
		this.adress = adress;
		this.ms = ms;
	}
	on( ev, fn ) {
		this.xhr['on' + ev] = fn;
		return this;
	}
	load (fn) {
		return this.on('load', ({$target: {$responseData}}) => {
			if ($responseData === 'APP_RELOAD') {
				this.app.reload();
			} else if ($responseData === 'APP_LOAD') {
				if (fn) fn.call(this, $target);
			}
		});
	}
	start () {
		this.load();
		this.interval = setInterval(() => this.run(), this.ms);
		return this;
	}
	run () {
		this.xhr.open('GET', this.adress, true);
		this.xhr.send(null);
		return this;
	}
	close () {
		clearInterval(this.interval);
		return this;
	}
}

export class WSHotReload {
	constructor (app, adress, protocol = 'chat-protocol') {
		this.app = app;
		this.adress = adress;
		this.ws = new WebSocket(adress, protocol);
	}
	on( ev, fn ) {
		this.ws['on' + ev] = fn;
		return this;
	}
	load (fn) {
		return this.on('message', ({data}) => {
			if (data === 'APP_RELOAD') {
				this.app.reload();
			} else if (data === 'APP_LOAD') {
				if (fn) fn.call(this, data);
			}
		}).on('error', () => {
			this.ws = new XHRHotReload(this.app, this.adress.replace(/ws/g, 'http'), 2000).start();
		});
	}
	start () {
		return this.load();
	}
	close () {
		this.ws.close();
	}
}

export default class HotReload extends Widget {
	constructor ({app, ms = 2000, procotol = 'chat-protocol', port = 9000}) {
	super();
	let location = app.getResourceLocation();
	let isRemote = location.indexOf('192.168.') !== -1;
	if (!isRemote) return;
	location = location.split(":");
	location[location.length - 1] = port;
	location[0] = 'ws';
	location = location.join(":");
	this.module = new WSHotReload(app, location, procotol).start();
	}
}