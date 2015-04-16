var PluginPage = function(pageName, pluginId, createCallback) {
  this.pageName = pageName;
  this.pluginId = pluginId;
  this.createCallback = createCallback;
};

PluginPage.prototype.create = function() {

  this.page = tabris.create("Page", {
    title: this.pageName,
    topLevel: true
  });

  tabris.create("TextView", {
    text: "Plugin: " + this.pluginId,
    layoutData: {left: 10, top: 10, right: 10},
    textColor: "rgb(22, 126, 251)"
  }).on("tap", function() {
    tabris.create("Page", {title: "Plugin Info"}).append(
      tabris.create("WebView", {
        layoutData: {left: 0, top: 0, right: 0, bottom: 0},
        url: "http://plugins.cordova.io/#/package/" + this.pluginId
      })
    ).open();
  }, this).appendTo(this.page);

  var content = tabris.create("Composite", {
    layoutData: {left: 10, top: [this.page.children().last(), 10], right: 10, bottom: 0}
  }).appendTo(this.page);

  this.createCallback(content);
  return this;
};

PluginPage.prototype.open = function() {
  this.page.open();
  return this;
};

module.exports = PluginPage;
