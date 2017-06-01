const {Composite, Page, TextView, WebView, ui} = require('tabris');

module.exports = class PluginPage extends Page {

  constructor(properties) {
    super(Object.assign({autoDispose: false}, properties));
    this.createUI();
    this.applyLayout();
    this.applyStyles();
  }

  createUI() {
    this.append(
      new TextView({id: 'pluginIdLabel', text: 'Plugin: ' + this.pluginId})
        .on('tap', () => this._openPluginInfoPage()),
      this.content = new Composite()
    );
  }

  _openPluginInfoPage() {
    ui.find('NavigationView').first().append(
      new Page({title: 'Plugin Info'}).append(
        new WebView({
          left: 0, top: 0, right: 0, bottom: 0,
          url: 'https://www.npmjs.com/package/' + this.pluginId
        })
      )
    );
  }

  set pluginId(id) {
    this._pluginId = this._pluginId || id;
  }

  get pluginId() {
    return this._pluginId;
  }

  applyLayout() {
    this.find('#pluginIdLabel').set({left: 16, top: 16, right: 16});
    this.content.set({left: 0, top: 'prev() 8', right: 0, bottom: 0});
  }

  applyStyles() {
    this.find('#pluginIdLabel').first().textColor = 'rgb(22, 126, 251)';
  }
};
