var columnCountTextView = new tabris.TextView({
  bottom: 16, right: 16, width: 32,
  font: "bold 14px"
}).appendTo(tabris.ui.contentView);

var slider = new tabris.Slider({
  left: 16, bottom: 0, right: [columnCountTextView, 16], height: 48,
  minimum: 1,
  maximum: 8
}).on("change:selection", function(slider, selection) {
  collectionView.set("columnCount", selection);
  columnCountTextView.set("text", selection);
}).appendTo(tabris.ui.contentView);

var collectionView = new tabris.CollectionView({
  left: 0, top: 0, right: 0, bottom: slider,
  items: createItems(),
  itemHeight: 128,
  initializeCell: function(cell) {
    var textView = new tabris.TextView({
      top: 0, bottom: 0, left: 0, right: 0,
      font: "bold 32px",
      textColor: "#555555",
      alignment: "center",
      maxLines: 1
    }).appendTo(cell);
    cell.on("change:item", function(cell, item) {
      textView.set({
        text: item,
        background: item % 2 === 0 ? "#CFD8DC" : "#ffffff"
      });
    });
  }
}).appendTo(tabris.ui.contentView);

slider.set("selection", 3);

function createItems() {
  var items = [];
  for (var i = 1; i <= 100; i++) {
    items.push(i);
  }
  return items;
}
