var Chart = require("chart.js/Chart.min.js");

var MARGIN = 16;

var data = {
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [
    {
      label: "My First dataset",
      fillColor: "rgba(220,220,220,0.2)",
      strokeColor: "rgba(220,220,220,1)",
      pointColor: "rgba(220,220,220,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(220,220,220,1)",
      data: [65, 59, 80, 81, 56, 55, 40]
    },
    {
      label: "My Second dataset",
      fillColor: "rgba(151,187,205,0.2)",
      strokeColor: "rgba(151,187,205,1)",
      pointColor: "rgba(151,187,205,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(151,187,205,1)",
      data: [28, 48, 40, 19, 86, 27, 90]
    }
  ]
};

var pieData = [
  {
    value: 300,
    color: "#F7464A",
    highlight: "#FF5A5E",
    label: "Red"
  },
  {
    value: 50,
    color: "#46BFBD",
    highlight: "#5AD3D1",
    label: "Green"
  },
  {
    value: 100,
    color: "#FDB45C",
    highlight: "#FFC870",
    label: "Yellow"
  },
  {
    value: 40,
    color: "#949FB1",
    highlight: "#A8B3C5",
    label: "Grey"
  },
  {
    value: 120,
    color: "#4D5360",
    highlight: "#616774",
    label: "Dark Grey"
  }
];

createPage("Bar", data).open();
createPage("Line", data);
createPage("Radar", data);
createPage("PolarArea", pieData);
createPage("Pie", pieData);
createPage("Doughnut", pieData);

tabris.create("Drawer").append(tabris.create("PageSelector"));

function createPage(chartType, chartData) {
  var page = tabris.create("Page", {
    title: chartType + " Chart",
    topLevel: true
  });
  var button = tabris.create("Button", {
    text: "Draw graph",
    layoutData: {left: MARGIN, top: MARGIN}
  }).appendTo(page);
  var checkboxAnimate = tabris.create("CheckBox", {
    text: "Animate",
    layoutData: {right: MARGIN, left: [button, MARGIN], baseline: button}
  }).appendTo(page);
  var canvas = tabris.create("Canvas", {
    layoutData: {left: MARGIN, top: [button, MARGIN], right: MARGIN, bottom: MARGIN}
  }).appendTo(page);
  var createCanvasContext = function() {
    var bounds = canvas.get("bounds");
    var width = bounds.width;
    var height = Math.min(bounds.height, width);
    return canvas.getContext("2d", width, height);
  };
  button.on("select", function() {
    var ctx = createCanvasContext();
    // workaround for scaling to native pixels by chart.js
    ctx.scale(1 / window.devicePixelRatio, 1 / window.devicePixelRatio);
    new Chart(ctx)[chartType](chartData, {
      animation: checkboxAnimate.get("selection"),
      showScale: true,
      showTooltips: false,
      scaleShowLabels: true
    });
  });
  return page;
}
