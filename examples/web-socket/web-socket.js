var CHAT_SERVER_URL = 'ws://192.168.6.150:9000';

var socket = new WebSocket(CHAT_SERVER_URL, 'chat-protocol');

logWebSocketState();

socket.onopen = function(event) {
  console.info('Connection opened: ' + JSON.stringify(event));
  appendToChat('Connected.<br/>');
  logWebSocketState();
};

socket.onmessage = function(event) {
  console.info('Server message: ' + JSON.stringify(event));
  if (typeof event.data === 'string') {
    appendToChat('Text: ' + event.data);
  } else if (event.data instanceof ArrayBuffer) {
    appendToChat('Binary: ' + new Int8Array(event.data)); // arbitrarily wrapped in Int8Array
  }
  logWebSocketState();
};

socket.onerror = function(event) {
  console.info('Error: ' + JSON.stringify(event));
  appendToChat('Error:' + JSON.stringify(event));
  logWebSocketState();
};

socket.onclose = function(event) {
  console.info('Close connection ' + JSON.stringify(event));
  appendToChat('Close:' + JSON.stringify(event));
  logWebSocketState();
};

var inputContainer = new tabris.Composite({
  left: 0, right: 0, bottom: 0,
  background: '#f5f5f5'
}).appendTo(tabris.ui.contentView);

var chatInput = new tabris.TextInput({
  bottom: 16, left: 16, right: ['#sendButton', 16],
  message: 'Enter chat message...',
  text: 'Hello Chat!'
}).appendTo(inputContainer);

new tabris.Button({
  id: 'sendButton',
  top: 16, bottom: 16, right: 16,
  text: 'Send'
}).on('select', function() {
  socket.send('<b>' + tabris.device.get('model') + '</b>: ' + chatInput.get('text'));
  chatInput.set('text', '');
  logWebSocketState();
}).appendTo(inputContainer);

var scrollView = new tabris.ScrollView({
  left: 0, right: 0, top: 0, bottom: inputContainer,
  background: 'white',
  elevation: 2
}).appendTo(tabris.ui.contentView);

var chatTextView = new tabris.TextView({
  left: 16, right: 16, top: 16,
  text: 'Connecting to ' + CHAT_SERVER_URL,
  markupEnabled: true
}).appendTo(scrollView);

function appendToChat(text) {
  chatTextView.set('text', chatTextView.get('text') + '<br/>' + text);
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
