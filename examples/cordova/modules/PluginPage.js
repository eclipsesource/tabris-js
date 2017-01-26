var PluginPage = function(pageName, pluginId, createCallback) {
  this.pageName = pageName;
  this.pluginId = pluginId;
  this.createCallback = createCallback;
};

PluginPage.prototype.create = function() {

  this.page = new tabris.Page({
    title: this.pageName,
    autoDispose: false
  });

  new tabris.TextView({
    text: 'Plugin: ' + this.pluginId,
    layoutData: {left: 10, top: 10, right: 10},
    textColor: 'rgb(22, 126, 251)'
  }).on('tap', function() {
    new tabris.Page({title: 'Plugin Info'}).append(
      new tabris.WebView({
        layoutData: {left: 0, top: 0, right: 0, bottom: 0},
        url: 'http://plugins.cordova.io/#/package/' + this.pluginId
      })
    ).open();
  }, this).appendTo(this.page);

  var content = new tabris.Composite({
    layoutData: {left: 10, top: 'prev() 10', right: 10, bottom: 0}
  }).appendTo(this.page);

  this.createCallback(content);
  return this;
};

PluginPage.prototype.open = function() {
  this.page.open();
  return this;
};

module.exports = PluginPage;
