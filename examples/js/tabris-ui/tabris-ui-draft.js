/*jshint unused: false */

var createPage = function( name, bgColor, topLevel ) {
  var page = Tabris.create( "tabris.Page", {
    title: name,
    topLevel: topLevel
  });
  page.parent.set( "background", bgColor );
  page.parent.append( "rwt.widgets.Label", {
    bounds: [20, 85, 185, 35],
    text: name
  });
  return page;
};

var page1 = createPage( "Page One", [255, 200, 200], true );
var page2 = createPage( "Page Two", [200, 255, 200], true );
var page3 = createPage( "Page Three", [200, 200, 255], true );

Tabris.UI.set( "activePage", page1.id );
