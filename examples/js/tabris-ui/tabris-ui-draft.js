/*jshint unused: false */
tabris.load( function() {

  var red = [255, 200, 200];
  var green = [200, 255, 200];
  var blue = [200, 200, 255];

  var createSubPage = function( title, bgColor ) {
    var page = tabris.createPage({
      title: title,
      topLevel: false,
      background: bgColor
    });
    var label = page.append( "Label", {
      layoutData: { left: 10, right: 10, top: 10 },
      text: title
    });
    var openButton = page.append( "Button", {
      text: "open another page",
      layoutData: { left: 10, right: 10, top: [label, 10] }
    }).on( "Selection", function() {
      var subpage = createSubPage( title + "-sub", bgColor );
      subpage.open();
    });
    page.append( "Button", {
      text: "close this page",
      layoutData: { left: 10, right: 10, top: [openButton, 10] }
    }).on( "Selection", function() {
      page.close();
    });

    // Page action
    var pageAction = tabris.createAction({
      title: "Share",
      enabled: true,
      visible: true
    }, function() {});
    page.on( "Dispose", function() {
      pageAction.dispose();
    });

    return page;
  };

  var createToplevelPage = function( title, bgColor ) {
    var page = tabris.createPage({
      title: title,
      topLevel: true,
      background: bgColor
    });
    var label = page.append( "Label", {
      layoutData: { left: 10, right: 10, top: 10 },
      text: title
    });
    var openButton = page.append( "Button", {
      text: "open page",
      layoutData: { left: 10, right: 10, top: [label, 10] }
    }).on( "Selection", function() {
      var subpage = createSubPage( title + "-sub", bgColor );
      subpage.open();
    });
    page.append( "Button", {
      text: "close this page",
      layoutData: { left: 10, right: 10, top: [openButton, 10] }
    }).on( "Selection", function() {
      page.close();
    });
    return page;
  };

  var page1 = createToplevelPage( "Page One", red );
  var page2 = createToplevelPage( "Page Two", green );
  var page3 = createToplevelPage( "Page Three", blue );

  tabris.createAction({ title: "Page3", enabled: true, visible: true }, function( a, b, c ) {
    page3.open();
  });

  page1.open();

});
