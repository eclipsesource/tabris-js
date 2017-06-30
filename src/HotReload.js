import WebSocket from './WebSocket';

export default class HotReload extends WebSocket {
	constructor (ip = '127.0.0.1', port = 80) {
		super(`ws://${ip}:${port}`, 'chat-protocol');
		this.socket = new WebSocket(`ws://${ip}:${port}`, 'chat-protocol');
	}
	on (name, callback) {
		this['on' + name] = callback;
		return this;
	}
	receive (callback) {
		return this.on('message', callback);
	}
	activate () {
		return this.receive(event => {
			tabris.app.reload();
		});
	}
}