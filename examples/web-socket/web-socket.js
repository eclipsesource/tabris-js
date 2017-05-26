const {Button, Composite, ScrollView, TextInput, TextView, device, ui} = require('tabris');

const CHAT_SERVER_URL = 'ws://192.168.6.150:9000';

let socket = new WebSocket(CHAT_SERVER_URL, 'chat-protocol');

logWebSocketState();

socket.onopen = (event) => {
  console.info('Connection opened: ' + JSON.stringify(event));
  appendToChat('Connected.<br/>');
  logWebSocketState();
};

socket.onmessage = (event) => {
  console.info('Server message: ' + JSON.stringify(event));
  if (typeof event.data === 'string') {
    appendToChat('Text: ' + event.data);
  } else if (event.data instanceof ArrayBuffer) {
    appendToChat('Binary: ' + new Int8Array(event.data)); // arbitrarily wrapped in Int8Array
  }
  logWebSocketState();
};

socket.onerror = (event) => {
  console.info('Error: ' + JSON.stringify(event));
  appendToChat('Error:' + JSON.stringify(event));
  logWebSocketState();
};

socket.onclose = (event) => {
  console.info('Close connection ' + JSON.stringify(event));
  appendToChat('Close:' + JSON.stringify(event));
  logWebSocketState();
};

let inputContainer = new Composite({
  left: 0, right: 0, bottom: 0, height: 64,
  background: '#f5f5f5'
}).appendTo(ui.contentView);

let chatInput = new TextInput({
  left: 16, right: ['#sendButton', 16], centerY: 0,
  message: 'Enter chat message...',
  text: 'Hello Chat!'
}).appendTo(inputContainer);

new Button({
  id: 'sendButton',
  right: 16, width: 76, centerY: 0,
  text: 'Send'
}).on('select', () => {
  socket.send('<b>' + device.model + '</b>: ' + chatInput.text);
  chatInput.text = '';
  logWebSocketState();
}).appendTo(inputContainer);

let scrollView = new ScrollView({
  left: 0, right: 0, top: 0, bottom: inputContainer,
  background: 'white',
  elevation: 2
}).appendTo(ui.contentView);

let chatTextView = new TextView({
  left: 16, right: 16, top: 16,
  text: 'Connecting to ' + CHAT_SERVER_URL,
  markupEnabled: true
}).appendTo(scrollView);

function appendToChat(text) {
  chatTextView.set('text', chatTextView.text + '<br/>' + text);
}

function logWebSocketState() {
  console.log(`WebSocket state:
  url: ${socket.url}
  readyState: ${socket.readyState}
  protocol: ${socket.protocol}
  extension: ${socket.extensions}
  bufferedAmount: ${socket.bufferedAmount}
  binaryType: ${socket.binaryType}`);
}
