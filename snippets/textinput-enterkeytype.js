let scrollView = new tabris.ScrollView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(tabris.ui.contentView);

createTextInput('default', 'multiline');
createTextInput('send', 'multiline');
createTextInput('done', 'multiline');

let textInput = createTextInput();
createTextInput('send');
createTextInput('go');
createTextInput('search');
createTextInput('done').on('accept', ({target: textInput}) => textInput.focused = false);
createTextInput('next');
createTextInput('next').on('accept', () => textInput.focused = true);
createTextInput();

function createTextInput(enterKeyType = 'default', type = 'default') {
  return new tabris.TextInput({
    top: 'prev()', left: '16', right: '16',
    message: message(enterKeyType, type),
    type: type,
    enterKeyType: enterKeyType
  }).on('accept', () => console.log(message(enterKeyType, type)))
    .appendTo(scrollView);
}

function message(enterKeyType, type) {
  return `Enter key: ${enterKeyType} (${type === 'default' ? 'singleline' : type})`;
}
