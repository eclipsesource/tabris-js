const PluginPage = require('./PluginPage');
const {Button, Composite, ScrollView, TextInput, TextView} = require('tabris');

const TITLE = 'Sharing';
const PLUGIN_ID = 'cordova-plugin-x-socialsharing';
const TEXT_TO_SHARE = 'Text to share:';
const INPUT_MESSAGE = 'Tabris.js - Native mobile apps in JavaScript';

module.exports = class SharingPage extends PluginPage {

  constructor(properties) {
    super(Object.assign({pluginId: PLUGIN_ID, title: TITLE}, properties));
  }

  createUI() {
    super.createUI();
    this.content.append(
      new TextView({id: 'textToShareLabel', text: TEXT_TO_SHARE}),
      new TextInput({id: 'input', message: INPUT_MESSAGE})
        .on('input', ({text: message}) => this.find('.sharingSection').forEach(section => section.message = message)),
      new ScrollView({id: 'scrollView'}).append(
        ...sharingSectionConfigurations.map(configuration => new SharingSection(configuration)),
        new Composite({id: 'spacer'})
      )
    );
  }

  applyLayout() {
    super.applyLayout();
    this.apply({
      '#textToShareLabel': {left: 16, top: 'prev() 8', right: 16},
      '#input': {left: 16, top: 'prev() 8', right: 16},
      '#scrollView': {left: 0, top: 'prev() 8', right: 0, bottom: 0},
      '#spacer': {left: 0, top: 'prev() 32', right: 0},
      '.sharingSection': {left: 0, top: 'prev() 16', right: 0}
    });
  }

  applyStyles() {
    super.applyStyles();
    this.apply({
      '#textToShareLabel': {font: '20px'}
    });
  }

};

class SharingSection extends Composite {

  constructor(properties) {
    super(Object.assign({class: 'sharingSection'}, properties));
    this._createUI();
    this._applyLayout();
  }

  set message(input) {
    this._message = input;
  }

  get message() {
    return this._message;
  }

  set title(title) {
    this._title = title;
  }

  get title() {
    return this._title;
  }

  set description(description) {
    this._description = description;
  }

  get description() {
    return this._description;
  }

  set options(options) {
    this._options = options;
  }

  get options() {
    return this._options;
  }

  _createUI() {
    this.append(
      new TextView({id: 'titleLabel', text: this.title + ' options', font: '20px'}),
      new TextView({id: 'descriptionLabel', text: this.description, font: '14px'}),
      ...this.options.map(option =>
        new Button({class: 'optionsButton', text: option.name})
          .on('select', () => option.handler(this.message))
      )
    );
  }

  _applyLayout() {
    this.apply({
      '#titleLabel': {left: 16, top: 'prev() 8', right: 16},
      '#descriptionLabel': {left: 16, top: 'prev() 2', right: 16},
      '.optionsButton': {left: 16, top: 'prev() 8', right: 16}
    });
  }

}

const sharingSectionConfigurations = [{
  title: 'ShareSheet',
  description: [
    'Use the platform native sharing capabilities. There are various',
    ' options for sharing a Message, Subject, Image(s) and a Link'
  ].join(''),
  options: [
    {
      name: 'Message only',
      handler: message => window.plugins.socialsharing.share(message)
    }, {
      name: 'Message and subject',
      handler: message => window.plugins.socialsharing.share(message, 'An awesome title')
    }, {
      name: 'Message and link',
      handler: message => window.plugins.socialsharing.share(message,
        null, null, 'https://tabrisjs.com',
        shareSuccessful, shareError)
    }, {
      name: 'Image only',
      handler: () => window.plugins.socialsharing.share(null,
        null, 'http://eclipsesource.com/blogs/wp-content/uploads/2015/10/tabris-icon-logo-small.png', null,
        shareSuccessful, shareError)

    }, {
      name: 'Message, subject, image and link',
      handler: message => window.plugins.socialsharing.share(message, 'An awesome subject',
        'http://eclipsesource.com/blogs/wp-content/uploads/2015/10/tabris-icon-logo-small.png',
        'https://tabrisjs.com', shareSuccessful, shareError)
    }
  ]
}, {
  title: 'ShareVia',
  description: [
    'You can also specify the target app for sharing.',
    ' Before you offer users to share via twitter, whatsapp, facebook, sms, email,',
    ' you may want to check that the option is available with',
    " socialsharing.canShareVia('whatsapp' ... )"
  ].join(''),
  options: [
    // When using shareVia, make sure the share option is available with window.plugins.socialsharing.canShareVia(..)
    {
      name: 'Share via Twitter',
      handler: message => window.plugins.socialsharing.shareViaTwitter(
        message + ' @tabrisjs',
        'http://eclipsesource.com/blogs/wp-content/uploads/2015/10/tabris-icon-logo-small.png',
        'https://tabrisjs.com', shareSuccessful, shareError
      )

    }, {
      name: 'Share via Facebook',
      handler: () => window.plugins.socialsharing.shareViaFacebook(
        null, null,
        'https://tabrisjs.com',
        shareSuccessful, shareError
      )
    }, {
      name: 'Share via Whatsapp',
      handler: message => window.plugins.socialsharing.shareViaWhatsApp(message,
        null, 'https://tabrisjs.com', shareSuccessful, shareError
      )
    }, {
      name: 'Share via SMS',
      handler: message => window.plugins.socialsharing.shareViaSMS({message: message},
        '0612345678,0687654321', shareSuccessful, shareError
      )
    }, {
      name: 'Share via Email',
      handler: (message) => window.plugins.socialsharing.shareViaEmail(
        message,
        'I just discovered Tabris.js!',
        ['to@person1.com', 'to@person2.com'],
        ['cc@person1.com'],
        null,
        ['http://eclipsesource.com/blogs/wp-content/uploads/2015/10/tabris-icon-logo-small.png'],
        shareSuccessful, shareError
      )
    }
  ]
}];

function shareSuccessful(success) {
  if (success) {
    window.plugins.toast.showShortCenter('Thank you for sharing :)');
    console.log('Success sharing: ' + success);
  } else {
    window.plugins.toast.showShortCenter('Did you cancel? Not awesome enough for you?');
    console.log('Cancelled sharing. Response: ' + success);
  }
}

function shareError(errormsg) {
  window.plugins.toast.showShortCenter('Error sharing: ' + errormsg + '. Do you have this feature available?');
  console.log('Error sharing: ' + errormsg);
}
