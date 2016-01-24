/* globals fetch: false, Promise: true*/
Promise = require("promise");
require("whatwg-fetch");

var page = tabris.create("Page", {
  title: "XMLHttpRequest via fetch()",
  topLevel: true
});

var createTextView = function(text) {
  tabris.create("TextView", {
    text: text,
    markupEnabled: true,
    layoutData: {left: 16, right: 16, top: "prev() 12"},
    class: "location-data"
  }).appendTo(page);
};

var reloadButton;

var loadData = function(){
  var activityIndicator = tabris.create("ActivityIndicator").appendTo(page);
  page.children(".location-data").dispose();
  page.children(".reload-button").dispose();


  fetch("https://freegeoip.net/json/").then(function(response) {
    return response.json();
  }).then(function(json) {
    // Hide the loader
    activityIndicator.dispose();

    // Show the result data
    createTextView("The IP address is: " + json.ip);
    createTextView("City: " + json.city);
    createTextView("Country: " + json.country_name);
    createTextView("Latitude: " + json.latitude);
    createTextView("Longitude: " + json.longitude);

    // Init the reload button
    reloadButton = tabris.create("Button", {
      layoutData: {left: 16, right: 16, top: "prev() 12"},
      text: "Reload Geo-Data",
      class: "reload-button"
    }).on("select", function() {
      loadData();
    }).appendTo(page);
  });
}

page.open();
loadData();



