var Chart = require('chart.js/Chart.min.js');

var MARGIN_SMALL = 8;
var MARGIN = 16;

var navigationView = new tabris.NavigationView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(tabris.ui.contentView);

var mainPage = new tabris.Page({
  title: 'Chart Example'
}).appendTo(navigationView);

var data = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'My First dataset',
      fillColor: 'rgba(220,220,220,0.2)',
      strokeColor: 'rgba(220,220,220,1)',
      pointColor: 'rgba(220,220,220,1)',
      pointStrokeColor: '#fff',
      pointHighlightFill: '#fff',
      pointHighlightStroke: 'rgba(220,220,220,1)',
      data: [65, 59, 80, 81, 56, 55, 40]
    },
    {
      label: 'My Second dataset',
      fillColor: 'rgba(151,187,205,0.2)',
      strokeColor: 'rgba(151,187,205,1)',
      pointColor: 'rgba(151,187,205,1)',
      pointStrokeColor: '#fff',
      pointHighlightFill: '#fff',
      pointHighlightStroke: 'rgba(151,187,205,1)',
      data: [28, 48, 40, 19, 86, 27, 90]
    }
  ]
};

var pieData = [
  {
    value: 300,
    color: '#F7464A',
    highlight: '#FF5A5E',
    label: 'Red'
  },
  {
    value: 50,
    color: '#46BFBD',
    highlight: '#5AD3D1',
    label: 'Green'
  },
  {
    value: 100,
    color: '#FDB45C',
    highlight: '#FFC870',
    label: 'Yellow'
  },
  {
    value: 40,
    color: '#949FB1',
    highlight: '#A8B3C5',
    label: 'Grey'
  },
  {
    value: 120,
    color: '#4D5360',
    highlight: '#616774',
    label: 'Dark Grey'
  }
];

[
  {type: 'Bar', data: data},
  {type: 'Line', data: data},
  {type: 'Radar', data: data},
  {type: 'PolarArea', data: pieData},
  {type: 'Pie', data: pieData},
  {type: 'Doughnut', data: pieData}
].forEach(function(chart) {
  addPageSelector(createPage(chart));
});

function createPage(chart) {
  var page = new tabris.Page({
    title: chart.type + ' Chart',
    autoDispose: false
  });
  var button = new tabris.Button({
    text: 'Draw graph',
    layoutData: {left: MARGIN, top: MARGIN}
  }).appendTo(page);
  var checkboxAnimate = new tabris.CheckBox({
    text: 'Animate',
    layoutData: {right: MARGIN, left: [button, MARGIN], baseline: button}
  }).appendTo(page);
  var canvas = new tabris.Canvas({
    layoutData: {left: MARGIN, top: [button, MARGIN], right: MARGIN, bottom: MARGIN}
  }).appendTo(page);
  var createCanvasContext = function() {
    var bounds = canvas.bounds;
    var width = bounds.width;
    var height = Math.min(bounds.height, width);
    return canvas.getContext('2d', width, height);
  };
  button.on('select', function() {
    var ctx = createCanvasContext();
    // workaround for scaling to native pixels by chart.js
    ctx.scale(1 / window.devicePixelRatio, 1 / window.devicePixelRatio);
    new Chart(ctx)[chart.type](chart.data, {
      animation: checkboxAnimate.selection,
      showScale: true,
      showTooltips: false,
      scaleShowLabels: true
    });
  });
  return page;
}

function addPageSelector(page) {
  new tabris.Button({
    left: MARGIN_SMALL, top: ['prev()', MARGIN_SMALL],
    text: page.title
  }).on('select', function() {page.appendTo(navigationView);}).appendTo(mainPage);
}
