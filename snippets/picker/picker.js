var page = tabris.create("Page", {
  title: "Picker",
  topLevel: true
});

var airports = [
  {
    id: "SFO",
    name: "San Francisco"
  },
  {
    id: "TXL",
    name: "Berlin Tegel"
  },
  {
    id: "FRA",
    name: "Frankfurt"
  }
];

tabris.create("Picker", {
  layoutData: {left: 20, top: 20, right: 20},
  items: airports,
  itemText: function(airport) {
    return airport.name;
  },
  selection: airports[1]
}).on("change:selection", function(picker, item) {
  console.log("Selected " + item.id);
}).appendTo(page);

page.open();
