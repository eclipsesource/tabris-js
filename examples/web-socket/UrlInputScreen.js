const {Composite, TextInput, TextView} = require('tabris');

module.exports = class UrlInputScreen extends Composite {

  constructor(properties) {
    super(properties);
    this.append(
      new TextView({centerX: 0, centerY: 0, text: 'Enter web socket server URL: '}),
      new TextInput({left: '20%', right: '20%', top: 'prev()', text: 'ws://'})
        .on('accept', ({target}) => {
          if (target.text === 'ws://') {
            return;
          }
          this.trigger('done', target.text);
          this.dispose();
        })
    );
  }

};
