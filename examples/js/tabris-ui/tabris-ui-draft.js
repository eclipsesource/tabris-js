/*jshint unused: false */

var red = [255, 200, 200];
var green = [200, 255, 200];
var blue = [200, 200, 255];

var createSubPage = function( title, bgColor ) {
  var page = Tabris.createPage( title, false );
  page.set( "background", bgColor );
  var label = page.append( "Label", {
    layoutData: { left: 10, right: 10, top: 10 },
    text: title
  });
  var closeButton = page.append( "Button", {
    text: "close this page",
    layoutData: { left: 10, right: 10, top: [label, 10] }
  });
  closeButton.on( "Selection", function() {
    page.close();
  });
  var openButton = page.append( "Button", {
    text: "open another page",
    layoutData: { left: 10, right: 10, top: [closeButton, 10] }
  });
  openButton.on( "Selection", function() {
    var subpage = createSubPage( title + "-sub", bgColor );
    subpage.open();
  });
  return page;
};

var createToplevelPage = function( title, bgColor ) {
  var page = Tabris.createPage( title, true );
  page.set( "background", bgColor );
  var label = page.append( "Label", {
    layoutData: { left: 10, right: 10, top: 10 },
    text: title
  });
  var button = page.append( "Button", {
    text: "open page",
    layoutData: { left: 10, right: 10, top: [label, 10] }
  });
  button.on( "Selection", function() {
    var subpage = createSubPage( title + "-sub", bgColor );
    subpage.open();
  });
  return page;
};

var page1 = createToplevelPage( "Page One", red );
var page2 = createToplevelPage( "Page Two", green );
var page3 = createToplevelPage( "Page Three", blue );

page1.open();
