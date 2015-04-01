createPage("Page 1").open();
createPage("Page 2");

var drawer = tabris.create("Drawer");

tabris.create("ImageView", {
  image: "images/cover.jpg",
  scaleMode: "fill",
  layoutData: {left: 0, right: 0, top: 0, height: 200}
}).appendTo(drawer);

tabris.create("PageSelector", {
  layoutData: {left: 0, top: 200, right: 0, bottom: 0}
}).appendTo(drawer);

function createPage(title) {
  var page = tabris.create("Page", {
    title: title,
    image: "images/page.png",
    topLevel: true
  });
  tabris.create("Button", {
    text: "Create another page",
    layoutData: {left: 20, right: 20, top: 20}
  }).on("select", function() {
    createPage("Another Page");
  }).appendTo(page);
  return page;
}
