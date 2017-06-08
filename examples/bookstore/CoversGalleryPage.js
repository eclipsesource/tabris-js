const {Page, WebView, ui} = require('tabris');

const TITLE = 'Book covers gallery';
const WEB_PAGE_URL = 'https://www.flickr.com/photos/ajourneyroundmyskull/sets/72157626894978086/';

module.exports = class CoversGalleryPage extends Page {

  constructor(properties) {
    super(Object.assign({title: TITLE}, properties));
    this._createUI();
    this._applyLayout();
    this.on('appear', () => ui.find('#aboutAction').first().visible = false);
  }

  _createUI() {
    this.append(
      new WebView({url: WEB_PAGE_URL})
    );
  }

  _applyLayout() {
    this.find('WebView').set({left: 0, right: 0, top: 0, bottom: 0});
  }

};
