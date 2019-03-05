import { ScrollView, TextInput, contentView } from 'tabris';

const scrollView = new ScrollView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(contentView);

createTextInput('default', 'multiline');
createTextInput('send', 'multiline');
createTextInput('done', 'multiline');

const textInput = createTextInput();
createTextInput('send');
createTextInput('go');
createTextInput('search');
createTextInput('done').onAccept(() => textInput.focused = false);
createTextInput('next');
createTextInput('next').onAccept(() => textInput.focused = true);
createTextInput();

function createTextInput(enterKeyType: TextInput['enterKeyType'] = 'default', type: TextInput['type'] = 'default') {
  return new TextInput({
    top: 'prev()', left: 16, right: 16,
    message: message(enterKeyType, type),
    type,
    enterKeyType
  }).onAccept(() => console.log(message(enterKeyType, type)))
    .appendTo(scrollView);
}

function message(enterKeyType: string, type: string) {
  return `Enter key: ${enterKeyType} (${type === 'default' ? 'singleline' : type})`;
}
