/*global $:true */
// jQuery built with "grunt custom:-ajax/script,-ajax/jsonp,-css,-deprecated,-dimensions,-effects,-event,-event/alias,-offset,-wrap,-ready,-deferred,-exports/amd,-sizzle"
// https://github.com/jquery/jquery#how-to-build-your-own-jquery
tabris.load(function() {

  var MARGIN = 12;
  var lastLabel;

  var page = tabris.create("Page", {
    title: "XMLHttpRequest",
    topLevel: true
  });

  var createLabel = function(labelText) {
    lastLabel = tabris.create("Label", {
      text: labelText,
      markupEnabled: true,
      layoutData: {left: MARGIN, right: MARGIN, top: [lastLabel, MARGIN]}
    });
    page.append(lastLabel);
  };

  $.getJSON("http://www.telize.com/geoip", function(json) {
    createLabel("The IP address is: " + json.ip);
    createLabel("Latitude: " + json.latitude);
    createLabel("Longitude: " + json.longitude);
  });

  $.getJSON("https://data.itpir.wm.edu/deflate/api.php?val=100USD1986USA&json=true", function(json) {
    createLabel("Value of 1986 100$ today: " + json.deflated_amount + "$");
  });

  $.getJSON("http://api.automeme.net/text.json", function(json) {
    createLabel("Meme: " + json[0]);
  });

  page.open();

});
