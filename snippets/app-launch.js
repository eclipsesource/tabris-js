const {TextInput, TextView, Button, app, ui} = require('tabris');

let textInput = new TextInput({
  left: 16, right: 16, top: 16,
  text: 'http://tabrisjs.com'
}).appendTo(ui.contentView);

new Button({
  left: 16, top: ['prev()', 16], right: 16,
  text: 'Launch'
}).on({
  select: () => app.launch(textInput.text)
    .then(() => textView.text = 'Url has been launched')
    .catch((e) => textView.text = e)
}).appendTo(ui.contentView);

let textView = new TextView({
  left: 16, right: 16, top: ['prev()', 16],
}).appendTo(ui.contentView);
