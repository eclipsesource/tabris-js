var families = ["sans-serif", "serif", "condensed", "monospace"];
var styles = ["normal", "italic"];
var weights =  ["thin", "light", "normal", "medium", "bold", "black"];

var scrollView = new tabris.ScrollView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(tabris.ui.contentView);

for (var style of styles) {
  for (var family of families) {
    for (var weight of weights) {
      var font = weight + " " + style + " 24px " + family;
      new tabris.TextView({
        left: 16, top: "prev() 24", right: 16,
        text: font
      }).appendTo(scrollView);
      new tabris.TextView({
        left: 16, top: "prev() 8", right: 16,
        text: "Sphinx of black quartz, judge my vow",
        font: font
      }).appendTo(scrollView);
    }
  }
}
