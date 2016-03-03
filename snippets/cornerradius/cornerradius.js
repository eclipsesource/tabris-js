var page = tabris.create("Page", {
  title: "Corner Radius",
  topLevel: true,
  background: "#cccccc"
});

tabris.create("Composite", {
  width: 128, height: 128, centerX: 0, centerY: 0,
  background: "white",
  cornerRadius: 8,
  elevation: 8
}).appendTo(page);

page.open();
