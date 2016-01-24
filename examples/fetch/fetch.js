/* globals fetch: false, Promise: true*/
Promise = require("promise");
require("whatwg-fetch");

var reloadButton, loadData, createReloadButton, createTextView;
var page = tabris.create("Page", {
  title: "XMLHttpRequest via fetch()",
  topLevel: true
});

createTextView = function(text) {
  tabris.create("TextView", {
    text: text,
    markupEnabled: true,
    layoutData: {left: 16, right: 16, top: "prev() 12"},
    class: "location-data"
  }).appendTo(page);
};

createReloadButton = function() {
  reloadButton = tabris.create("Button", {
    layoutData: {left: 16, right: 16, top: "prev() 12"},
    text: "Reload Geo-Data",
    class: "reload-button"
  }).on("select", function() {
    loadData();
  }).appendTo(page);
};

loadData = function() {
  // Dispose existing elements via the class selector
  page.children(".location-data").dispose();
  page.children(".reload-button").dispose();

  // Create loading indicator
  var activityIndicator = tabris.create("ActivityIndicator").appendTo(page);

  fetch("https://freegeoip.net/json/").then(function(response) {
    return response.json();
  }).catch(function(err) {

    // On error show want went wrong and reload button.
    createTextView("Failure: " + err || "Error loading geo-data");
    createReloadButton();
  }).then(function(json) {

    // Dispose of the activity loader via direct reference
    activityIndicator.dispose();

    // Show the result location data
    createTextView("The IP address is: " + json.ip);
    createTextView("City: " + json.city);
    createTextView("Country: " + json.country_name);
    createTextView("Latitude: " + json.latitude);
    createTextView("Longitude: " + json.longitude);

    // Create the reload button
    createReloadButton();
  });
};

page.open();
loadData();
