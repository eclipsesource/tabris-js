tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Drawing a rectangle on a canvas",
    topLevel: true
  });

  var canvas = tabris.create("Canvas", {
    layoutData: {left: 10, top: 10, right: 10, bottom: 10}
  }).appendTo(page);

  var ctx = tabris.getContext(canvas, 400, 400);
  ctx.fillStyle = "rgb(78, 154,217)";
  ctx.fillRect(20, 20, 150, 100);

  page.open();

});
