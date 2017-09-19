const {ui} = require('tabris');
const ChatScreen = require('./ChatScreen');
const UrlInputScreen = require('./UrlInputScreen');

let fillLayout = {left: 0, top: 0, right: 0, bottom: 0};

ui.contentView.append(
  new UrlInputScreen(fillLayout)
    .on('done', url => showChatScreen(url))
);

function showChatScreen(url) {
  new ChatScreen(Object.assign({url}, fillLayout)).appendTo(ui.contentView);
}
