var page = tabris.create("Page", {
  title: "Styling with class selector",
  topLevel: true
});

["normal", "interactive", "prio-high", "missing", "prio-high missing"].forEach(function(style) {
  tabris.create("TextView", {
    layoutData: {left: 10, top: "prev() 10"},
    class: style,
    text: "class \"" + style + "\""
  }).appendTo(page);
});

// This example has inline styles. To re-use styles, you can extract them as modules, e.g.
// page.apply(require("../styles.json));
page.apply({
  "TextView": {font: "24px Arial, sans-serif", textColor: "#333"},
  ".interactive": {textColor: "blue"},
  ".prio-high": {font: "bold 24px Arial, Sans-Serif"},
  ".missing": {textColor: "#ccc"}
});
page.open();
