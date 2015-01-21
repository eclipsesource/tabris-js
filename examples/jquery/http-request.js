// jQuery built with "grunt custom:-ajax/script,-ajax/jsonp,-css,-deprecated,-dimensions,-effects,-event,-event/alias,-offset,-wrap,-ready,-deferred,-exports/amd,-sizzle"
// https://github.com/jquery/jquery#how-to-build-your-own-jquery
var $ = require("./lib/jquery.min.js");

var MARGIN = 12;

var page = tabris.create("Page", {
  title: "XMLHttpRequest",
  topLevel: true
});

var createLabel = function(labelText) {
  tabris.create("Label", {
    text: labelText,
    markupEnabled: true,
    layoutData: {left: MARGIN, right: MARGIN, top: [page.children().last() || 0, MARGIN]}
  }).appendTo(page);
};

$.getJSON("http://www.telize.com/geoip", function(json) {
  createLabel("The IP address is: " + json.ip);
  createLabel("Latitude: " + json.latitude);
  createLabel("Longitude: " + json.longitude);
});

page.open();
