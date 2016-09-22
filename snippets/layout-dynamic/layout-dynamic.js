new tabris.Composite({id: "red", background: "red"}).appendTo(tabris.ui.contentView);
new tabris.Composite({id: "green", background: "green"}).appendTo(tabris.ui.contentView);
new tabris.Composite({id: "blue", background: "blue"}).appendTo(tabris.ui.contentView);
new tabris.Composite({id: "yellow", background: "yellow"}).appendTo(tabris.ui.contentView);
new tabris.Composite({id: "purple", background: "purple"}).appendTo(tabris.ui.contentView);

tabris.ui.contentView.on("resize", function(page, bounds) {
  tabris.ui.contentView.apply(require("./layout-" + (bounds.width > bounds.height ? "landscape" : "portrait")));
});
