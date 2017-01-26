var PluginPage = require('./PluginPage');

var page = new PluginPage('Sharing', 'cordova-plugin-x-socialsharing', function(parent) {

  var shareSheetOptions = [
    {
      name: 'Message only',
      handler: function(message) {
        window.plugins.socialsharing.share(message); }
    }, {
      name: 'Message and subject',
      handler: function(message) {
        window.plugins.socialsharing.share(message, 'An awesome title'); }
    }, {
      name: 'Message and link',
      handler: function(message) {
        window.plugins.socialsharing.share(message,
          null, null, 'https://tabrisjs.com',
          shareSuccessful, shareError);
      }
    }, {
      name: 'Image only',
      handler: function() {
        window.plugins.socialsharing.share(null,
          null, 'http://eclipsesource.com/blogs/wp-content/uploads/2015/10/tabris-icon-logo-small.png', null,
          shareSuccessful, shareError);
      }
    }, {
      name: 'Message, subject, image and link',
      handler: function(message) {
        window.plugins.socialsharing.share(message, 'An awesome subject',
          'http://eclipsesource.com/blogs/wp-content/uploads/2015/10/tabris-icon-logo-small.png',
          'https://tabrisjs.com', shareSuccessful, shareError);
      }
    }
  ];

  var shareViaOptions = [
    // When using shareVia, make sure the share option is available with window.plugins.socialsharing.canShareVia(..)
    {
      name: 'Share via Twitter',
      handler: function(message) {
        window.plugins.socialsharing.shareViaTwitter(
          message + ' @tabrisjs',
          'http://eclipsesource.com/blogs/wp-content/uploads/2015/10/tabris-icon-logo-small.png',
          'https://tabrisjs.com', shareSuccessful, shareError
        );
      }
    }, {
      name: 'Share via Facebook',
      handler: function() {
        window.plugins.socialsharing.shareViaFacebook(
          null, null,
          'https://tabrisjs.com',
          shareSuccessful, shareError
        );
      }
    }, {
      name: 'Share via Whatsapp',
      handler: function(message) {
        window.plugins.socialsharing.shareViaWhatsApp(message,
            null, 'https://tabrisjs.com', shareSuccessful, shareError
        );
      }
    }, {
      name: 'Share via SMS',
      handler: function(message) {
        window.plugins.socialsharing.shareViaSMS({message: message},
            '0612345678,0687654321', shareSuccessful, shareError
        );
      }
    }, {
      name: 'Share via Email',
      handler: function(message) {
        window.plugins.socialsharing.shareViaEmail(
          message,
          'I just discovered Tabris.js!',
          ['to@person1.com', 'to@person2.com'],
          ['cc@person1.com'],
          null,
          ['http://eclipsesource.com/blogs/wp-content/uploads/2015/10/tabris-icon-logo-small.png'],
          shareSuccessful, shareError
        );
      }
    }
  ];

  var tabs = [
    {
      title: 'ShareSheet',
      description: [
        'Use the platform native sharing capabilities. There are various',
        ' options for sharing a Message, Subject, Image(s) and a Link'
      ].join(''),
      options: shareSheetOptions
    },
    {
      title: 'ShareVia',
      description: [
        'You can also specify the target app for sharing.',
        ' Before you offer users to share via twitter, whatsapp, facebook, sms, email,',
        ' you may want to check that the option is available with',
        " socialsharing.canShareVia('whatsapp' ... )"
      ].join(''),
      options: shareViaOptions
    }
  ];

  new tabris.TextView({
    left: 10, top: ['prev()', 10], right: 10,
    text: 'Text to share:',
    font: '20px'
  }).appendTo(parent);

  var input = new tabris.TextInput({
    left: 10, top: ['prev()', 10], right: 10,
    text: 'Tabris.js - Native mobile apps in JavaScript'
  }).appendTo(parent);

  var scrollContainer = new tabris.ScrollView({
    left: 0, top: ['prev()',16] , right: 0, bottom: 0
  }).appendTo(parent);

  tabs.forEach(function(tabConfig) {
    createSharingSection(tabConfig, scrollContainer);
  });

  function createSharingSection(tabConfig, target) {
    new tabris.TextView({
      left: 10, top: ['prev()',6], right: 10,
      text: tabConfig.title + ' options', font: '20px'
    }).appendTo(target);

    new tabris.TextView({
      left: 10, top: ['prev()', 2], right: 10,
      text: tabConfig.description, font: '14px'
    }).appendTo(target);

    tabConfig.options.forEach(function(sharingOption) {
      new tabris.Button({
        left: 10, top: ['prev()', 10], right: 10,
        text: sharingOption.name
      }).appendTo(target).on('select', function() {
        var message = input.text;
        sharingOption.handler(message);
      });
    });

    new tabris.Composite({left: 0, top: ['prev()',30] , right: 0}).appendTo(target);
  }
});

module.exports = page;

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
