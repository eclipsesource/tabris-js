tabris.registerType("AppLauncher", {
  _type: "tabris.AppLauncher"
});

tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Geo Location Example",
    topLevel: true
  });

  var locationLabel = tabris.create("Label", {
    layoutData: {left: 20, right: 20, top: 20, height: 80}
  });

  var locationButton = tabris.create("Button", {
    text: "Where am I?",
    layoutData: {left: 10, right: 10, top: [locationLabel, 10]}
  });

  var mapButton = tabris.create("Button", {
    text: "Show on map",
    layoutData: {left: 10, right: 10, top: [locationButton, 10]}
  });

  page.append(locationLabel, locationButton, mapButton);

  locationButton.on("selection", function() {
    geo.set({
      needsPosition: "ONCE",
      frequency: 10000,
      maximumAge: -1,
      highAccuracy: true
    });
  });

  mapButton.on("selection", function() {
    launcher.call("open", {
      app: "MAPS",
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString()
    });
  });

  var location = null;

  var geo = tabris("tabris.Geolocation");
  geo.on("LocationUpdate", function(event) {
    location = event;
    showLocation();
  });

  var launcher = tabris.create("AppLauncher");

  function showLocation() {
    locationLabel.set("text", locationToString(location));
    mapButton.set("enabled", location !== null);
  }

  function locationToString(location) {
    if (location === null) {
      return "Location unknown";
    }
    return "Your location: " + location.latitude.toFixed(3) + ", " + location.longitude.toFixed(3);
  }

  showLocation();
  page.open();

});
