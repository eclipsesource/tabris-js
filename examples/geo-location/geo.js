tabris.load(function() {

  var page = tabris.createPage({
    title: "Geo Location Example",
    topLevel: true
  });

  var location = null;

  var geo = tabris( "tabris.Geolocation" );
  geo.on( "LocationUpdate", function( event ) {
    location = event;
    showLocation();
  });

  var launcher = tabris.create( "tabris.AppLauncher" );

  function showLocation() {
    locationLabel.set( "text", locationToString( location ) );
    mapButton.set( "enabled", location !== null );
  }

  function locationToString( location ) {
    if( location === null ) {
      return "Location unknown";
    }
    return "Your location: " + location.latitude.toFixed( 3 ) + ", " + location.longitude.toFixed( 3 );
  }

  var locationLabel = page.append( "Label", {
    layoutData: { left: 20, right: 20, top: 20, height: 80 }
  });

  var locationButton = page.append( "Button", {
    text: "Where am I?",
    layoutData: { left: 10, right: 10, top: [locationLabel, 10] }
  }).on( "selection", function() {
    geo.set({
      "needsPosition": "ONCE",
      "frequency": 10000,
      "maximumAge": -1,
      "highAccuracy": true
    });
  });

  var mapButton = page.append( "Button", {
    text: "Show on map",
    layoutData: { left: 10, right: 10, top: [locationButton, 10] }
  }).on("selection", function() {
    launcher.call( "open", {
      "app": "MAPS",
      "latitude": location.latitude.toString(),
      "longitude": location.longitude.toString()
    });
  });

  showLocation();
  page.open();

});
