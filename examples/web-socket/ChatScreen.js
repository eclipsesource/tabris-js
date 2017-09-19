const {Button, Composite, TextInput, ScrollView, TextView} = require('tabris');

module.exports = class ChatScreen extends Composite {

  constructor(properties) {
    super(properties);
    this._createUI();
    this._applyLayout();
    this._applyStyles();
  }

  set url(url) {
    this._url = url;
    this._setupWebSocket();
  }

  get url() {
    return this._url;
  }

  _createUI() {
    this.append(
      new Composite({id: 'inputContainer'}).append(
        new TextInput({id: 'chatInput', message: 'Enter chat message...', text: 'Hello Chat!'}),
        new Button({id: 'sendButton', text: 'Send'})
          .on('select', () => this._sendMessage())
      ),
      new ScrollView().append(
        new TextView({id: 'chatTextView', markupEnabled: true})
      )
    );
  }

  _applyLayout() {
    this.apply({
      '#inputContainer': {left: 0, right: 0, bottom: 0, height: 64},
      '#chatInput': {left: 16, right: ['#sendButton', 16], centerY: 0},
      '#sendButton': {right: 16, width: 76, centerY: 0},
      '#chatTextView': {left: 16, right: 16, top: 16},
      'ScrollView': {left: 0, right: 0, top: 0, bottom: '#inputContainer', elevation: 2}
    });
  }

  _applyStyles() {
    this.apply({
      '#inputContainer': {background: '#f5f5f5'},
      'ScrollView': {background: 'white'}
    });
  }

  _sendMessage() {
    let chatInput = this.find('#chatInput').first();
    this._socket.send('<b>' + device.model + '</b>: ' + chatInput.text);
    chatInput.text = '';
    this._logWebSocketState();
  }

  _setupWebSocket() {
    this._socket = new WebSocket(this._url, 'chat-protocol');
    this._logWebSocketState();
    this._socket.onopen = (event) => {
      console.info('Connection opened: ' + JSON.stringify(event));
      this._appendToChat('Connected.<br/>');
      this._logWebSocketState();
    };
    this._socket.onmessage = (event) => {
      console.info('Server message: ' + JSON.stringify(event));
      if (typeof event.data === 'string') {
        this._appendToChat('Text: ' + event.data);
      } else if (event.data instanceof ArrayBuffer) {
        this._appendToChat('Binary: ' + new Int8Array(event.data)); // arbitrarily wrapped in Int8Array
      }
      this._logWebSocketState();
    };
    this._socket.onerror = (event) => {
      console.info('Error: ' + JSON.stringify(event));
      this._appendToChat('Error:' + JSON.stringify(event));
      this._logWebSocketState();
    };
    this._socket.onclose = (event) => {
      console.info('Close connection ' + JSON.stringify(event));
      this._appendToChat('Close:' + JSON.stringify(event));
      this._logWebSocketState();
    };
  }

  _logWebSocketState() {
    console.log(`WebSocket state:
    url: ${this._socket.url}
    readyState: ${this._socket.readyState}
    protocol: ${this._socket.protocol}
    extension: ${this._socket.extensions}
    bufferedAmount: ${this._socket.bufferedAmount}
    binaryType: ${this._socket.binaryType}`);
  }

  _appendToChat(text) {
    let chatTextView = this.find('#chatTextView').first();
    chatTextView.set({text: chatTextView.text + '<br/>' + text});
  }

};
