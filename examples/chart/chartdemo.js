const {Button, NavigationView, Page, contentView} = require('tabris');
const ChartPage = require('./ChartPage');
const chartData = require('./chart-data.json');
const pieData = require('./pie-data.json');

const navigationView = new NavigationView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(contentView);

const mainPage = new Page({
  title: 'Chart Example'
}).appendTo(navigationView);

[
  {type: 'Bar', data: chartData},
  {type: 'Line', data: chartData},
  {type: 'Radar', data: chartData},
  {type: 'PolarArea', data: pieData},
  {type: 'Pie', data: pieData},
  {type: 'Doughnut', data: pieData}
].forEach(chart => {
  new Button({
    left: 8, top: 'prev() 8', right: 8,
    text: `${chart.type} Chart`
  }).on('select', () => {
    new ChartPage({chart}).appendTo(navigationView);
  }).appendTo(mainPage);
});
