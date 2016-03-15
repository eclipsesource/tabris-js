var page = new tabris.Page({
  title: "XMLHttpRequest via fetch()",
  topLevel: true
});

function createTextView(text) {
  new tabris.TextView({
    text: text,
    markupEnabled: true,
    layoutData: {left: 16, right: 16, top: "prev() 12"},
    class: "locationData"
  }).appendTo(page);
}

function createReloadButton() {
  new tabris.Button({
    layoutData: {left: 16, right: 16, top: "prev() 12"},
    text: "Reload Geo-Data",
    id: "reloadButton"
  }).on("select", loadData).appendTo(page);
}

function loadData() {
  // Dispose existing elements via the class selector
  page.children(".locationData").dispose();
  page.children("#reloadButton").dispose();

  // Create loading indicator
  var activityIndicator = new tabris.ActivityIndicator({centerX: 0, centerY: 0}).appendTo(page);

  // Run async remote request with fetch
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
}

loadData();

page.open();
